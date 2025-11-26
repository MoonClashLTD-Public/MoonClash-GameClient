import { _decorator, Component, Node, Sprite, Label, find, instantiate, RichText, EditBox } from 'cc';
import { LanguageLabel } from '../../core/gui/language/LanguageLabel';
import { tips } from '../../core/gui/prompt/TipsManager';
import { oops } from '../../core/Oops';
import { CommonUtil } from '../../core/utils/CommonUtil';
import { UIID } from '../common/config/GameUIConfig';
import HttpHome from '../common/net/HttpHome';
import TableCards from '../common/table/TableCards';
import { TradeState } from '../data/constant';
import { PlayerManger } from '../data/playerManager';
import { ResManger } from '../data/resManger';
import WalletUtil from '../walletUI/WalletUtil';
const { ccclass, property, type } = _decorator;

@ccclass('MarketRentPopUp')
export class MarketRentPopUp extends Component {
    @type(Label)
    totalPrice: Label = null;
    @type(LanguageLabel)
    rentDay: LanguageLabel = null;
    @type(LanguageLabel)
    rentDayUnits: LanguageLabel = null;
    @type(LanguageLabel)
    descLbl: LanguageLabel = null;
    @type(Label)
    poundageLbl: Label = null;
    @type(EditBox)
    dayEditbox: EditBox = null;
    @type(Node)
    setUpNode: Node = null;
    @type(Node)
    confirmNode: Node = null;



    tradeInfo: watrade.ITrade = null;
    maxDay: number = 0;
    start() {

    }

    update(deltaTime: number) {

    }

    onAdded(trade: watrade.ITrade) {
        this.setUpNode.active = true;
        this.confirmNode.active = false;

        this.tradeInfo = trade;
        // let t = new Date(new Date(trade.rentalEndAt * 1000).setHours(24, 59, 59, 0)).getTime() / 1000;
        // let t1 = new Date(new Date()).setHours(0, 0, 0, 0) / 1000;
        let t = trade.rentalEndAt;
        let t1 = WalletUtil.getUnixTime() / 1000;
        this.maxDay = Math.ceil((t - t1) / 60 / 60 / 24);
        this.descLbl.params = [
            {
                key: "num",
                value: `${this.maxDay}`,
            }
        ]
        this.dayEditbox.string = '1';
        this.editingDidEndClick(null, null);
    }

    editingDidEndClick(e: Event, customEventData: string) {
        let day = Number(this.dayEditbox.string);
        if (isNaN(day) || day <= 0) {
            day = 1;
        }
        day = day > this.maxDay ? this.maxDay : day;
        this.dayEditbox.string = `${day}`;
        let price = CommonUtil.weiToEther(this.tradeInfo.bnbPrice);
        this.rentDay.params = [
            {
                key: 'num',
                value: `${day}`,
            }
        ]
        if (day > 1) {
            this.rentDayUnits.getComponent(LanguageLabel).dataID = "market_title_day3"
        } else {
            this.rentDayUnits.getComponent(LanguageLabel).dataID = "market_title_day2"
        }
        this.totalPrice.string = `${price.times(day).toFixed()}`;
        this.poundageLbl.string = `${price.times(day).times(0.05).toFixed()}`;
        this.dayEditbox.string = `${day}`;
    }

      
    async confimClick() {
        let _d = await HttpHome.queryGas("TradeLeaseReq", watrade.TradeLeaseReq.create({
            tradeId: this.tradeInfo.id,
            days: Number(this.dayEditbox.string),
        }));
        if (_d) {
            this.poundageLbl.string = `${CommonUtil.weiToEther(_d.gas).toFixed()}`;
        } else {
            return;
        }

        this.setUpNode.active = false;
        this.confirmNode.active = true;

        find('Node/node1/num', this.confirmNode).getComponent(Label).string = `${this.totalPrice.string}`;
        find('Node/node2/num', this.confirmNode).getComponent(Label).string = `${this.poundageLbl.string}`;

        let t = new Date().getTime() + Number(this.dayEditbox.string) * 24 * 60 * 60 * 1000;
        let d = new Date(t);
        find('Node-001/node/num', this.confirmNode).getComponent(Label).string = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
    }

    textChangedCheckNumber(text: string, e: EditBox, customEventData: string) {
        e.string = WalletUtil.checkNumber(text, customEventData);
    }

    async rentClick() {
        let day = Number(this.dayEditbox.string);
        if (isNaN(day) || day <= 0) {
            return;
        }
        let closeCB = () => {
            tips.hideNetLoadigMask();
            this.closeClick();
            oops.gui.remove(UIID.MarketCardInfoPopUp);
        }
        let cb = async () => {
            let d = await HttpHome.tradeState(this.tradeInfo.id);
            if (d.state == TradeState.StateLeased) {
                PlayerManger.getInstance().playerSelfInfo.refreshData();
                // if (this.tradeInfo.card) {
                //     PlayerManger.getInstance().cardManager.refreshData();
                // } else if (this.tradeInfo.equip) {
                //     PlayerManger.getInstance().equipManager.refreshData();
                // }
                closeCB();
            } else if (d.state == TradeState.StateCreated) {
                  
                oops.gui.toast('market_fail4', true);
                closeCB();
            } else {
                this.scheduleOnce(cb, 10);
            }
        };


        await HttpHome.tradeLease(this.tradeInfo.id, day).then((d: watrade.TradeCancelSellResp) => {
        }).catch(async (e: { code: errcode.ErrCode }) => {
            if (e.code == errcode.ErrCode.WaitComplete) {
                tips.showNetLoadigMask({
                    content: "netInstableOpen",
                    isShowCloseCD: true,
                    cb: () => {
                        this.unschedule(cb);
                    }
                })
                this.scheduleOnce(cb, 10);
            } else {
                closeCB();
            }
        });
    }

    closeClick() {
        oops.gui.removeByNode(this.node, true);
    }
}

