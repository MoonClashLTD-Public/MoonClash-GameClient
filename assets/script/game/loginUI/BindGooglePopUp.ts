import { _decorator, Component, Node, Graphics, Label, EditBox } from 'cc';
import { Message } from '../../core/common/event/MessageManager';
import { oops } from '../../core/Oops';
import { CommonUtil } from '../../core/utils/CommonUtil';
import { GameEvent } from '../common/config/GameEvent';
import { UIID } from '../common/config/GameUIConfig';
import { DataEvent } from '../data/dataEvent';
const { ccclass, property, type } = _decorator;

@ccclass('BindGooglePopUp')
export class BindGooglePopUp extends Component {
    @type(Graphics)
    private ctx: Graphics = null;
    @type(EditBox)
    private qrEditBox: EditBox = null;
    private qrStr: string = '';
    @property(Node)
    private skipBtn: Node = null

    private config: IInitGooglePopCfg
    onAdded(params: IInitGooglePopCfg) {
        if (!params?.qr) throw new Error("params qr null");
        this.config = params
        this.skipBtn.active = params?.isFristAuth ?? false
        this.upQr()
    }

    upQr() {
        this.node.active = true;
        this.qrStr = `otpauth://totp/DegenGame%3A${this.config.email}?secret=${this.config.qr}&issuer=DegenGame`
        this.qrEditBox.string = this.config.qr;
        CommonUtil.drawQRCode(this.ctx, this.qrStr);
    }

    private copyClick() {
        oops.gui.toast("aws_code_copy", true)
        CommonUtil.copyToClipboard(this.config.qr);
    }

    private nextClick() {
        this.config.next && this.config.next()
    }

    private skipClick() {
        this.config.skip && this.config.skip()
        // this.onClosePage()
    }

    private onClosePage() {
        oops.gui.removeByNode(this.node, true)
    }

    onLoad() {
        this.addEvent()
        this.qrEditBox.enabled = false
    }
    onDestroy() {
        this.removeEvent();
    }
    private addEvent() {
        Message.on(GameEvent.AWTLoginAuthSuccess, this.onClosePage, this);
        Message.on(DataEvent.DATA_SOFTWARE_TOKEN_MFA_CHANGE, this.onClosePage, this);
        Message.on(DataEvent.AWS_VERIFY_SOFT_WARE_TOKEN, this.onClosePage, this);
        Message.on(DataEvent.AWS_SERVER_REQ_TOKEN, this.onClosePage, this);
    }

    private removeEvent() {
        Message.off(GameEvent.AWTLoginAuthSuccess, this.onClosePage, this);
        Message.off(DataEvent.DATA_SOFTWARE_TOKEN_MFA_CHANGE, this.onClosePage, this);
        Message.off(DataEvent.AWS_VERIFY_SOFT_WARE_TOKEN, this.onClosePage, this);
        Message.off(DataEvent.AWS_SERVER_REQ_TOKEN, this.onClosePage, this);
    }
}

export interface IInitGooglePopCfg {
      
    isFristAuth?: boolean
    email: string
    qr: string
    next: Function
    skip: Function
}

