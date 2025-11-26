import { _decorator, Component, Node, Label } from 'cc';
import { Message } from '../../core/common/event/MessageManager';
import { AlertParam } from '../../core/gui/prompt/Alert';
import { oops } from '../../core/Oops';
import { KProgressBar } from '../common/com/KProgressBar';
import { UIID } from '../common/config/GameUIConfig';
import { netChannel } from '../common/net/NetChannelManager';
import TableBlindBox, { TableBlindBoxCfg } from '../common/table/TableBlindBox';
import { PlayerManger } from '../data/playerManager';
const { ccclass, property } = _decorator;

@ccclass('BindBoxBuyPopUp')
export class BindBoxBuyPopUp extends Component {
    @property(KProgressBar)
    kProgressBar: KProgressBar = null;
    @property(Label)
    costLbl: Label = null;
    boxId: number = -1;
    boxCfg: TableBlindBoxCfg;
    start() {

    }

    update(deltaTime: number) {

    }

    public onAdded(boxId: number) {
        this.boxId = boxId;
        this.boxCfg = TableBlindBox.getInfoById(this.boxId);

        this.kProgressBar.init(
            {
                curNum: 1,
                minNum: 0,
                maxNum: 10,
                changeCB: this.updCost.bind(this),
            }
        );

    }

    onRemoved() {
    }

    updCost(curNum: number) {
        this.costLbl.string = `${this.boxCfg.cost.dna_gwei * curNum}`;
    }

    async buyClick() {
        let data = pkgcs.CsBlindBoxBuyReq.create();
        data.id = this.boxId;
        data.cnt = this.kProgressBar.getCurNum();
        // data.cnt = this.kProgressBar.getCurNum();
        let d = await netChannel.home.reqUnique(opcode.OpCode.CsBlindBoxBuyReq, opcode.OpCode.ScBlindBoxBuyResp, data);
        if (d.code == errcode.ErrCode.WaitComplete) {
            this.addEvent();
            oops.gui.open<AlertParam>(UIID.Alert, {
                i18DataID: "blind_page_alert_1",
                cancelCB: this.removeEvent.bind(this),
            })
        }
    }

    addEvent() {
        Message.on(`${opcode.OpCode.ScBlindBoxBuyPush}`, this.ScBlindBoxBuyPush, this);
    }
    removeEvent() {
        Message.off(`${opcode.OpCode.ScBlindBoxBuyPush}`, this.ScBlindBoxBuyPush, this);
    }

      
    ScBlindBoxBuyPush(event: string, data: pkgsc.ScBlindBoxBuyPush) {
        if (data.code == errcode.ErrCode.Ok) {
            oops.gui.remove(UIID.Alert);
            oops.gui.toast("");
        }
    }

    closeClick() {
        oops.gui.removeByNode(this.node, true);
    }

    onDestroy() {
        this.removeEvent();
    }
}

