import { _decorator, Component, Label, log } from 'cc';
import { tips } from '../../core/gui/prompt/TipsManager';
import { oops } from '../../core/Oops';
import { CommonUtil } from '../../core/utils/CommonUtil';
import { DefBottonCom } from '../common/com/DefBottonCom';
import { MyEditBox } from '../common/com/EditBox/MyEditBox';
import { AwsManger } from '../data/awsManger';
import { PlayerManger } from '../data/playerManager';
const { ccclass, property } = _decorator;

@ccclass('ChangePwdPopUp')
export class ChangePwdPopUp extends Component {
    @property(MyEditBox)
    private oldPwdEdit: MyEditBox = null;
    @property(MyEditBox)
    private newPwdEdit: MyEditBox = null;
    @property(DefBottonCom)
    private goNext: DefBottonCom = null;

    start() {
        this.oldPwdEdit.addListeners({
            textChange: () => this.checkBtnStatus(),
        })
        this.newPwdEdit.addListeners({
            textChange: () => this.checkBtnStatus(),
        })
    }

    public onAdded() {
        this.checkBtnStatus()
    }

    private checkBtnStatus() {
        let checked = true
        if (!this.oldPwdEdit.isMather) checked = false
        if (!this.newPwdEdit.isMather) checked = false
        this.goNext?.setEnable(checked)
    }

    private async confirm() {
        const oldPwd = this.oldPwdEdit.getInputStr() || ''
        const newPwd = this.newPwdEdit.getInputStr() || ''
        if (oldPwd.length != 0 && newPwd.length != 0) {
            const ok = await AwsManger.getInstance().onChangePassword({ oldPassword: oldPwd, newPassword: newPwd })
            if (ok) {
                oops.gui.toast("tip_change_pwd_ok", true)
                await CommonUtil.waitCmpt(this, 0.3)
                PlayerManger.getInstance().returnToLogin()
            }
        }
    }

    private closeClick() {
        oops.gui.removeByNode(this.node, true);
    }
}

