import { _decorator, Component, Node, Event, instantiate, Prefab } from 'cc';
import { oops } from '../../../core/Oops';
import { CardInfoPrefabBtnColor } from '../../common/common/CardInfoPrefab';
import { UIID } from '../../common/config/GameUIConfig';
import TableNfts, { NftCfg } from '../../common/table/TableNfts';
import { FunComp } from '../widget/FunComp';
import { WalletBigCard } from '../widget/WalletBigCard';
import { MaterialInfoPopUpParam } from '../../infoPopUp/materialInfoPopUp/MaterialInfoPopUp';
import { WalletTransferPopUpParam } from '../WalletTransferPopUp';
import WalletUtil, { TradeFlagState } from '../WalletUtil';
import { WalletItemSellPopUpParam } from '../WalletItemSellPopUp';
import { Message } from '../../../core/common/event/MessageManager';
import { DataEvent } from '../../data/dataEvent';
import { PlayerManger } from '../../data/playerManager';
import HttpHome from '../../common/net/HttpHome';
import { tips } from '../../../core/gui/prompt/TipsManager';
import { netChannel } from '../../common/net/NetChannelManager';
import { CommonUtil } from '../../../core/utils/CommonUtil';
import { AlertParam } from '../../../core/gui/prompt/Alert';
import { LanguageData } from '../../../core/gui/language/LanguageData';
import { BlindBoxOpenPopUpParam } from '../../blindBox/BlindBoxOpenPopUp';
import TableBlindBox from '../../common/table/TableBlindBox';
const { ccclass, property, type } = _decorator;

enum SortEnum {
      
    Name,
}

  
enum SerachEnum {
      
    All,
      
    ForSale,
}

@ccclass('WalletItemComp')
export class WalletItemComp extends Component {
    @type([Node])
    svNodes: Node[] = [];
    @type(Node)
    materialItemNode: Node = null;
    @type(FunComp)
    funComp: FunComp = null;
    @type(Prefab)
    walletCardPrefab: Prefab = null;
    sortLblKeys: { [key: number]: string } = {
        [SortEnum.Name]: "wallet_btn_namesort",
    }

    serachLblKeys: { [key: number]: string } = {
        [SerachEnum.All]: "wallet_btn_all",
        // [SerachEnum.ForSale]: "wallet_btn_forsale",
    }
    sort: SortEnum = SortEnum.Name;
    serach: SerachEnum = SerachEnum.All;
    isShow = false;
    start() {
        this.addEvent();
    }

    update(deltaTime: number) {

    }

    onDestroy() {
        this.removeEvent();
    }

