import { _decorator, Component, Node, math, EditBox, Label, find } from 'cc';
import { LanguageData } from '../../core/gui/language/LanguageData';
import { LanguageLabel } from '../../core/gui/language/LanguageLabel';
import { AlertParam } from '../../core/gui/prompt/Alert';
import { tips } from '../../core/gui/prompt/TipsManager';
import { oops } from '../../core/Oops';
import { CommonUtil } from '../../core/utils/CommonUtil';
import { UIID } from '../common/config/GameUIConfig';
import HttpHome from '../common/net/HttpHome';
import TableEquipRaity from '../common/table/TableEquipRaity';
import TableNfts, { NftCfg } from '../common/table/TableNfts';
import { TradeState } from '../data/constant';
import { PlayerManger } from '../data/playerManager';
import WalletUtil from './WalletUtil';
import { WalletCard } from './widget/WalletCard';
import { WalletEquipment } from './widget/WalletEquipment';
import { WalletMaterial } from './widget/WalletMaterial';
const { ccclass, property, type } = _decorator;

@ccclass('WalletCancelSellPopUp')
export class WalletCancelSellPopUp extends Component {
    @type(LanguageLabel)
    nameLbl: LanguageLabel = null;
    @type(Label)
    priceLbl: Label = null;
    @type(EditBox)
    numEditbox: EditBox = null;
    @type(WalletCard)
    walletCard: WalletCard = null;
    @type(WalletEquipment)
    walletEquipment: WalletEquipment = null;
    @type(WalletMaterial)
    walletMaterial: WalletMaterial = null;
    @type(Node)
    setUpNode: Node = null;   
    @type(Node)
    confirmNode: Node = null;   
    param: WalletCancelSellPopUpParam = null;
    start() {

    }

    update(deltaTime: number) {

    }

    onAdded(param: WalletCancelSellPopUpParam) {
        this.param = param;
        this.walletMaterial.node.active = false;
        this.walletCard.node.active = false;
        this.walletEquipment.node.active = false;
        this.numEditbox.node.parent.active = false;
        this.priceLbl.node.parent.active = false;

        if (this.param.trade?.card) {
            let card = this.param.trade.card;
            this.walletCard.init(card);
            this.walletCard.node.active = true;
            this.nameLbl.dataID = this.walletCard.baseCard.cardCfg.name;

            this.priceLbl.string = `${CommonUtil.weiToEther(this.param.trade.bnbPrice).toFixed()}`;
            this.priceLbl.node.parent.active = true;
        } else if (this.param.trade?.equip) {
            let equip = this.param.trade.equip;
            this.walletEquipment.init(equip);
            this.walletEquipment.node.active = true;
            let name = TableEquipRaity.getInfoByEquipIdAndRarity(equip.protoId, equip.equipRarity)?.name;
            this.nameLbl.dataID = name;

            this.priceLbl.string = `${CommonUtil.weiToEther(this.param.trade.bnbPrice).toFixed()}`;
            this.priceLbl.node.parent.active = true;
        } else if (this.param.materialTrade) {
            let material = core.Material.create({
                total: this.param.materialTrade.cnt,
                tokenType: this.param.materialTrade.tokenType,
            })
            this.walletMaterial.init(material);
            this.walletMaterial.node.active = true;
            this.nameLbl.dataID = this.walletMaterial.baseMaterial.nftCfg.display_name;
            this.walletMaterial.setNum(this.param.materialTrade.cnt);

            this.numEditbox.node.parent.active = true;
            this.numEditbox.string = `${this.param.materialTrade.cnt}`;
            this.priceLbl.string = CommonUtil.weiToEther(this.param.materialTrade.bnbPrice).toFixed();
            this.editingDidEndClick(null, null);
        }

        this.setUpNode.active = true;
        this.confirmNode.active = false;

    }

