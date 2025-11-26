import { _decorator, Component, Node, Prefab, instantiate, log, Event } from 'cc';
import { PlayerManger } from '../../data/playerManager';
import { FunComp } from '../widget/FunComp';
import { WalletBigCard } from '../widget/WalletBigCard';
import { WalletSellPopUpParam } from '../WalletSellPopUp';
import { Message } from '../../../core/common/event/MessageManager';
import { GameEvent } from '../../common/config/GameEvent';
import WalletUtil, { TradeFlagState } from '../WalletUtil';
import TableCards from '../../common/table/TableCards';
import { LanguageData } from '../../../core/gui/language/LanguageData';
import { CommonUtil } from '../../../core/utils/CommonUtil';
const { ccclass, property, type } = _decorator;

enum SortEnum {
      
    Time,
      
    Name,
      
    Level,
      
    Character,
}

  
enum SerachEnum {
      
    All,
      
    ForSale,
      
    ForRent,
      
    OnLease,
      
    Renting,
}

@ccclass('WalletCardComp')
export class WalletCardComp extends Component {
    @type([Node])
    svNodes: Node[] = [];
    @type(Node)
    cardItemNode: Node = null;
    @type(FunComp)
    funComp: FunComp = null;
    @type(Prefab)
    walletCardPrefab: Prefab = null;
    isShow = false;

    sortLblKeys: { [key: number]: string } = {
        [SortEnum.Time]: "wallet_btn_timesort",
        [SortEnum.Name]: "wallet_btn_namesort",
        [SortEnum.Level]: "wallet_btn_levelsort",
        [SortEnum.Character]: "wallet_btn_charsort",
    }

    serachLblKeys: { [key: number]: string } = {
        [SerachEnum.All]: "wallet_btn_all",
        [SerachEnum.ForSale]: "wallet_btn_forsale",
        // [SerachEnum.ForRent]: "wallet_btn_forrent",
        // [SerachEnum.OnLease]: "wallet_btn_onlease",
        // [SerachEnum.Renting]: "wallet_btn_forrented",
    }

    sort: SortEnum = SortEnum.Time;
    serach: SerachEnum = SerachEnum.All;
    start() {
        this.addEvent();
    }

    update(deltaTime: number) {

    }
    onDestroy() {
        this.removeEvent();
    }

