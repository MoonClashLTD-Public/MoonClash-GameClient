import { _decorator, Component, Node, ScrollView, instantiate, find, Button, Event } from 'cc';
import { LanguageData } from '../../core/gui/language/LanguageData';
import List from '../../core/gui/list/List';
import { AlertParam } from '../../core/gui/prompt/Alert';
import { tips } from '../../core/gui/prompt/TipsManager';
import { oops } from '../../core/Oops';
import { CommonUtil } from '../../core/utils/CommonUtil';
import { UIID } from '../common/config/GameUIConfig';
import HttpHome from '../common/net/HttpHome';
import { netChannel } from '../common/net/NetChannelManager';
import TableBlindBox from '../common/table/TableBlindBox';
import WalletUtil, { CurrType } from '../walletUI/WalletUtil';
import { BlindBoxItem } from './BlindBoxItem';
import { BlindBoxOpenPopUpParam } from './BlindBoxOpenPopUp';
const { ccclass, property } = _decorator;

@ccclass('BlindBoxPage')
export class BlindBoxPage extends Component {
    @property(List)
    list: List = null;
    start() {
        this.list.numItems = TableBlindBox.cfg.filter(v => v.id < 10000).length;
    }

    update(deltaTime: number) {

    }

      
    pageInit() {
        this.addEvent();
    }
      
    pageOuit() {
        this.list.scrollView.stopAutoScroll();
        this.list.scrollTo(0, 0);
        this.removeEvent();
    }

    renderEvent(item: Node, idx: number) {
        let blindBoxItem = item.getComponent(BlindBoxItem);
        blindBoxItem.init(idx);
    }

    async buyClick(event: Event, customEventData: string) {
        let boxIdx = Number(customEventData);
        let boxInfo = TableBlindBox.cfg[boxIdx];
        let item = this.list.getItemByListId(boxIdx);
        let blindBoxItem = item.getComponent(BlindBoxItem);
        let num = blindBoxItem._num;
        let boxId = boxInfo.id;

        let allDNA = WalletUtil.getTotalCurrByType(CurrType.DNA);
        if (new BigNumber(blindBoxItem.cost).gt(CommonUtil.weiToEther(allDNA))) {
            oops.gui.toast('not_enough_nda', true);
            return;
        }

        let data = pkgcs.CsBlindBoxBuyAndOpenReq.create({
            id: boxId,
            cnt: num,
        });
        let okCB = async () => {
            let d = await netChannel.home.reqUnique(opcode.OpCode.CsBlindBoxBuyAndOpenReq, opcode.OpCode.ScBlindBoxBuyAndOpenResp, data);
            if (d.code == errcode.ErrCode.WaitComplete) {
                let _d = await tips.showNetLoadigMask<pkgsc.ScBlindBoxBuyAndOpenPush>({
                    content: "blind_page_alert_1",
                    closeEventName: `${opcode.OpCode.ScBlindBoxBuyAndOpenPush}`,
                })
                if (_d?.code == errcode.ErrCode.Ok) {
                    oops.gui.open<BlindBoxOpenPopUpParam>(UIID.BlindBoxOpenPopUp, { blindBoxData: _d });
                }
            }
        }

        let gas = "0";
        let usd = "0";
        let _d = await HttpHome.queryGas("CsBlindBoxBuyAndOpenReq", data);
        if (_d) {
            gas = `${CommonUtil.weiToEther(_d.gas).toFixed()}`;
            usd = _d.usd;
        } else {
            return;
        }


        oops.gui.open<AlertParam>(UIID.Alert, {
            content: LanguageData.getLangByIDAndParams('blind_box_buy_tips', [
                {
                    key: "num1",
                    value: `${blindBoxItem.cost}`
                },
                {
                    key: "gas",
                    value: `${gas}`
                },
                {
                    key: "num2",
                    value: `${num}`
                },
            ]),
            okCB: () => { okCB(); },
            cancelCB: () => { },
        });
    }

    async openClick(event: Event, customEventData: string) {
        // let boxId = Number(customEventData);
        // let boxInfo = PlayerManger.getInstance().blindBoxData.getBoxById(boxId);
        // if (boxInfo.cnt == 0) {
          
        //     return
        // }
        // let data = pkgcs.CsBlindBoxOpenReq.create();
        // data.id = boxInfo.id;
        // let d = await netChannel.home.reqUnique(opcode.OpCode.CsBlindBoxOpenReq, opcode.OpCode.ScBlindBoxOpenResp, data);
        // if (d.code == errcode.ErrCode.WaitComplete) {
        //     this.addEvent();
        //     oops.gui.open<AlertParam>(UIID.Alert, {
        //         i18DataID: "blind_page_alert_0",
        //         closeCB: this.removeEvent.bind(this),
        //     })
        // }
    }

    addEvent() {
        // Message.on(`${opcode.OpCode.ScBlindBoxBuyAndOpenPush}`, this.ScBlindBoxBuyAndOpenPush, this);
    }
    removeEvent() {
        // Message.off(`${opcode.OpCode.ScBlindBoxBuyAndOpenPush}`, this.ScBlindBoxBuyAndOpenPush, this);
    }

    onDestroy() {
        this.removeEvent();
    }
}

