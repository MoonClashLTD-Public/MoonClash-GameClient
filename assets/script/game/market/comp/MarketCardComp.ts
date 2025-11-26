import { _decorator, Component, Node, Prefab, instantiate, log, Layout, UITransform, Event } from 'cc';
import { oops } from '../../../core/Oops';
import { UIID } from '../../common/config/GameUIConfig';
import HttpHome from '../../common/net/HttpHome';
import { PlayerManger } from '../../data/playerManager';
import { MarketFunComp, SortEnum } from '../widget/MarketFunComp';
import { MarketCard } from '../widget/MarketCard';
import { CardInfoPrefabBtnColor } from '../../common/common/CardInfoPrefab';
import { CardInfoPopUpParam } from '../../infoPopUp/cardInfoPopUp/CardInfoPopUp';
import { tips } from '../../../core/gui/prompt/TipsManager';
import { TradeState } from '../../data/constant';
import { Message } from '../../../core/common/event/MessageManager';
import { GameEvent } from '../../common/config/GameEvent';
import WalletUtil, { TradeFlagState } from '../../walletUI/WalletUtil';
import { MarketCardInfoPopUpParm } from '../MarketCardInfoPopUp';
import { WalletCancelSellPopUpParam } from '../../walletUI/WalletCancelSellPopUp';
import { CommonUtil } from '../../../core/utils/CommonUtil';
const { ccclass, property, type } = _decorator;

@ccclass('MarketCardComp')
export class MarketCardComp extends Component {
    @type(MarketFunComp)
    funComp: MarketFunComp = null;
    @type([Node])
    svNodes: Node[] = [];
    @type(Node)
    cardItemNode: Node = null;
    @type(Prefab)
    marketCardPrefab: Prefab = null;

    tradeType: core.TradeType
    isShow = false;
    sort: SortEnum
    data: watrade.ITradeQueryReq
    serachStr?: string
    start() {
        this.addEvent();
    }

    update(deltaTime: number) {

    }
    onDestroy() {
        this.removeEvent();
    }
    show(tradeType: core.TradeType) {
        this.isShow = true;
        this.tradeType = tradeType;
        this.svNodes.forEach(e => e.active = true);

        this.funComp.init(async (sort: SortEnum, data: watrade.ITradeQueryReq, serachStr: string) => {
            await this.updData(sort, data, serachStr);
        });
    }

    hide() {
        this.isShow = false;
        this.svNodes.forEach(e => e.active = false);
    }

    addEvent() {
        Message.on(GameEvent.CardDataRefresh, this.updMsg, this);
    }
    removeEvent() {
        Message.off(GameEvent.CardDataRefresh, this.updMsg, this);
    }

    updMsg() {
        if (this.isShow) {
            this.updData(this.sort, this.data, this.serachStr);
        }
    }