    show() {
        this.isShow = true;
        this.svNodes.forEach(e => e.active = true);

        this.funComp.init(this.sort, this.serach, this.sortLblKeys, this.serachLblKeys, this.updData.bind(this));
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
            this.updData(this.sort, this.serach);
        }
    }

    async updData(sort: SortEnum, serach: SerachEnum) {
        this.sort = sort;
        this.serach = serach;
        this.cardItemNode.destroyAllChildren();
        let cards = PlayerManger.getInstance().cardManager.playCard.netCards;
        let _cards: core.ICard[] = [];
        if (serach == SerachEnum.All) {
            _cards = cards;
        } else if (serach == SerachEnum.ForSale) {
            _cards = cards.filter((v, k) => v.state == core.NftState.NftStateSelling);
        } else if (serach == SerachEnum.ForRent) {
            _cards = cards.filter((v, k) => v.state == core.NftState.NftStateRenting
                && WalletUtil.getRentState(v).state == TradeFlagState.RENT);
        } else if (serach == SerachEnum.OnLease) {
            _cards = cards.filter((v, k) => v.state == core.NftState.NftStateRenting &&
                WalletUtil.getRentState(v).state == TradeFlagState.RENT_TIME);
        } else if (serach == SerachEnum.Renting) {
            _cards = cards.filter((v, k) =>
                v.state == core.NftState.NftStateRenting &&
                WalletUtil.getRentState(v).state == TradeFlagState.RENT_TIME &&
                v.onChainRenter == PlayerManger.getInstance().playerSelfInfo.walletAddr);
        }

        _cards.sort((a, b) => {
            let aInfo = TableCards.getInfoByProtoIdAndLv(a.protoId, a.level);
            let bInfo = TableCards.getInfoByProtoIdAndLv(b.protoId, b.level);
            let aName = LanguageData.getLangByID(aInfo.name);
            let bName = LanguageData.getLangByID(bInfo.name);
            if (sort == SortEnum.Time) {   
                return b.id - a.id;
            } else if (sort == SortEnum.Name) {
                if (aName == bName) {
                    if (b.level == a.level) {
                        if (b.attrs.length == a.attrs.length) {
                            return b.id - a.id;
                        } else {
                            return b.attrs.length - a.attrs.length;
                        }
                    } else {
                        return b.level - a.level;
                    }
                } else {
                    return aName.localeCompare(bName);
                }
            } else if (sort == SortEnum.Level) {
                if (b.level == a.level) {
                    if (aName == bName) {
                        if (b.attrs.length == a.attrs.length) {
                            return b.id - a.id;
                        } else {
                            return b.attrs.length - a.attrs.length;
                        }
                    } else {
                        return aName.localeCompare(bName);
                    }
                } else {
                    return b.level - a.level;
                }
            } else if (sort == SortEnum.Character) {
                if (b.attrs.length == a.attrs.length) {
                    if (aName == bName) {
                        if (b.level == a.level) {
                            return b.level - a.level;
                        } else {
                            if (b.attrs.length == a.attrs.length) {
                                return b.id - a.id;
                            } else {
                                return b.attrs.length - a.attrs.length;
                            }
                        }
                    } else {
                        return aName.localeCompare(bName);
                    }
                } else {
                    return b.attrs.length - a.attrs.length;
                }
            }
        })

        WalletUtil.walletFlag++
        let currFlay = WalletUtil.walletFlag

        for (let index = 0; index < _cards.length; index++) {
            if (index % WalletUtil.fNum == 0) await CommonUtil.waitCmpt(this, 0);
            if (currFlay != WalletUtil.walletFlag) return;
            const cardInfo = _cards[index];
            let card = instantiate(this.walletCardPrefab).getComponent(WalletBigCard);
            card.initCard(cardInfo, this.cardClick.bind(this));
            this.cardItemNode.addChild(card.node);
        }
    }

    cardClick(walletBigCard: WalletBigCard) {
        let param: WalletSellPopUpParam = {
            card: walletBigCard.cardInfo
        }
        WalletUtil.openWalletInfo(param);
        // enum Flag {
        //     Sell = "Sell",
        //     CancelSell = "CancelSell",
        //     Rent = "Rent",
        //     Transfer = "Transfer",
        // }
        // let cb = async (event: Event, cbFlag: Flag): Promise<void> => {
        //     if (cbFlag == Flag.Sell) {
        //         oops.gui.open<WalletSellPopUpParam>(UIID.WalletSellPopUp, { card: walletBigCard.cardInfo });
        //     } else if (cbFlag == Flag.Rent) {
        //         oops.gui.open<WalletRentPopUpParam>(UIID.WalletRentPopUp, { card: walletBigCard.cardInfo });
        //     } else if (cbFlag == Flag.Transfer) {
        //         oops.gui.open<WalletTransferPopUpParam>(UIID.WalletTransferPopUp, { card: walletBigCard.cardInfo });
        //     } else if (cbFlag == Flag.CancelSell) {
        //         this.cancelSell(walletBigCard.cardInfo);
        //     }
        // }

        // let param: CardInfoPopUpParam = {
        //     card: walletBigCard.cardInfo,
        //     btns: [],
        //     cb: cb,
        // }
        // if (walletBigCard.state == TradeFlagState.READY) {
        //     param.btns = [
        //         {
        //             i18nKey: "wallet_btn_sell",
        //             btnColor: CardInfoPrefabBtnColor.Green,
        //             cbFlag: Flag.Sell,
        //         },
        //         {
        //             i18nKey: "wallet_btn_rent",
        //             btnColor: CardInfoPrefabBtnColor.Yellow,
        //             cbFlag: Flag.Rent
        //         },
        //         {
        //             i18nKey: "wallet_title_transfer",
        //             btnColor: CardInfoPrefabBtnColor.Blue,
        //             cbFlag: Flag.Transfer
        //         },
        //     ]
        // } else if (walletBigCard.state == TradeFlagState.SALE) {
        //     param.btns = [
        //         {
        //             i18nKey: "wallet_btn_cancelsell",
        //             btnColor: CardInfoPrefabBtnColor.Red,
        //             cbFlag: Flag.CancelSell,
        //         },
        //     ]
        // } else if (walletBigCard.state == TradeFlagState.RENT) {
          
        //     param.btns = [
        //         {
        //             i18nKey: "wallet_btn_cancelsell",
        //             btnColor: CardInfoPrefabBtnColor.Green,
        //             cbFlag: Flag.CancelSell,
        //         },
        //     ]
        // }
        // oops.gui.open(UIID.CardInfoPopUp, param);
    }

    // async cancelSell(card: core.ICard) {
    //     let d = await HttpHome.queryTradeId(core.NftType.NftTypeCard, card.nftId)
    //     if (!d) { return };

    //     oops.gui.open<WalletCancelSellPopUpParam>(UIID.WalletCancelSellPopUp, {
    //         tradeId: d.trade.id,
    //         trade: d.trade
    //     });
    // }
}

