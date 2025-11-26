import { _decorator, Component, Toggle, Button, Sprite } from 'cc';
import { Message } from '../../core/common/event/MessageManager';
import { tips } from '../../core/gui/prompt/TipsManager';
import { oops } from '../../core/Oops';
import { DefBottonCom } from '../common/com/DefBottonCom';
import { MyEditBox } from '../common/com/EditBox/MyEditBox';
import { GameEvent } from '../common/config/GameEvent';
import { UIID } from '../common/config/GameUIConfig';
import { AwsManger } from '../data/awsManger';
import { DataEvent } from '../data/dataEvent';
import { IAddRegisterPop2 } from './RegisterPopUp2';
const { ccclass, property } = _decorator;

@ccclass('RegisterPopUp1')
export class RegisterPopUp1 extends Component {
    @property(MyEditBox)
    private emailEdit: MyEditBox = null;
    @property(MyEditBox)
    private pwdEditBox: MyEditBox = null;
    @property(Toggle)
    private checked: Toggle = null;
    @property(DefBottonCom)
    private goNext: DefBottonCom = null;
    start() {
        this.emailEdit.addListener(() => this.checkBtnStatus())
        this.pwdEditBox.addListener(() => this.checkBtnStatus())
    }

    public onAdded() {
        this.addEvent()
        this.checkBtnStatus()
    }
    public onRemoved() {
        this.removeEvent();
    }
    addEvent() {
        Message.on(GameEvent.AWTLoginAuthSuccess, this.closeClick, this);
        Message.on(DataEvent.AWS_SERVER_REQ_TOKEN, this.closeClick, this);
    }

    removeEvent() {
        Message.off(GameEvent.AWTLoginAuthSuccess, this.closeClick, this);
        Message.off(DataEvent.AWS_SERVER_REQ_TOKEN, this.closeClick, this);
    }

    private checkBtnStatus() {
        let checked = this.checked.isChecked || false
        if (!this.emailEdit.isMather) {
            checked = false
        }

        if (!this.pwdEditBox.isMather) {
            checked = false
        }
        this.goNext?.setEnable(checked)
    }


    private async confirm() {
        const email = this.emailEdit.getInputStr()
        const pwd = this.pwdEditBox.getInputStr()
        if (email.length != 0 && pwd.length != 0) {
            const ok = await AwsManger.getInstance().onRegister(email, pwd)
            if (ok?.code == 'CheckSmsCode') {
                oops.gui.open<IAddRegisterPop2>(UIID.RegisterPopUp2,
                    {
                        email: email,
                        pwd: pwd,
                        closeFun: () => this.closeClick()
                    }
                );
            } else if (ok?.code == 'UserNotConfirmedException') {
                const ok = await AwsManger.getInstance().onRetrySMSCode(email)
                if (ok) {
                    oops.gui.open<IAddRegisterPop2>(UIID.RegisterPopUp2, {
                        email: email,
                        pwd: pwd
                    })
                }
            }
        }
    }

    private clickTermsOfService() {
        oops.gui.open(UIID.TermsOfServicePopUp);
    }

    private closeClick() {
        oops.gui.removeByNode(this.node, true);
    }
}

