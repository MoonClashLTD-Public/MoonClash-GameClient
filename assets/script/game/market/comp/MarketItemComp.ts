import { _decorator, Component, Node, Prefab, instantiate, Layout, Event, ScrollView, EventInfo } from 'cc';
import { tips } from '../../../core/gui/prompt/TipsManager';
import { oops } from '../../../core/Oops';
import { CommonUtil } from '../../../core/utils/CommonUtil';
import { CardInfoPrefabBtnColor } from '../../common/common/CardInfoPrefab';
import { UIID } from '../../common/config/GameUIConfig';
import HttpHome from '../../common/net/HttpHome';
import { TradeState } from '../../data/constant';
import { PlayerManger } from '../../data/playerManager';
import { MaterialInfoPopUpParam } from '../../infoPopUp/materialInfoPopUp/MaterialInfoPopUp';
import { WalletCancelSellPopUpParam } from '../../walletUI/WalletCancelSellPopUp';
import WalletUtil from '../../walletUI/WalletUtil';
import { MarketCardInfoPopUpParm } from '../MarketCardInfoPopUp';
import { MarketCard } from '../widget/MarketCard';
import { MarketFunComp, SortEnum } from '../widget/MarketFunComp';
const { ccclass, property, type } = _decorator;

@ccclass('MarketItemComp')
export class MarketItemComp extends Component {
    @type(MarketFunComp)
    funComp: MarketFunComp = null;
    @type(Node)
    svNodes: Node[] = [];
    @type(Node)
    cardItemNode: Node = null;
    @type(Prefab)
    marketCardPrefab: Prefab = null;
    tradeType: core.TradeType;
    isShow = false;
    sort: SortEnum
    filterData: watrade.ITradeQueryReq
    data: watrade.MaterialTradeQueryResp
    trades: watrade.IMaterialTrade[];
    serachStr?: string
    tp: 0 | 1 | 2 = 0;
    isUpdData = false;
    start() {

    }

    update(deltaTime: number) {

    }

    show(tradeType: core.TradeType) {
        this.tradeType = tradeType;
        this.svNodes.forEach(e => e.active = true);

        this.data = null;
        this.trades = null;

        // this.funComp.node.children.forEach(e => e.active = false);
        this.funComp.node.children[2].active = false;   
        this.funComp.node.children[3].active = false;   
        this.funComp.init(async (sort: SortEnum, data: watrade.ITradeQueryReq, serachStr: string) => {
            await this.updData(sort, data, serachStr);
        });
    }

    hide() {
        this.funComp.node.children[2].active = true;
        this.funComp.node.children[3].active = true;
        // this.funComp.node.children.forEach(e => e.active = true);
        this.svNodes.forEach(e => e.active = false);
    }

    getSortNum(sort: SortEnum) {
        // 0 latest, 1 oldest, 2 lowest-price, 3 highest-price
        let _sort: 0 | 1 | 2 | 3 = 0;
        switch (sort) {
            case SortEnum.Latest:
                _sort = 0;
                break;
            case SortEnum.Oldest:
                _sort = 1;
                break;
            case SortEnum.Lowest:
                _sort = 2;
                break;
            case SortEnum.Highest:
                _sort = 3;
                break;
            default:
                break;
        }
        return _sort;
    }

    async updData(sort: SortEnum, data: watrade.ITradeQueryReq, serachStr?: string) {
        this.sort = sort;
        this.filterData = data;
        this.serachStr = serachStr;

        data.tradeType = this.tradeType;
        // data.tokenType = core.NftType.NftTypeEquipment;
        switch (data.subTypeList[0] ?? 0) {
            case core.NftSubType.NftSubBoxEquipment:
                this.tp = 1;
                break;
            case core.NftSubType.NftSubBoxCard:
                this.tp = 2;
                break;
            default:
                this.tp = 0;
                break;
        }

        this.isUpdData = true;
        let a = await HttpHome.materialQuery(20, 0, this.tp, this.getSortNum(this.sort));
        this.isUpdData = false;
        if (!a) return;
        this.data = a;
        let _trades = a.trades ?? [];
        this.trades = _trades;
        this.cardItemNode.destroyAllChildren();

        if (serachStr) {
            _trades = _trades.filter((v, k) => `${v.tokenType}`.includes(serachStr));
        }

        // _trades.sort((a, b) => {
          
        //         return b.id - a.id;
          
        //         return a.id - b.id;
          
        //         let a_price = new BigNumber(a.bnbPrice);
        //         let b_price = new BigNumber(b.bnbPrice);
        //         if (a_price.minus(b_price).eq(0)) {
        //             return 0;
        //         } else if (a_price.minus(b_price).gt(0)) {
        //             return -1;
        //         } else {
        //             return 1;
        //         }
          
        //         let a_price = new BigNumber(a.bnbPrice);
        //         let b_price = new BigNumber(b.bnbPrice);
        //         if (a_price.minus(b_price).eq(0)) {
        //             return 0;
        //         } else if (a_price.minus(b_price).gt(0)) {
        //             return 1;
        //         } else {
        //             return -1;
        //         }
        //     }
        // })

        this.funComp.updBoardBg(_trades.length);

        WalletUtil.marketFlag++
        let currFlay = WalletUtil.marketFlag

        for (let index = 0; index < _trades.length; index++) {
            if (index % WalletUtil.fNum == 0) await CommonUtil.waitCmpt(this, 0);
            if (currFlay != WalletUtil.marketFlag) return;
            const tradeInfo = _trades[index];
            let card = instantiate(this.marketCardPrefab).getComponent(MarketCard);
            card.initMaterial(tradeInfo, this.tradeClick.bind(this));
            this.cardItemNode.addChild(card.node);
        }

        this.scheduleOnce(() => {
            this.cardItemNode.getComponent(Layout).updateLayout();
        }, 0);
    }

