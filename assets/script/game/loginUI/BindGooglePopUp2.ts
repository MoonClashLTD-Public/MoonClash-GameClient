import { _decorator, Component, Node, Graphics, Label, EditBox } from 'cc';
import { Message } from '../../core/common/event/MessageManager';
import { LanguageLabel } from '../../core/gui/language/LanguageLabel';
import { oops } from '../../core/Oops';
import { MyEditBox } from '../common/com/EditBox/MyEditBox';
import { GameEvent } from '../common/config/GameEvent';
import { DataEvent } from '../data/dataEvent';
import { DefBottonCom } from '../common/com/DefBottonCom';
const { ccclass, property, type } = _decorator;
enum EBindAccountStep {
    InputCode = 'InputCode',
    Success = 'Success'
}

@ccclass('BindGooglePopUp2')
export class BindGooglePopUp2 extends Component {
    @property(LanguageLabel)
    private titleLb: LanguageLabel = null
    @property(Node)
    private inputNode: Node = null
    @property(Node)
    private successNode: Node = null
    @property(MyEditBox)
    private inputCode: MyEditBox = null
    @property(Node)
    private itReturnBtn: Node = null
    @property(DefBottonCom)
    private validationBtn: DefBottonCom = null
    @property(DefBottonCom)
    private unBindBtn: DefBottonCom = null
    private config: IInitGooglePopCfg2
    private step = EBindAccountStep.InputCode
    start() {
        this.inputCode.addListener(() => this.checkBtnStatus())
    }
    onAdded(params: IInitGooglePopCfg2) {
        this.config = params
        this.upView()
        this.checkBtnStatus()
    }

    private upView() {
        const unBind = this.config.gameInUnBind || false
        const bind = this.config.gameInBind || false
        this.inputNode.active = this.step == EBindAccountStep.InputCode
        this.successNode.active = this.step == EBindAccountStep.Success
        let titleDataId = 'bind_verification2_title'
        if (unBind) titleDataId = 'bind_verification2_unbind_title'
        this.itReturnBtn.active = !unBind && !bind
        this.validationBtn.node.active = !unBind
        this.unBindBtn.node.active = unBind
        this.titleLb.dataID = titleDataId
    }

    private checkBtnStatus() {
        let checked = true
        if (!this.inputCode.isMather) checked = false
        
       if(this.validationBtn.node.active) this.validationBtn?.setEnable(checked)
       if(this.unBindBtn.node.active)  this.unBindBtn?.setEnable(checked)
    }

    private sendCodeAction() {
        const str = this.inputCode.getInputStr()
        if (str.length != 0) this.config.sendCode && this.config.sendCode(str)
    }

    private onClosePage() {
        oops.gui.removeByNode(this.node, true)
        this.config.success && this.config.success(this.step == EBindAccountStep.Success)
    }

    private awsOk() {
        this.step = EBindAccountStep.Success
        this.upView()
    }

    onLoad() {
        this.addEvent();
    }

    onDestroy() {
        this.removeEvent();
    }


      
    private addEvent() {
        Message.on(DataEvent.AWS_VERIFY_SOFT_WARE_TOKEN, this.awsOk, this);
        Message.on(GameEvent.AWTLoginAuthSuccess, this.onClosePage, this);
        Message.on(DataEvent.AWS_AUTHENTICATE_USER, this.onClosePage, this);
        Message.on(DataEvent.DATA_SOFTWARE_TOKEN_MFA_CHANGE, this.onClosePage, this);
        Message.on(DataEvent.AWS_SERVER_REQ_TOKEN, this.onClosePage, this);
    }

    private removeEvent() {
        Message.off(DataEvent.AWS_VERIFY_SOFT_WARE_TOKEN, this.awsOk, this);
        Message.off(GameEvent.AWTLoginAuthSuccess, this.onClosePage, this);
        Message.off(DataEvent.AWS_AUTHENTICATE_USER, this.onClosePage, this);
        Message.off(DataEvent.DATA_SOFTWARE_TOKEN_MFA_CHANGE, this.onClosePage, this);
        Message.off(DataEvent.AWS_SERVER_REQ_TOKEN, this.onClosePage, this);
    }

}

export interface IInitGooglePopCfg2 {
    gameInBind?: boolean
    gameInUnBind?: boolean
    sendCode: (code: string) => void
    success: (b: boolean) => void
}

