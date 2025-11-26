import { Event } from "cc";
import { oops } from "../../core/Oops";
import { CardInfoBtnPrefabInfo, CardInfoPrefabBtnColor } from "../common/common/CardInfoPrefab";
import { UIID } from "../common/config/GameUIConfig";
import HttpHome from "../common/net/HttpHome";
import TableCards from "../common/table/TableCards";
import TableEquip from "../common/table/TableEquip";
import { PlayerManger } from "../data/playerManager";
import { CardInfoPopUpParam } from "../infoPopUp/cardInfoPopUp/CardInfoPopUp";
import { EquipmentInfoPopUpParam } from "../infoPopUp/equipmentInfoPopUp/EquipmentInfoPopUp";
import { WalletCancelSellPopUpParam } from "./WalletCancelSellPopUp";
import { WalletRentPopUpParam } from "./WalletRentPopUp";
import { WalletSellPopUpParam } from "./WalletSellPopUp";
import { WalletTransferPopUpParam } from "./WalletTransferPopUp";
import { CommonUtil } from "../../core/utils/CommonUtil";
import { CardUtils } from "../common/utils/CardUtils";

export type CurrItem = {
    icon: string, // icon
    iconStroke: string,   
    i18Key: string,   
    currType: CurrType,   
    serverName: string,   
    rates: { [key: number]: string },   
}

  
export enum CurrType {
      
    GDGG,
      
    GDNA,
      
    DGG,
      
    DNA,
    /** ETH */
    BNB,
    /** DGG */
    DGGV2,
}

  
export let CurrItems: { [key: number]: CurrItem } = {
    [CurrType.GDGG]: {
        icon: "Dgg_icon",
        iconStroke: "Dgg_icon_s",
        i18Key: "wallet_gdgg",
        currType: CurrType.GDGG,
        serverName: "DGG",
        rates: {},
    },
    [CurrType.GDNA]: {
        icon: "Dna_icon",
        iconStroke: "Dna_icon_s",
        i18Key: "wallet_gdna",
        currType: CurrType.GDNA,
        serverName: "DNA",
        rates: {},
    },
    [CurrType.DGG]: {
        icon: "Dgg_icon",
        iconStroke: "Dgg_icon_s",
        i18Key: "wallet_dgg",
        currType: CurrType.DGG,
        serverName: "DGG",
        rates: {},
    },
    [CurrType.DGGV2]: {
        icon: "Dggv2_icon",
        iconStroke: "Dggv2_icon_s",
        i18Key: "wallet_dggv2",
        currType: CurrType.DGGV2,
        serverName: "DGGV2",
        rates: {},
    },
    [CurrType.DNA]: {
        icon: "Dna_icon",
        iconStroke: "Dna_icon_s",
        i18Key: "wallet_dna",
        currType: CurrType.DNA,
        serverName: "DNA",
        rates: {},
    },
    [CurrType.BNB]: {
        icon: "Bnb_icon",
        iconStroke: "Bnb_icon_s",
        i18Key: "wallet_bnb",
        currType: CurrType.BNB,
        serverName: "ETH", // BNB
        rates: {},
    },
}

export enum TradeFlagState {
      
    RENT_TIME,
      
    SALE,
      
    RENT,
      
    READY,
      
    NOT_READY,
      
    ASSIST,
      
    LOCKED,
      
    PVEWEEK,
      
    LOCALBOUND,
      
    ISQUESTION,
}

class WalletUtil {
    walletFlag: number = 0;   
    marketFlag: number = 0;   
    fNum: number = 1;   
      
