import { _decorator, Component, Node, Sprite, Label, find, instantiate, RichText, EditBox, UIOpacity } from 'cc';
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
import WalletUtil, { CurrType } from '../walletUI/WalletUtil';
const { ccclass, property, type } = _decorator;

@ccclass('MarketBuyPopUp')
export class MarketBuyPopUp extends Component {
    @type(Label)
    buyPrice: Label = null;
    @type(Label)
    poundageLbl: Label = null;


    tradeInfo: watrade.ITrade = null;
    start() {

    }

    update(deltaTime: number) {

    }

    async onAdded(trade: watrade.ITrade) {
        this.tradeInfo = trade;
        this.buyPrice.string = `${CommonUtil.weiToEther(trade.bnbPrice).toFixed()}`;
        this.poundageLbl.string = `${0}`;
        this.node.getComponent(UIOpacity).opacity = 0;
        let _d = await HttpHome.queryGas("TradeBuyReq", watrade.TradeBuyReq.create({
            tradeId: trade.id,
        })).catch(() => {
            this.closeClick();
        });
        if (_d) {
            this.node.getComponent(UIOpacity).opacity = 255;
            this.poundageLbl.string = `${CommonUtil.weiToEther(_d.gas).toFixed()}`;
        } else {
            this.closeClick();
        }
    }

    buyClick() {
        let allBNB = WalletUtil.getTotalCurrByType(CurrType.BNB);
        if (new BigNumber(this.tradeInfo.bnbPrice).gt(allBNB)) {
            oops.gui.toast('not_enough_bnb', true);
            return;
        }
        let closeCB = () => {
            tips.hideNetLoadigMask();
            this.closeClick();
            oops.gui.remove(UIID.MarketCardInfoPopUp);
        }
        let cb = async () => {
            let d = await HttpHome.tradeState(this.tradeInfo.id);
            if (d.state == TradeState.StatePurchased) {
                PlayerManger.getInstance().playerSelfInfo.refreshData();
                // if (this.tradeInfo.card) {
                //     PlayerManger.getInstance().cardManager.refreshData();
                // } else if (this.tradeInfo.equip) {
                //     PlayerManger.getInstance().equipManager.refreshData();
                // }
                closeCB();
            } else if (d.state == TradeState.StateCreated) {
                  
                oops.gui.toast('market_fail3', true);
                closeCB();
            } else {
                this.scheduleOnce(cb, 10);
            }
        };

        HttpHome.tradeBuy(this.tradeInfo.id)
            .then((d: watrade.TradeCancelSellResp) => {
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