    eventMap = {
        'scroll-to-top': 0,
        'scroll-to-bottom': 1,
        'scroll-to-left': 2,
        'scroll-to-right': 3,
        scrolling: 4,
        'bounce-bottom': 6,
        'bounce-left': 7,
        'bounce-right': 8,
        'bounce-top': 5,
        'scroll-ended': 9,
        'touch-up': 10,
        'scroll-ended-with-threshold': 11,
        'scroll-began': 12,
    };
    async scrollEvent(scrollview: ScrollView, eventType: number, customEventData: string) {
        // EventInfo.
          
          
          
        if (this.eventMap.scrolling == eventType && this.isUpdData == false) {
            if (scrollview.getMaxScrollOffset().y - scrollview.getScrollOffset().y < 200) {
                // console.log(this.trades.length, this.data.total);

                if (this.data && this.trades && this.trades.length < this.data.total) {
                    this.isUpdData = true;
                    let a = await HttpHome.materialQuery(20, this.trades.length, this.tp, this.getSortNum(this.sort));
                    this.isUpdData = false;
                    if (!a) return;
                    this.data = a;
                    this.trades = this.trades.concat(a.trades);
                    this.addData(a.trades);
                }
            }
        }
    }

    addData(trades: watrade.IMaterialTrade[]) {
        for (let index = 0; index < trades.length; index++) {
            const tradeInfo = trades[index];
            let card = instantiate(this.marketCardPrefab).getComponent(MarketCard);
            card.initMaterial(tradeInfo, this.tradeClick.bind(this));
            this.cardItemNode.addChild(card.node);
        }
    }

    getItemNode(tradeId: number) {
        return this.cardItemNode.children.find((v, k) => {
            return v.getComponent(MarketCard).materialTrade.id == tradeId;
        })
    }

    tradeClick(tradeInfo: watrade.IMaterialTrade) {
        if (tradeInfo.sellerId == PlayerManger.getInstance().playerId) {
            this.showMeTrade(tradeInfo);
        } else {
            oops.gui.open<MarketCardInfoPopUpParm>(UIID.MarketCardInfoPopUp, { materialTrade: tradeInfo });
        }
    }

    showMeTrade(trade: watrade.IMaterialTrade) {
        enum Flag {
            CancelSell = "CancelSell",
        }
        let cb = async (event: Event, cbFlag: Flag): Promise<void> => {
            if (cbFlag == Flag.CancelSell) {
                oops.gui.open<WalletCancelSellPopUpParam>(UIID.WalletCancelSellPopUp, {
                    tradeId: trade.id,
                    materialTrade: trade,
                    succCB: (num: number) => {
                        let card = this.getItemNode(trade.id)?.getComponent(MarketCard)
                        if (!card) return;
                        trade.cnt -= num;
                        if (trade.cnt > 0) {
                            card.walletMaterial.setNum(trade.cnt);
                        } else {
                            card.node.destroy();
                        }
                    }
                });
                //     let cb = async () => {
                //         let d = await HttpHome.materialTradeState(trade.id);
                //         if (d.state == TradeState.StateClosed) {
                //             PlayerManger.getInstance().equipManager.refreshData();
                //             // this.getItemNode(trade.id)?.destroy();
                //             tips.hideNetLoadigMask();
                //             oops.gui.remove(UIID.MaterialInfoPopUp);
                //         } else if (d.state == TradeState.StateFailed) {
                  
                //             oops.gui.toast('market_fail', true);
                //             tips.hideNetLoadigMask();
                //         } else {
                //             this.scheduleOnce(cb, 10);
                //         }
                //     };

                //     HttpHome.materialTradeCancel(trade.id, trade.cnt)
                //         .then((d: watrade.MaterialTradeCancelResp) => {
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

        let material = PlayerManger.getInstance().playerSelfInfo.getMaterialByType(trade.tokenType);
        let param: MaterialInfoPopUpParam = {
            material: material,
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
        oops.gui.open(UIID.MaterialInfoPopUp, param);
    }
}