    editingDidEndClick(e: Event, customEventData: string) {
        let num = Number(this.numEditbox.string);
        if (isNaN(num) || num <= 0) {
            num = 1;
        }
        num = num > this.param.materialTrade.cnt ? this.param.materialTrade.cnt : num;
        this.numEditbox.string = `${num}`;
        let price = CommonUtil.weiToEther(this.param.materialTrade.bnbPrice).times(num).toFixed();
        this.priceLbl.string = price;
    }

      
    async confimClick() {
        let gas = "0";
        let usd = "0";

        if (this.param.materialTrade) {
            let num = Number(this.numEditbox.string);
            if (num <= 0 || num > this.param.materialTrade.cnt) {
                oops.gui.toast('market_tips_err', true);
                return;
            }

            let _d = await HttpHome.queryGas("MaterialTradeCancelReq", watrade.MaterialTradeCancelReq.create({
                mainTradeId: this.param.materialTrade.id,
                cnt: num,
            }));
            if (_d) {
                gas = `${CommonUtil.weiToEther(_d.gas).toFixed()}`;
                usd = _d.usd;
            } else {
                return;
            }
        } else if (this.param.tradeId) {
            if (this.param.trade.tradeType == core.TradeType.Rental) {
                let _d = await HttpHome.queryGas("TradeCancelRentReq", watrade.TradeCancelRentReq.create({
                    tradeId: this.param.tradeId,
                }));
                if (_d) {
                    gas = `${CommonUtil.weiToEther(_d.gas).toFixed()}`;
                    usd = _d.usd;
                } else {
                    return;
                }
            } else if (this.param.trade.tradeType == core.TradeType.Trade) {
                let _d = await HttpHome.queryGas("TradeCancelSellReq", watrade.TradeCancelSellReq.create({
                    tradeId: this.param.tradeId,
                }));
                if (_d) {
                    gas = `${CommonUtil.weiToEther(_d.gas).toFixed()}`;
                    usd = _d.usd;
                } else {
                    return;
                }
            } else {
                return;
            }
        }

        this.setUpNode.active = false;
        this.confirmNode.active = true;

        find('numNode', this.confirmNode).active = !!this.param.materialTrade;
        if (this.param.materialTrade) {
            find('numNode/num', this.confirmNode).getComponent(Label).string = `${this.numEditbox.string}`;
        }

        find('priceNode', this.confirmNode).active = !!this.param.trade;
        if (this.param.trade) {
            find('priceNode/num', this.confirmNode).getComponent(Label).string = `${this.priceLbl.string}`;
        }

        find('poundageNode/num', this.confirmNode).getComponent(Label).string = `${gas}`;
        find('poundageNode/poundageLbl', this.confirmNode).getComponent(LanguageLabel).params = [
            {
                key: 'num1',
                value: `${1}`,
            },
            {
                key: 'num2',
                value: `${usd}`,
            }
        ];
    }

    textChangedCheckNumber(text: string, e: EditBox, customEventData: string) {
        e.string = WalletUtil.checkNumber(text, customEventData);
    }

      
    cancelSellClick() {
        if (this.param.materialTrade) {
            this.materialCancelSell();
        } else if (this.param.trade?.card) {
            this.cancelSell();
        } else if (this.param.trade?.equip) {
            this.cancelSell();
        }
    }

    materialCancelSell() {
        let num = Number(this.numEditbox.string);
        let trade = this.param.materialTrade;
        let subTradeId = 0;

        let closeCB = () => {
            tips.hideNetLoadigMask();
            this.closeClick();
            oops.gui.remove(UIID.MaterialInfoPopUp);
        }

        let cb = async () => {
            let d = await HttpHome.materialTradeState(subTradeId);
            if (d.state == TradeState.StateOk) {
                this.param.succCB && this.param.succCB(num);
                // let materialType = this.param.materialTrade.tokenType;
                PlayerManger.getInstance().playerSelfInfo.refreshData;

                closeCB();
            } else if (d.state == TradeState.StateFailed) {
                  
                oops.gui.toast('market_fail', true);
                closeCB();
            } else {
                this.scheduleOnce(cb, 10);
            }
        };

        HttpHome.materialTradeCancel(trade.id, num)
            .then((d: watrade.MaterialTradeCancelResp) => {
            }).catch(async (e: { code: errcode.ErrCode, data: watrade.MaterialTradeCancelResp }) => {
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
                    tips.hideNetLoadigMask();
                    closeCB();
                }
            });
    }

    cancelSell() {
        let tradeId = this.param.tradeId;
        let cb = async () => {
            let d = await HttpHome.tradeState(tradeId);
            if (d.state == TradeState.StateClosed) {
                this.param.succCB && this.param.succCB();
                PlayerManger.getInstance().playerSelfInfo.refreshData();

                oops.gui.remove(UIID.CardInfoPopUp);
                oops.gui.remove(UIID.EquipmentInfoPopUp);
                this.closeClick();
                tips.hideNetLoadigMask();
                // if (this.param.trade?.card) {
                //     PlayerManger.getInstance().cardManager.refreshData();
                //     oops.gui.remove(UIID.CardInfoPopUp);
                // } else if (this.param.trade?.equip) {
                //     PlayerManger.getInstance().equipManager.refreshData();
                //     oops.gui.remove(UIID.EquipmentInfoPopUp);
                // }
            } else if (d.state == TradeState.StateCreated) {
                  
                oops.gui.toast('market_fail', true);
                tips.hideNetLoadigMask();
            } else {
                this.scheduleOnce(cb, 10);
            }
        };

        if (this.param.trade.tradeType == core.TradeType.Rental) {
            HttpHome.tradeCancelRent(tradeId)
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
                        tips.hideNetLoadigMask();
                    }
                });
        } else {
            HttpHome.tradeCancelSell(tradeId)
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
                        tips.hideNetLoadigMask();
                    }
                });
        }
    }

    closeClick() {
        oops.gui.removeByNode(this.node, true);
    }
}

export type WalletCancelSellPopUpParam = {
    tradeId?: number,
    materialTrade?: watrade.IMaterialTrade,
    trade?: watrade.ITrade,
    succCB?: (num?: number) => void,
}