    addEvent() {
        Message.on(DataEvent.DATA_MATERIALS_CHANGE, this.updMsg, this);
    }
    removeEvent() {
        Message.off(DataEvent.DATA_MATERIALS_CHANGE, this.updMsg, this);
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

    updMsg() {
        if (this.isShow) {
            this.updData(this.sort, this.serach);
        }
    }

    async updData(sort: SortEnum, serach: SerachEnum) {
        this.sort = sort;
        this.serach = serach;

        this.materialItemNode.destroyAllChildren();
        let materials = PlayerManger.getInstance().playerSelfInfo.materials;
        let _materials: core.IMaterial[] = materials.filter((v, k) => v.total - v.locking > 0);

        _materials.sort((a, b) => {
            if (sort == SortEnum.Name) {   
                let aName = TableNfts.getInfoByMaterialType(a.tokenType).display_name;
                let bName = TableNfts.getInfoByMaterialType(b.tokenType).display_name;
                if (aName == bName) {
                    return a.tokenType - b.tokenType;
                } else {
                    return aName.localeCompare(bName);
                }
            }
        })

        let blindBoxData = await HttpHome.queryBlindbox().catch(() => { });
        this.materialItemNode.destroyAllChildren();
        if (blindBoxData) {
            let count = 0;
            for (const key in blindBoxData.boxes) {
                count += blindBoxData.boxes[key];
            }
            if (count > 0) {
                let blindBox = instantiate(this.walletCardPrefab).getComponent(WalletBigCard);
                blindBox.initBlindBox(blindBoxData.boxes, this.blindBoxClick.bind(this));
                this.materialItemNode.addChild(blindBox.node);
                blindBox.setMaterialState(TradeFlagState.READY);
            }
        }

        WalletUtil.walletFlag++
        let currFlay = WalletUtil.walletFlag

        for (let index = 0; index < _materials.length; index++) {
            if (index % WalletUtil.fNum == 0) await CommonUtil.waitCmpt(this, 0);
            if (currFlay != WalletUtil.walletFlag) return;
            let _material = _materials[index];
            let material = instantiate(this.walletCardPrefab).getComponent(WalletBigCard);
            material.initMaterial(_material, this.cardClick.bind(this));
            this.materialItemNode.addChild(material.node);

            material.setMaterialState(TradeFlagState.READY)
        }
    }
    blindBoxClick(walletBigCard: WalletBigCard) {
        let boxId = -1;
        for (const key in walletBigCard.blindBoxInfo) {
            let count = walletBigCard.blindBoxInfo[key];
            if (count > 0) {
                boxId = Number(key);
                break;
            }
        }
        if (boxId == -1) return;
        let data = pkgcs.CsBlindBoxOpenReq.create({
            id: Number(boxId),
        });
        let okCB = async () => {
            let d = await netChannel.home.reqUnique(opcode.OpCode.CsBlindBoxOpenReq, opcode.OpCode.ScBlindBoxOpenResp, data);
            if (d.code == errcode.ErrCode.WaitComplete) {
                let _d = await tips.showNetLoadigMask<pkgsc.ScBlindBoxOpenPush>({
                    content: "blind_page_alert_0",
                    closeEventName: `${opcode.OpCode.ScBlindBoxOpenPush}`,
                })
                oops.gui.remove(UIID.MaterialInfoPopUp, true);
                if (_d?.code == errcode.ErrCode.Ok) {
                    walletBigCard.walletBlindBox.setNum(walletBigCard.walletBlindBox.count - 1);
                    if (walletBigCard.walletBlindBox.count <= 0) {
                        walletBigCard.node.destroy();
                    }

                    oops.gui.open<BlindBoxOpenPopUpParam>(UIID.BlindBoxOpenPopUp, { blindBoxData: _d });
                }
            }
        }

        let openCB = async () => {
            let gas = "0";
            let usd = "0";
            let _d = await HttpHome.queryGas("CsBlindBoxOpenReq", data);
            if (_d) {
                gas = `${CommonUtil.weiToEther(_d.gas).toFixed()}`;
                usd = _d.usd;
            } else {
                return;
            }
            oops.gui.open<AlertParam>(UIID.Alert, {
                content: LanguageData.getLangByIDAndParams('blind_box_buy_tips2', [
                    {
                        key: "gas",
                        value: `${gas}`
                    },
                ]),
                okCB: () => { okCB(); },
                cancelCB: () => { },
            });
        }

        let box = TableBlindBox.getInfoById(boxId);
        let nft = TableNfts.cfg.find(v => v.sub_type == box.type);


        enum Flag {
            Open = "Open",
        }
        let cb = (event: Event, cbFlag: Flag): void => {
            if (cbFlag == Flag.Open) {
                openCB();
            }
        }

        let param: MaterialInfoPopUpParam = {
            nft: nft,
            btns: [],
            cb: cb,
        }
        if (walletBigCard.state == TradeFlagState.READY) {
            param.btns = [
                {
                    i18nKey: "wallet_btn_open",
                    btnColor: CardInfoPrefabBtnColor.Green,
                    cbFlag: Flag.Open,
                },
            ];
        }
        oops.gui.open(UIID.MaterialInfoPopUp, param);
    }

    cardClick(walletBigCard: WalletBigCard) {
        enum Flag {
            Sell = "Sell",
            CancelSell = "CancelSell",
            Rent = "Rent",
            Transfer = "Transfer",
        }
        let cb = (event: Event, cbFlag: Flag): void => {
            if (cbFlag == Flag.Sell) {
                oops.gui.open<WalletItemSellPopUpParam>(UIID.WalletItemSellPopUp, { material: walletBigCard.materialInfo, state: walletBigCard.state });
            } else if (cbFlag == Flag.Rent) {
                // oops.gui.open<WalletRentPopUpParam>(UIID.WalletRentPopUp, { material: walletBigCard.materialInfo });
            } else if (cbFlag == Flag.Transfer) {
                oops.gui.open<WalletTransferPopUpParam>(UIID.WalletTransferPopUp, { material: walletBigCard.materialInfo });
            } else if (cbFlag == Flag.CancelSell) {
                // this.cancelSell(walletBigCard.equipmentInfo);
            }
        }

        let param: MaterialInfoPopUpParam = {
            material: walletBigCard.materialInfo,
            btns: [
                // {
                //     i18nKey: "wallet_btn_rent",
                //     btnColor: CardInfoPrefabBtnColor.Yellow,
                //     cbFlag: Flag.Rent
                // }
            ],
            cb: cb,
        }
        if (walletBigCard.state == TradeFlagState.READY) {
            param.btns = [
                {
                    i18nKey: "wallet_btn_sell",
                    btnColor: CardInfoPrefabBtnColor.Green,
                    cbFlag: Flag.Sell,
                },
                {
                    i18nKey: "wallet_title_transfer",
                    btnColor: CardInfoPrefabBtnColor.Blue,
                    cbFlag: Flag.Transfer
                },
            ];
        } else if (walletBigCard.state == TradeFlagState.SALE) {
            // param.btns = [
            //     {
            //         i18nKey: "wallet_btn_cancelsell",
            //         btnColor: CardInfoPrefabBtnColor.Red,
            //         cbFlag: Flag.Sell,
            //     },
            // ];
        }
        oops.gui.open(UIID.MaterialInfoPopUp, param);
    }


    // async cancelSell(equip: core.IEquipment) {
    //     let d = await HttpHome.queryTradeId(core.NftType.NftTypeEquipment, equip.nftId)
    //     if (!d) { return };

    //     let tradeId = d.tradeId;
    //     let cb = async () => {
    //         let d = await HttpHome.materialTradeState(tradeId);
    //         if (d.state == TradeState.StateClosed) {
    //             PlayerManger.getInstance().cardManager.refreshData();
    //             tips.hideNetLoadigMask();
    //             oops.gui.remove(UIID.CardInfoPopUp);
    //         } else if (d.state == TradeState.StateCreated) {
      
    //             oops.gui.toast('market_fail', true);
    //             tips.hideNetLoadigMask();
    //         } else {
    //             this.scheduleOnce(cb, 10);
    //         }
    //     };

    //     HttpHome.materialTradeCancel(tradeId, 1)
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
    // }
}

