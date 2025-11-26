import { _decorator, Component, UITransform, Layout, instantiate, Node, v3, tween, Tween, EventTouch, Input, Toggle } from 'cc';
import { Message } from '../../core/common/event/MessageManager';
import { tips } from '../../core/gui/prompt/TipsManager';
import { oops } from '../../core/Oops';
import { CommonUtil } from '../../core/utils/CommonUtil';
import { DefBottonCom } from '../common/com/DefBottonCom';
import { MyEditBox } from '../common/com/EditBox/MyEditBox';
import { GameEvent } from '../common/config/GameEvent';
import { UIID } from '../common/config/GameUIConfig';
import { AwsManger, IAutoLoginAcc } from '../data/awsManger';
import { AutoAcctItem } from './comp/AutoAcctItem';
import { IAddRegisterPop2 } from './RegisterPopUp2';
const { ccclass, property } = _decorator;

@ccclass('LoginPopUp')
export class LoginPopUp extends Component {
    @property(MyEditBox)
    private emailEdit: MyEditBox = null;
    @property(MyEditBox)
    private pwdEdit: MyEditBox = null;
    @property(DefBottonCom)
    private loginBtn: DefBottonCom = null;
    @property(Node)
    private scrollVNode: Node = null;

    @property(Layout)
    private acctLayout: Layout = null;
    @property(Node)
    private autoItem: Node = null;
    @property(Node)
    private toggleIcon: Node = null
    @property(Node)
    private toggleBtn: Node = null

    start() {
        let node = this.node
        node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this, true);
        node.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this, true);
        this.emailEdit.addListener(() => this.checkBtnStatus())
        this.pwdEdit.addListener(() => this.checkBtnStatus())
    }

    onTouchEnd(event: EventTouch) {
        if (!this.scrollVNode.active) return
        if (!this.scrollVNode.getComponent(UITransform).hitTest(event.getLocation()) && !this.toggleBtn.getComponent(UITransform).hitTest(event.getLocation()))
            this.hiddenPop()
    }
    private list: IAutoLoginAcc[] = []
    private initList = false
    public onAdded() {
        this.addEvent();
        this.list = AwsManger.getInstance().getAutoLoginList()
        const ok = this.list.length > 0
        this.toggleBtn.active = ok
        if (ok) {
            const { email, pwd } = this.list[0]
            this.setDefAcc(email, pwd)
        }
        this.upScrollH()
        this.checkBtnStatus()
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
    private async confirm() {
        let email = this.emailEdit.getInputStr()
        let pwd = this.pwdEdit.getInputStr()
        const ret = await AwsManger.getInstance().onLogin({ login: { email: email, pwd: pwd, useCachedCognitoUser: false } })
        if (ret?.code == 'UserNotConfirmedException') {
            const ok = await AwsManger.getInstance().onRetrySMSCode(email)
            if (ok) {
                oops.gui.open<IAddRegisterPop2>(UIID.RegisterPopUp2, {
                    email: email,
                    pwd: pwd
                })
            }
        }
    }

    private setDefAcc(email: string, pwd: string) {
        this.emailEdit.setInputStr(email)
        this.pwdEdit.setInputStr(pwd)
    }

    private checkBtnStatus() {
        let checked = true
        if (!this.emailEdit.isMather) {
            checked = false
        }

        if (!this.pwdEdit.isMather) {
            checked = false
        }
        this.loginBtn?.setEnable(checked)
    }

    private clickForgetPwd() {
        oops.gui.open(UIID.PwdResetPopUp1)
    }

    private closeClick() {
        oops.gui.removeByNode(this.node, true);
    }

    // addClick() {
    //     AwsManger.getInstance().saveAccPwd('123131' + Math.random().toString(), Math.random().toString())
    // }

    // query() {
    //     console.log('LoginList()', AwsManger.getInstance().getAutoLoginList())
    // }

    openAccDia = false
    toogleAcct() {
        this.openAccDia = !this.openAccDia
        const z = this.openAccDia ? -1 : 1
        this.toggleIcon.setScale(v3(z, z, z))
        if (this.openAccDia) {
            if (!this.initList) {
                this.acctLayout.node.destroyAllChildren()
                this.list.forEach(async (data, idx) => {
                    await CommonUtil.waitCmpt(this, 0)
                    const autoitem = instantiate(this.autoItem)
                    autoitem.active = true
                    autoitem.getComponent(AutoAcctItem)?.init({
                        idx: idx,
                        email: data.email,
                        cb: () => {
                            this.setDefAcc(data.email, data.pwd)
                            this.checkBtnStatus()
                            this.openAccDia = false
                            this.scrollVNode.active = false
                            this.toggleIcon.setScale(v3(1, 1, 1))
                        },
                        delCb: () => {
                            AwsManger.getInstance().delAccPwd(data.email)
                            this.acctLayout.node.removeChild(autoitem)
                            this.list.splice(idx, 1)
                            this.upScrollH()
                            if (this.acctLayout.node.children.length == 0) {
                                this.openAccDia = false
                                this.toggleBtn.active = false
                                this.scrollVNode.active = false
                            }
                        }
                    })
                    this.acctLayout.node.addChild(autoitem)
                })
                this.initList = true
            }
            this.scrollVNode.active = true
        } else {
            this.scrollVNode.active = false
        }
    }
    private hiddenPop() {
        if (this.scrollVNode.active) {
            this.openAccDia = false
            this.scrollVNode.active = false
            const z = this.openAccDia ? -1 : 1
            this.toggleIcon.setScale(v3(z, z, z))
        }
    }

    maxH = 325
    itemH = 70
    private upScrollH() {
        const len = this.list.length
        this.scrollVNode.getComponent(UITransform).height = len > 4 ? this.maxH : (this.itemH * len + 10)
    }
}