    async updData(sort: SortEnum, data: watrade.ITradeQueryReq, serachStr?: string) {
        this.sort = sort;
        this.data = data;
        this.serachStr = serachStr;

        data.tradeType = this.tradeType;
        data.tokenType = core.NftType.NftTypeCard;
        let a = await HttpHome.tradeQuery(data);
        if (!a) return;
        let _trades = a.trades ?? [];

        this.cardItemNode.destroyAllChildren();

        if (serachStr) {
            _trades = _trades.filter((v, k) => `${v.card.id}`.includes(serachStr));
        }
        _trades = _trades.filter((v) => {
            let bf = true;
            if (v.card.state == core.NftState.NftStateRenting) {
                let d = WalletUtil.getRentState(v.card);
                if (d.state == TradeFlagState.RENT_TIME) {   
                    bf = false;
                } else if (d.rentTime < new Date().getTime() / 1000) {   
                    bf = false;
                } else {
                    bf = true;
                }
            }
            return bf;
        })

        _trades.sort((a, b) => {
            if (sort == SortEnum.Latest) {   
                return b.id - a.id;
            } else if (sort == SortEnum.Oldest) {   
                return a.id - b.id;
            } else if (sort == SortEnum.Highest) {   
                let a_price = new BigNumber(a.bnbPrice);
                let b_price = new BigNumber(b.bnbPrice);
                if (a_price.minus(b_price).eq(0)) {
                    return 0;
                } else if (a_price.minus(b_price).gt(0)) {
                    return -1;
                } else {
                    return 1;
                }
            } else if (sort == SortEnum.Lowest) {   
                let a_price = new BigNumber(a.bnbPrice);
                let b_price = new BigNumber(b.bnbPrice);
                if (a_price.minus(b_price).eq(0)) {
                    return 0;
                } else if (a_price.minus(b_price).gt(0)) {
                    return 1;
                } else {
                    return -1;
                }
            }
        })

        this.funComp.updBoardBg(_trades.length);

        WalletUtil.marketFlag++
        let currFlay = WalletUtil.marketFlag

        for (let index = 0; index < _trades.length; index++) {
            if (index % WalletUtil.fNum == 0) await CommonUtil.waitCmpt(this, 0);
            if (currFlay != WalletUtil.marketFlag) return;
            const tradeInfo = _trades[index];
            let card = instantiate(this.marketCardPrefab).getComponent(MarketCard);
            card.init(tradeInfo, this.tradeClick.bind(this));
            this.cardItemNode.addChild(card.node);
        }

        this.scheduleOnce(() => {
            this.cardItemNode.getComponent(Layout).updateLayout();
        }, 0);
    }

    getItemNode(tradeId: number) {
        return this.cardItemNode.children.find((v, k) => {
            return v.getComponent(MarketCard).trade.id == tradeId;
        })
    }

    tradeClick(tradeInfo: watrade.ITrade) {
        if (tradeInfo.ownerId == PlayerManger.getInstance().playerId) {
            this.showMeTrade(tradeInfo);
        } else {
            oops.gui.open<MarketCardInfoPopUpParm>(UIID.MarketCardInfoPopUp, { trade: tradeInfo });
        }
    }

    showMeTrade(trade: watrade.ITrade) {
        enum Flag {
            CancelSell = "CancelSell",
        }
        let cb = async (event: Event, cbFlag: Flag): Promise<void> => {
            if (cbFlag == Flag.CancelSell) {
                oops.gui.open<WalletCancelSellPopUpParam>(UIID.WalletCancelSellPopUp, {
                    tradeId: trade.id,
                    trade: trade
                });
                //     let cb = async () => {
                //         let d = await HttpHome.tradeState(trade.id);
                //         if (d.state == TradeState.StateClosed) {
                //             PlayerManger.getInstance().cardManager.refreshData();
                //             this.getItemNode(trade.id)?.destroy();
                //             tips.hideNetLoadigMask();
                //             oops.gui.remove(UIID.CardInfoPopUp);
                //         } else if (d.state == TradeState.StateCreated) {
                  
                //             oops.gui.toast('market_fail', true);
                //             tips.hideNetLoadigMask();
                //         } else {
                //             this.scheduleOnce(cb, 10);
                //         }
                //     };

                //     HttpHome.tradeCancelSell(trade.id)
                //         .then((d: watrade.TradeCancelSellResp) => {
                //         }).catch(async (e: { code: errcode.ErrCode }) => {
                //             if (e.code == errcode.ErrCode.WaitComplete) {
                //                 tips.showNetLoadigMask({
                //                     content: "netInstableOpen",
                //                     isShowCloseCD: true,
                //                     cb: () => {
                //                         this.unschedule(cb);
                //                     }
                //                 })
                //                 this.scheduleOnce(cb, 10);
                //             } else {
                //                 tips.hideNetLoadigMask();
                //             }
                //         });
            }
        }

        let param: CardInfoPopUpParam = {
            card: trade.card,
            btns: [],
            cb: cb,
        }
        param.btns = [
            {
                i18nKey: "wallet_btn_cancelsell",
                btnColor: CardInfoPrefabBtnColor.Green,
                cbFlag: Flag.CancelSell,
            },
        ]
        oops.gui.open(UIID.CardInfoPopUp, param);
    }
}

