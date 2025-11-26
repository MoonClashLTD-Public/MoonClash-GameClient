import { _decorator, Component, Node, Sprite, Label, find, instantiate, RichText, EditBox } from 'cc';
import { LanguageLabel } from '../../core/gui/language/LanguageLabel';
import { tips } from '../../core/gui/prompt/TipsManager';
import { oops } from '../../core/Oops';
import { CommonUtil } from '../../core/utils/CommonUtil';
import { UIID } from '../common/config/GameUIConfig';
import HttpHome from '../common/net/HttpHome';
import TableCards from '../common/table/TableCards';
import TableNfts from '../common/table/TableNfts';
import { TradeState } from '../data/constant';
import { PlayerManger } from '../data/playerManager';
import { ResManger } from '../data/resManger';
import WalletUtil, { CurrType } from '../walletUI/WalletUtil';
const { ccclass, property, type } = _decorator;

@ccclass('MarketItemBuyPopUp')
export class MarketItemBuyPopUp extends Component {
    @type(EditBox)
    numEditbox: EditBox = null;
    @type(Label)
    buyPrice: Label = null;
    @type(LanguageLabel)
    descLbl: LanguageLabel = null;
    @type(Label)
    poundageLbl: Label = null;
    @type(Node)
    setUpNode: Node = null;
    @type(Node)
    confirmNode: Node = null;

    tradeInfo: watrade.IMaterialTrade = null;
    start() {

    }

    update(deltaTime: number) {

    }

    async onAdded(trade: watrade.IMaterialTrade) {
        if (trade) {
            this.tradeInfo = trade;
            this.numEditbox.string = `${trade.cnt}`;
            this.buyPrice.string = `${CommonUtil.weiToEther(trade.bnbPrice).toFixed()}`;
            this.descLbl.params = [
                {
                    key: "num",
                    value: `${trade.cnt}`,
                }
            ];
            this.editingDidEndClick(null, null);
        }
    }
    textChangedCheckNumber(text: string, e: EditBox, customEventData: string) {
        e.string = WalletUtil.checkNumber(text, customEventData);
    }

    editingDidEndClick(e: Event, customEventData: string) {
        let num = Number(this.numEditbox.string);
        if (isNaN(num) || num <= 0) {
            num = 1;
        }
        num = num > this.tradeInfo.cnt ? this.tradeInfo.cnt : num;
        this.numEditbox.string = `${num}`;
        let price = CommonUtil.weiToEther(this.tradeInfo.bnbPrice).times(num).toFixed();
        this.buyPrice.string = price;
    }

      
    async confimClick() {
        let num = Number(this.numEditbox.string);

        let _d = await HttpHome.queryGas("MaterialTradeBuyReq", watrade.MaterialTradeBuyReq.create({
            mainTradeId: this.tradeInfo.id,
            cnt: num,
        }));
        if (_d) {
            this.poundageLbl.string = `${CommonUtil.weiToEther(_d.gas).toFixed()}`;
        } else {
            return;
        }

        this.setUpNode.active = false;
        this.confirmNode.active = true;

        find('priceNode/num', this.confirmNode).getComponent(Label).string = `${this.buyPrice.string}`;
        find('poundageNode/num', this.confirmNode).getComponent(Label).string = `${this.poundageLbl.string}`;
    }

    buyClick() {
        let allBNB = WalletUtil.getTotalCurrByType(CurrType.BNB);
        if (new BigNumber(this.tradeInfo.bnbPrice).gt(allBNB)) {
            oops.gui.toast('not_enough_bnb', true);
            return;
        }

        let subTradeId = 0;
        let num = Number(this.numEditbox.string);

        let closeCB = () => {
            tips.hideNetLoadigMask();
            this.closeClick();
            oops.gui.remove(UIID.MarketCardInfoPopUp);
        }

        let cb = async () => {
            let d = await HttpHome.materialTradeState(this.tradeInfo.id);
            if (d.state == TradeState.StateOk) {
                let materialType = this.tradeInfo.tokenType;
                PlayerManger.getInstance().playerSelfInfo.addMaterials([{ tokenType: materialType, cnt: num }]);

                closeCB();
            } else if (d.state == TradeState.StateFailed) {
                  
                oops.gui.toast('market_fail3', true);
                closeCB();
            } else {
                this.scheduleOnce(cb, 10);
            }
        };

        HttpHome.materialTradeBuy(this.tradeInfo.id, num)
            .then((d: watrade.MaterialTradeBuyResp) => {
            }).catch(async (e: { code: errcode.ErrCode, data: watrade.MaterialTradeBuyResp }) => {
                if (e.code == errcode.ErrCode.WaitComplete) {
                    subTradeId = e.data.subTradeId;
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

export type MarketBuyPopUpParm = {
    trade?: watrade.ITrade,
    materialTrade?: watrade.IMaterialTrade,
}