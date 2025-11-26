import { _decorator, Component } from 'cc';
import { Message } from '../../core/common/event/MessageManager';
import { tips } from '../../core/gui/prompt/TipsManager';
import { oops } from '../../core/Oops';
import { DefBottonCom } from '../common/com/DefBottonCom';
import { MyEditBox } from '../common/com/EditBox/MyEditBox';
import { GameEvent } from '../common/config/GameEvent';
import { AwsManger } from '../data/awsManger';
const { ccclass, property } = _decorator;

@ccclass('PwdResetPopUp1')
export class PwdResetPopUp1 extends Component {
    @property(MyEditBox)
    private emailEdit: MyEditBox = null;
    @property(MyEditBox)
    private smsCodeEdit: MyEditBox = null;
    @property(MyEditBox)
    private pwdEdit: MyEditBox = null;
    @property(DefBottonCom)
    private goNext: DefBottonCom = null;

    start() {
        this.emailEdit.addListener(() => this.checkBtnStatus())
        this.smsCodeEdit.addListeners({
            textChange: () => this.checkBtnStatus(),
            btnClick: {
                canClick: async () => {
                    const ok = this.emailEdit.isMather
                    if (!ok) tips.errorTip("input_err_email_tip", true)
                    return ok
                },
                sendCode: () => {
                    if (this.emailEdit.isMather) {
                        let email = this.emailEdit.getInputStr()
                        AwsManger.getInstance().onForgetPassword(email)
                    }
                }
            }
        })
        this.pwdEdit.addListener(() => this.checkBtnStatus())
    }

    public onAdded(params?: IPwdResetPopConfig) {
        this.addEvent()
        this.checkBtnStatus()

        const email = params?.email
        if (email) {
            this.emailEdit.setInputMatherStr(email)
            // if (this.emailEdit.isMather) {
            //     let email = this.emailEdit.getInputStr()
            //     AwsManger.getInstance().onForgetPassword(email)
            // }
        }
    }

    public onRemoved() {
        this.removeEvent();
    }
    addEvent() {
        Message.on(GameEvent.AWTLoginAuthSuccess, this.closeClick, this);
    }

    removeEvent() {
        Message.off(GameEvent.AWTLoginAuthSuccess, this.closeClick, this);
    }

    private checkBtnStatus() {
        let checked = true
        if (!this.emailEdit.isMather) {
            checked = false
        }
        if (!this.smsCodeEdit.isMather) {
            checked = false
        }
        if (!this.pwdEdit.isMather) {
            checked = false
        }
        this.goNext?.setEnable(checked)
    }



    private async confirm() {
        const email = this.emailEdit.getInputStr()
        const smsCode = this.smsCodeEdit.getInputStr()
        const pwd = this.pwdEdit.getInputStr()
        const ok = await AwsManger.getInstance().onForgetToConfirmPwd(
            email,
            smsCode,
            pwd)
        if (ok) {

        }
    }

    private closeClick() {
        oops.gui.removeByNode(this.node, true);
    }
}

export interface IPwdResetPopConfig {
    email?: string;
}

