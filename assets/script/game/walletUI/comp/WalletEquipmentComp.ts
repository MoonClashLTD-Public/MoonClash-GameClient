import { _decorator, Component, Node, Prefab, Event, instantiate } from 'cc';
import { PlayerManger } from '../../data/playerManager';
import { FunComp } from '../widget/FunComp';
import { WalletBigCard } from '../widget/WalletBigCard';
import { WalletSellPopUpParam } from '../WalletSellPopUp';
import { Message } from '../../../core/common/event/MessageManager';
import { GameEvent } from '../../common/config/GameEvent';
import WalletUtil from '../WalletUtil';
import TableEquipRaity from '../../common/table/TableEquipRaity';
import { CommonUtil } from '../../../core/utils/CommonUtil';
const { ccclass, property, type } = _decorator;

enum SortEnum {
      
    Time,
      
    Name,
      
    Quality,
}

  
enum SerachEnum {
      
    All,
      
    ForSale,
}

@ccclass('WalletEquipmentComp')
export class WalletEquipmentComp extends Component {
    @type([Node])
    svNodes: Node[] = [];
    @type(Node)
    equipItemNode: Node = null;
    @type(FunComp)
    funComp: FunComp = null;
    @type(Prefab)
    walletCardPrefab: Prefab = null;
    isShow = false;
    sortLblKeys: { [key: number]: string } = {
        [SortEnum.Time]: "wallet_btn_timesort",
        [SortEnum.Name]: "wallet_btn_namesort",
        [SortEnum.Quality]: "wallet_btn_qualsort",
    }

    serachLblKeys: { [key: number]: string } = {
        [SerachEnum.All]: "wallet_btn_all",
        [SerachEnum.ForSale]: "wallet_btn_forsale",
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
        Message.on(GameEvent.EquipDataRefresh, this.updMsg, this);
    }
    removeEvent() {
        Message.off(GameEvent.EquipDataRefresh, this.updMsg, this);
    }

    updMsg() {
        if (this.isShow) {
            this.updData(this.sort, this.serach);
        }
    }


    async updData(sort: SortEnum, serach: SerachEnum) {
        this.sort = sort;
        this.serach = serach;

        this.equipItemNode.destroyAllChildren();
        let equipments = PlayerManger.getInstance().equipManager.playEquips.equips;

        let _equipments: core.IEquipment[] = [];
        if (serach == SerachEnum.All) {
            _equipments = equipments;
        } else if (serach == SerachEnum.ForSale) {
            _equipments = equipments.filter((v, k) => v.state == core.NftState.NftStateSelling);
        }

        _equipments.sort((a, b) => {
            let aName = TableEquipRaity.getInfoByEquipIdAndRarity(a.protoId, a.equipRarity)?.name;
            let bName = TableEquipRaity.getInfoByEquipIdAndRarity(b.protoId, b.equipRarity)?.name;
            if (sort == SortEnum.Time) {   
                return b.id - a.id;
            } else if (sort == SortEnum.Name) {
                if (aName == bName) {
                    if (b.equipRarity == a.equipRarity) {
                        return b.id - a.id;
                    } else {
                        return b.equipRarity - a.equipRarity;
                    }
                } else {
                    return aName.localeCompare(bName);
                }
            } else if (sort == SortEnum.Quality) {
                if (b.equipRarity == a.equipRarity) {
                    if (aName == bName) {
                        return b.id - a.id;
                    } else {
                        return aName.localeCompare(bName);
                    }
                } else {
                    return b.equipRarity - a.equipRarity;
                }
            }
        })

        WalletUtil.walletFlag++
        let currFlay = WalletUtil.walletFlag

        for (let index = 0; index < _equipments.length; index++) {
            if (index % WalletUtil.fNum == 0) await CommonUtil.waitCmpt(this, 0);
            if (currFlay != WalletUtil.walletFlag) return;
            const equipment = _equipments[index];
            let equip = instantiate(this.walletCardPrefab).getComponent(WalletBigCard);
            equip.initEquip(equipment, this.cardClick.bind(this));
            this.equipItemNode.addChild(equip.node);
        }
    }

    cardClick(walletBigCard: WalletBigCard) {
        let param: WalletSellPopUpParam = {
            equipment: walletBigCard.equipmentInfo
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
        //         oops.gui.open<WalletSellPopUpParam>(UIID.WalletSellPopUp, { equipment: walletBigCard.equipmentInfo });
        //     } else if (cbFlag == Flag.Rent) {
        //         oops.gui.open<WalletRentPopUpParam>(UIID.WalletRentPopUp, { equipment: walletBigCard.equipmentInfo });
        //     } else if (cbFlag == Flag.Transfer) {
        //         oops.gui.open<WalletTransferPopUpParam>(UIID.WalletTransferPopUp, { equipment: walletBigCard.equipmentInfo });
        //     } else if (cbFlag == Flag.CancelSell) {
        //         this.cancelSell(walletBigCard.equipmentInfo);
        //     }
        // }

        // let param: EquipmentInfoPopUpParam = {
        //     equipment: walletBigCard.equipmentInfo,
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
        //         // {
        //         //     i18nKey: "wallet_btn_rent",
        //         //     btnColor: CardInfoPrefabBtnColor.Yellow,
        //         //     cbFlag: Flag.Rent
        //         // },
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
        // }
        // oops.gui.open(UIID.EquipmentInfoPopUp, param);
    }

    // async cancelSell(equip: core.IEquipment) {
    //     let d = await HttpHome.queryTradeId(core.NftType.NftTypeEquipment, equip.nftId)
    //     if (!d) { return };

    //     oops.gui.open<WalletCancelSellPopUpParam>(UIID.WalletCancelSellPopUp, {
    //         tradeId: d.trade.id,
    //         trade: d.trade,
    //     });
    // }
}

