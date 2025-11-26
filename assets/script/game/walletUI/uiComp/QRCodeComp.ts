import { _decorator, Component, Node, Graphics, Label } from 'cc';
import { CommonUtil } from '../../../core/utils/CommonUtil';
import { PlayerManger } from '../../data/playerManager';
const { ccclass, property, type } = _decorator;

@ccclass('QRCodeComp')
export class QRCodeComp extends Component {
    @type(Graphics)
    ctx: Graphics = null;
    @type(Label)
    qrLbl: Label = null;

    qrStr: string = '';
    start() {

    }

    update(deltaTime: number) {

    }

    show() {
        this.node.active = true;

        this.qrStr = PlayerManger.getInstance().playerSelfInfo.walletAddr;

        this.qrLbl.string = this.qrStr;
        CommonUtil.drawQRCode(this.ctx, this.qrStr);
    }

    hide() {
        this.node.active = false;
        PlayerManger.getInstance().playerSelfInfo.refreshData();
    }

    copyClick() {
        CommonUtil.copyToClipboard(this.qrStr);
    }
}

