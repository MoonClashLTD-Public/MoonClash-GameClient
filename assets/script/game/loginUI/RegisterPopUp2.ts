import { _decorator, Component, Label, log } from 'cc';
import { Message } from '../../core/common/event/MessageManager';
import { tips } from '../../core/gui/prompt/TipsManager';
import { oops } from '../../core/Oops';
import { DefBottonCom } from '../common/com/DefBottonCom';
import { MyEditBox } from '../common/com/EditBox/MyEditBox';
import { GameEvent } from '../common/config/GameEvent';
import { AwsManger } from '../data/awsManger';
import { DataEvent } from '../data/dataEvent';
const { ccclass, property } = _decorator;

@ccclass('RegisterPopUp2')
export class RegisterPopUp2 extends Component {
    @property(Label)
    private emailLb: Label = null;
    @property(MyEditBox)
    private smsCodeEdit: MyEditBox = null;
    @property(MyEditBox)
    private inviteCodeEdit: MyEditBox = null;
    @property(DefBottonCom)
    private goNext: DefBottonCom = null;

    start() {
        this.smsCodeEdit.addListeners({
            textChange: () => this.checkBtnStatus(),
            btnClick: {
                autoCode: true,
                sendCode: () => AwsManger.getInstance().onRetrySMSCode(this.params.email)
            }
        })
    }

    private params: IAddRegisterPop2
    public onAdded(params: IAddRegisterPop2) {
        this.addEvent()
        this.emailLb.string = params.email
        this.params = params
        this.checkBtnStatus()
    }
    public onRemoved() {
        this.removeEvent();
    }
    addEvent() {
        Message.on(GameEvent.AWTLoginAuthSuccess, this.closeAction, this);
        Message.on(DataEvent.AWS_SERVER_REQ_TOKEN, this.closeClick, this);
    }

    removeEvent() {
        Message.off(GameEvent.AWTLoginAuthSuccess, this.closeAction, this);
        Message.off(DataEvent.AWS_SERVER_REQ_TOKEN, this.closeClick, this);
    }
    private checkBtnStatus() {
        let checked = true
        if (!this.smsCodeEdit.isMather) checked = false
        this.goNext?.setEnable(checked)
    }

    private async confirm() {
        const smsCode = this.smsCodeEdit.getInputStr()
        const inviteCode = this.inviteCodeEdit.getInputStr() || ''
        if (smsCode.length != 0) {
            await AwsManger.getInstance().onConfirmSMSCode(this.params.email, this.params.pwd, smsCode, inviteCode)
        }
    }

    private closeClick() {
        this.closeAction()
        this.params.closeFun && this.params.closeFun()
    }

    private closeAction() {
        oops.gui.removeByNode(this.node, true);
    }
}

export interface IAddRegisterPop2 {
    email: string;
    pwd: string
    closeFun?: Function
}

