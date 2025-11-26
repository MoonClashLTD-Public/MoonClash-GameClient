import { _decorator, Component, Node, EditBox, log, Event, Label } from 'cc';
import { oops } from '../../core/Oops';
import { MyEditBox } from '../common/com/EditBox/MyEditBox';
import { AwsManger } from '../data/awsManger';
import { DefBottonCom } from '../common/com/DefBottonCom';
const { ccclass, property } = _decorator;

@ccclass('SettingPwdPopUp')
export class SettingPwdPopUp extends Component {
    @property(MyEditBox)
    private pwdEdit: MyEditBox = null
    @property(Label)
    private emailLb: Label = null
    @property(DefBottonCom)
    private btn: DefBottonCom = null
    start() {
        this.pwdEdit.addListener(() => this.checkBtnStatus())
    }

    update(deltaTime: number) {

    }
    private config: ISettingPwdCfg
    public onAdded(args: ISettingPwdCfg) {
        this.config = args
        this.emailLb.string = args?.email ?? ''
        this.checkBtnStatus()
    }
    private checkBtnStatus() {
        let checked = true
        if (!this.pwdEdit.isMather) checked = false

        if (this.btn.node.active) this.btn?.setEnable(checked)
    }
    public onRemoved() {
    }

    confirm() {
        if (this.pwdEdit.isMather) {
            this.config.confirm && this.config.confirm(this.pwdEdit.getInputStr())
            this.closeClick()
        }

    }

    closeClick() {
        oops.gui.removeByNode(this.node, true);
    }

}
export interface ISettingPwdCfg {
    email:string
    confirm: (input: string) => void
}