    getCurrByType(currType: CurrType) {
        let curr = '0';
        switch (currType) {
            case CurrType.BNB:
                curr = PlayerManger.getInstance().playerSelfInfo.onChainBnb;
                break;
            case CurrType.DGG:
                curr = PlayerManger.getInstance().playerSelfInfo.onChainDgg;
                break;
            case CurrType.DNA:
                curr = PlayerManger.getInstance().playerSelfInfo.onChainDna;
                break;
            case CurrType.DGGV2:
                curr = PlayerManger.getInstance().playerSelfInfo.dggv2;
                break;
            case CurrType.GDGG:
                curr = PlayerManger.getInstance().playerSelfInfo.dgg;
                break;
            case CurrType.GDNA:
                curr = PlayerManger.getInstance().playerSelfInfo.dna;
                break;
            default:
                break;
        }
        return curr;
    }

      
    getTotalCurrByType(currType: CurrType) {
        let curr = '0';
        switch (currType) {
            case CurrType.BNB:
                curr = this.getCurrByType(currType);
                break;
            case CurrType.DGGV2:
                curr = this.getCurrByType(currType);
                break;
            case CurrType.DGG:
                curr = new BigNumber(0)
                    .plus(this.getCurrByType(CurrType.DGG))
                    .plus(this.getCurrByType(CurrType.GDGG))
                    .toFixed();
                break;
            case CurrType.DNA:
                curr = new BigNumber(0)
                    .plus(this.getCurrByType(CurrType.DNA))
                    .plus(this.getCurrByType(CurrType.GDNA))
                    .toFixed();
                break;
            default:
                break;
        }
        return curr;
    }

    EthToURate: BigNumber = null;
      
    async getEthToU(bnb: string, isForce: boolean = false) {
        if (!this.EthToURate || isForce) {
            let rate = new BigNumber(1);
            let __d = await HttpHome.checkBuySixCardNftPrice();
            if (__d) {
                rate = CommonUtil.weiToEther(__d.price).div(50);
            }
            this.EthToURate = rate;
        }
        let u = new BigNumber(bnb).div(this.EthToURate).toString();
        let bigU = new BigNumber(u);

        let keep = 4;   
        let min = "0.0001";
        if (bigU.lt(min)) {
            u = min.toString();
        }

        let max = "1000";
        if (bigU.gte(1) && bigU.lt(max)) {
            keep = 3;
        }

        if (bigU.gte(max)) {
            keep = 0;
        }

        let d = u.split(".");
        if (d[1]) {
            if (keep > 0) {
                d[1] = d[1].substring(0, keep);
                u = d[0] + "." + d[1];
            } else {
                u = d[0];
            }
        }
        return u;
    }

