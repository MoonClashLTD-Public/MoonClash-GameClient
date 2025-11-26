import { _decorator, Component, Node, EditBox, log, Event, Label } from 'cc';
import { Message } from '../../core/common/event/MessageManager';
import { oops } from '../../core/Oops';
import { MyEditBox } from '../common/com/EditBox/MyEditBox';
import { AwsManger } from '../data/awsManger';
import { DataEvent } from '../data/dataEvent';
const { ccclass, property } = _decorator;

@ccclass('VerifyPwdPopUp')
export class VerifyPwdPopUp extends Component {
    @property(MyEditBox)
    private pwdEdit: MyEditBox = null
    @property(Label)
    private emailLb: Label = null
    start() {
        this.emailLb.string = AwsManger.getInstance().currEmail
    }

    update(deltaTime: number) {

    }
    private config: IInitVerityPwdCfg
    public onAdded(args: IInitVerityPwdCfg) {
        if (!args) throw new Error(`init cfg null --${args}`);
        this.config = args
    }

    public onRemoved() {
    }

    confirm() {
        if (this.pwdEdit.isMather) {
            if (this.config.binded) {
                AwsManger.getInstance().onUnBindMfaInGame(this.pwdEdit.getInputStr())
            } else {
                AwsManger.getInstance().onBindMfaInGame(this.pwdEdit.getInputStr())
            }
        }
    }

    closeClick() {
        oops.gui.removeByNode(this.node, true);
    }

    onLoad() {
        this.addEvent();
    }

    onDestroy() {
        this.removeEvent();
    }


      
    private addEvent() {
        Message.on(DataEvent.DATA_SOFTWARE_TOKEN_MFA_CHANGE, this.closeClick, this);
    }

    private removeEvent() {
        Message.off(DataEvent.DATA_SOFTWARE_TOKEN_MFA_CHANGE, this.closeClick, this);
    }
}
export interface IInitVerityPwdCfg {
    binded: boolean
}