    nftEquipStatetoLocalState(equipment: core.IEquipment) {
        let info = TableEquip.getInfoById(equipment.protoId);
        let state = TradeFlagState.NOT_READY;
        switch (equipment.state) {
            case core.NftState.NftStateBlank:   
                if (equipment.durability >= info.durability_max) {
                    state = TradeFlagState.READY;
                } else {
                    state = TradeFlagState.NOT_READY;
                }
                break;
            case core.NftState.NftStateSelling:   
                state = TradeFlagState.SALE;
                break;
            case core.NftState.NftStateRenting:   
                state = TradeFlagState.RENT_TIME;
                break;
            case core.NftState.NftStateAssist:   
                state = TradeFlagState.ASSIST;
                break;
            case core.NftState.NftStateLock
                || core.NftState.NftStateLockInGame:   
                state = TradeFlagState.LOCKED;
                break;
            default:
                break;
        };
        // if (equipment.pveWeek != 0 && equipment.pveWeek == PlayerManger.getInstance().playerSelfInfo.sysPveWeek) {
        if (this.calcPvePower(equipment.pvePower.toString()) > 0) {
            state = TradeFlagState.PVEWEEK;
        }
        return { state: state };
    }
    nftCardStatetoLocalState(card: core.ICard) {
        let info = TableCards.getInfoByProtoIdAndLv(card.protoId, card.level);
        let state = TradeFlagState.NOT_READY;
        let rentTime = 0;
        switch (card.state) {
            case core.NftState.NftStateBlank:   
                if (card.power >= info.max_power) {
                    state = TradeFlagState.READY;
                } else {
                    state = TradeFlagState.NOT_READY;
                }
                break;
            case core.NftState.NftStateSelling:   
                state = TradeFlagState.SALE;
                break;
            case core.NftState.NftStateRenting:   
                let d = this.getRentState(card);
                state = d.state;
                rentTime = d.rentTime;
                break;
            case core.NftState.NftStateAssist:   
                state = TradeFlagState.ASSIST;
                break;
            case core.NftState.NftStateLock
                || core.NftState.NftStateLockInGame:   
                state = TradeFlagState.LOCKED;
                break;
            default:
                break;
        };
        // if (card.pveWeek != 0 && card.pveWeek == PlayerManger.getInstance().playerSelfInfo.sysPveWeek) {
        if (this.calcPvePower(card.pvePower.toString()) > 0) {
            state = TradeFlagState.PVEWEEK;
        }
        if (state == TradeFlagState.READY && card.localBound) {
            state = TradeFlagState.LOCALBOUND;
        }
        let questionArgs = PlayerManger.getInstance().cardManager.questionArgs;
        if (questionArgs && state == TradeFlagState.READY && CardUtils.isToDay(questionArgs.ymd) && questionArgs.cards.findIndex(e => e == card.id) != -1) {
            state = TradeFlagState.ISQUESTION;
        }
        return { state: state, rentTime: rentTime };
    }

      
    calcPvePower(time: string, n: number = 1) {
        const date = new Date();
        date.setUTCFullYear(Number(time.substring(0, 4)));
        date.setUTCMonth(Number(time.substring(4, 6)) - 1);
        date.setUTCDate(Number(time.substring(6, 8)) + n);
        date.setUTCHours(0);
        date.setUTCMinutes(0);
        date.setUTCSeconds(0);
        date.setUTCMilliseconds(0);

        const date1 = new Date();

        let t = Math.floor((date.getTime() - date1.getTime()) / 1000);
        return t;
    }

    checkNumber(text: string, customEventData: string) {
        let numText = '0';
        let num = new BigNumber(text);
        if (num.isNaN() == true) return numText;
        if (customEventData == 'int') {
            numText = num.toFixed(0);
        } else if (customEventData == 'double' || !!!customEventData) {
            numText = num.toFixed(5, BigNumber.ROUND_FLOOR);
            numText = new BigNumber(numText).toFixed();
        }
        let max = 9999999;
        if (new BigNumber(numText).gt(max)) {
            numText = `${max}`;
        }
        return numText;
    }
    getUnixTime() {
        let date = new Date();
        var strtime = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 00:00:00Z`;
        let t = new Date(strtime).getTime();
        return t;
    }

      
    getRentState(card: core.ICard) {
        let state = TradeFlagState.RENT;
        let now = new Date().getTime() / 1000;
        let _rentTime = 0;
        let t1 = card.onChainLeaseEndAt;//new Date(new Date(card.onChainLeaseEndAt * 1000).setHours(0, 0, 0, 0)).getTime() / 1000;
        if (card.onChainRenter && card.onChainTenantStartAt > 0 && card.onChainLeaseDays > 0) {   
            let t = Math.floor(card.onChainTenantStartAt / 60 / 60 / 24) * 24 * 60 * 60; //new Date(new Date(card.onChainTenantStartAt * 1000).setHours(0, 0, 0, 0)).getTime() / 1000;
            let rentTime = t + card.onChainLeaseDays * 24 * 60 * 60;   
            let rentTime1 = t1;   
            if (rentTime > now) {   
                _rentTime = rentTime;
                state = TradeFlagState.RENT_TIME;
            } else if (rentTime1 > now) {   
                _rentTime = rentTime1;
                state = TradeFlagState.RENT
            } else {
                state = TradeFlagState.READY;
            }
        } else {   
            if (card.onChainLeaseEndAt < now) {   
                state = TradeFlagState.READY;
            } else {   
                _rentTime = t1
                state = TradeFlagState.RENT;
            }
        }
        return {
            state: state,
            rentTime: _rentTime,
        };
    }

    async openWalletInfo(walletSellPopUpParam: WalletSellPopUpParam) {
        enum Flag {
            Sell = "Sell",
            CancelSell = "CancelSell",
            Rent = "Rent",
            Transfer = "Transfer",
        }
        let cb = async (event: Event, cbFlag: Flag): Promise<void> => {
            if (cbFlag == Flag.Sell) {
                oops.gui.open<WalletSellPopUpParam>(UIID.WalletSellPopUp, walletSellPopUpParam);
            } else if (cbFlag == Flag.Rent) {
                oops.gui.open<WalletRentPopUpParam>(UIID.WalletRentPopUp, walletSellPopUpParam);
            } else if (cbFlag == Flag.Transfer) {
                oops.gui.open<WalletTransferPopUpParam>(UIID.WalletTransferPopUp, walletSellPopUpParam);
            } else if (cbFlag == Flag.CancelSell) {
                this.cancelSell(walletSellPopUpParam);
            }
        }

        let state = TradeFlagState.NOT_READY;
        if (walletSellPopUpParam.card) {
            state = this.nftCardStatetoLocalState(walletSellPopUpParam.card).state;
        } else if (walletSellPopUpParam.equipment) {
            state = this.nftEquipStatetoLocalState(walletSellPopUpParam.equipment).state;
        }
        let btns: CardInfoBtnPrefabInfo[] = [];
        if (state == TradeFlagState.READY) {
            btns.push({
                i18nKey: "wallet_btn_sell",
                btnColor: CardInfoPrefabBtnColor.Green,
                cbFlag: Flag.Sell,
            });
            if (walletSellPopUpParam.card) {   
                // btns.push({
                //     i18nKey: "wallet_btn_rent",
                //     btnColor: CardInfoPrefabBtnColor.Yellow,
                //     cbFlag: Flag.Rent
                // });
            }
            btns.push({
                i18nKey: "wallet_title_transfer",
                btnColor: CardInfoPrefabBtnColor.Blue,
                cbFlag: Flag.Transfer
            });
        } else if (state == TradeFlagState.SALE) {
            btns = [
                {
                    i18nKey: "wallet_btn_cancelsell",
                    btnColor: CardInfoPrefabBtnColor.Red,
                    cbFlag: Flag.CancelSell,
                },
            ]
        } else if (state == TradeFlagState.RENT) {
              
            btns = [
                {
                    i18nKey: "wallet_btn_cancelsell",
                    btnColor: CardInfoPrefabBtnColor.Green,
                    cbFlag: Flag.CancelSell,
                },
            ]
        }

        if (walletSellPopUpParam.card) {
            let param: CardInfoPopUpParam = {
                card: walletSellPopUpParam.card,
                btns: btns,
                cb: cb,
            }
            oops.gui.open(UIID.CardInfoPopUp, param);
        } else if (walletSellPopUpParam.equipment) {
            let param: EquipmentInfoPopUpParam = {
                equipment: walletSellPopUpParam.equipment,
                btns: btns,
                cb: cb,
            }
            oops.gui.open(UIID.EquipmentInfoPopUp, param);
        }
    }

    async cancelSell(walletSellPopUpParam: WalletSellPopUpParam) {
        let nftId = 0;
        let nftType = core.NftType.NftTypeCard;
        if (walletSellPopUpParam.card) {
            nftType = core.NftType.NftTypeCard;
            nftId = walletSellPopUpParam.card.nftId;
        } else if (walletSellPopUpParam.equipment) {
            nftType = core.NftType.NftTypeEquipment;
            nftId = walletSellPopUpParam.equipment.nftId;
        }
        let d = await HttpHome.queryTradeId(nftType, nftId)
        if (!d) { return };

        oops.gui.open<WalletCancelSellPopUpParam>(UIID.WalletCancelSellPopUp, {
            tradeId: d.trade.id,
            trade: d.trade
        });
    }
}

export default new WalletUtil();