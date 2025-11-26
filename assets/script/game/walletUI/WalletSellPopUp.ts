import { _decorator, Component, Node, math, EditBox, Label, find } from 'cc';
import { LanguageData } from '../../core/gui/language/LanguageData';
import { LanguageLabel } from '../../core/gui/language/LanguageLabel';
import { AlertParam } from '../../core/gui/prompt/Alert';
import { tips } from '../../core/gui/prompt/TipsManager';
import { oops } from '../../core/Oops';
import { CommonUtil } from '../../core/utils/CommonUtil';
import { UIID } from '../common/config/GameUIConfig';
import HttpHome from '../common/net/HttpHome';
import TableCards from '../common/table/TableCards';
import TableEquipRaity from '../common/table/TableEquipRaity';
import { NftCfg } from '../common/table/TableNfts';
import { TradeState } from '../data/constant';
import { PlayerManger } from '../data/playerManager';
import WalletUtil from './WalletUtil';
import { WalletCard } from './widget/WalletCard';
import { WalletEquipment } from './widget/WalletEquipment';
import { WalletMaterial } from './widget/WalletMaterial';
const { ccclass, property, type } = _decorator;

@ccclass('WalletSellPopUp')
export class WalletSellPopUp extends Component {
    @type(LanguageLabel)
    nameLbl: LanguageLabel = null;
    @type(EditBox)
    editBox: EditBox = null;
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
    param: WalletSellPopUpParam = null;
    tradeId: number = 0;
    tokenType: core.NftType = 0;
    start() {

    }

    update(deltaTime: number) {

    }

    onAdded(param: WalletSellPopUpParam) {
        this.walletCard.node.active = false;
        this.walletEquipment.node.active = false;
        this.walletMaterial.node.active = false;
        this.param = param;
        if (this.param.card) {
            this.tradeId = this.param.card.nftId;
            this.tokenType = core.NftType.NftTypeCard;
            this.walletCard.init(this.param.card);
            this.walletCard.node.active = true;
            this.nameLbl.dataID = this.walletCard.baseCard.cardCfg.name;
        } else if (this.param.equipment) {
            this.tradeId = this.param.equipment.nftId;
            this.walletEquipment.init(this.param.equipment);
            this.tokenType = core.NftType.NftTypeEquipment;
            this.walletEquipment.node.active = true;
            let name = TableEquipRaity.getInfoByEquipIdAndRarity(this.param.equipment.protoId, this.param.equipment.equipRarity)?.name;
            this.nameLbl.dataID = name;
        } else if (this.param.material) {
            this.tradeId = this.param.material.tokenType;
            // this.tokenType = core.NftType.nft;
            this.walletMaterial.init(this.param.material);
            this.walletMaterial.node.active = true;
            this.nameLbl.dataID = this.walletMaterial.baseMaterial.nftCfg.display_name;
        }

        this.setUpNode.active = true;
        this.confirmNode.active = false;
    }

      
    async confimClick() {
        if (this.param.card && this.param.card.power < this.walletCard.baseCard.cardCfg.max_power) {
            return oops.gui.toast('_err_1509', true);   
        } else if (this.param.equipment && this.param.equipment.durability < this.walletEquipment.baseEquip.equipmentCfg.durability_max) {
            return oops.gui.toast('_err_1607', true);   
        }

        let price = this.editBox.string;
        if (new BigNumber(price).lte(0)) {
            oops.gui.toast('market_tips_err', true);
            return
        }

        let gas = "0";
        let usd = "0";
        let _d = await HttpHome.queryGas("TradeSellReq", watrade.TradeSellReq.create({
            tokenId: this.tradeId,
            tokenType: this.tokenType,
            bnbPrice: CommonUtil.etherToWei(this.editBox.string).toFixed(),
        }));
        if (_d) {
            gas = `${CommonUtil.weiToEther(_d.gas).toFixed()}`;
            usd = _d.usd;
        } else {
            return;
        }

        this.setUpNode.active = false;
        this.confirmNode.active = true;

        find('priceNode/num', this.confirmNode).getComponent(Label).string = `${price}`;
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

        let p = e.string;
        let d = p.split(".");
        if (d[1]) {
            d[1] = d[1].substring(0, 5);
            p = d[0] + "." + d[1];
        }
        e.string = p
    }

      
    async sellClick() {
        let price = this.editBox.string;
        let nftId = this.tradeId;

        let closeCB = () => {
            this.closeClick();
            oops.gui.remove(UIID.CardInfoPopUp);
            oops.gui.remove(UIID.EquipmentInfoPopUp);
        }

        HttpHome.tradeSell(nftId, this.tokenType, price)
            .then((d: watrade.TradeSellResp) => {
            }).catch(async (e: { code: errcode.ErrCode, data: watrade.TradeSellResp }) => {

                let cb = async () => {
                    let d = await HttpHome.tradeState(e.data.tradeId);
                    if (d.state == TradeState.StateCreated || d.state == TradeState.StateLeased) {
                        let id = 0;
                        PlayerManger.getInstance().playerSelfInfo.refreshData();
                        if (this.param.card) {
                            id = this.param.card.nftId;
                        } else if (this.param.equipment) {
                            id = this.param.equipment.nftId;
                        }
                        closeCB();

                        oops.gui.open<AlertParam>(UIID.Alert, {
                            content: LanguageData.getLangByIDAndParams('wallet_tips1', [
                                {
                                    key: "id",
                                    value: `${id}`
                                }
                            ]),
                            okCB: () => { },
                        });

                        tips.hideNetLoadigMask();
                    } else if (d.state == TradeState.StateClosed) {
                          
                        oops.gui.toast('market_fail1', true);
                        tips.hideNetLoadigMask();
                    } else {
                        this.scheduleOnce(cb, 10);
                    }
                }

                if (e.code == errcode.ErrCode.WaitComplete) {
                    tips.showNetLoadigMask({
                        content: "netInstableOpen",
                        isShowCloseCD: true,
                        cb: () => {
                            this.unschedule(cb);
                            closeCB();
                        }
                    })
                    this.scheduleOnce(cb, 10);
                } else {
                    tips.hideNetLoadigMask();
                }
            });
    }

    closeClick() {
        oops.gui.removeByNode(this.node, true);
    }
}

export type WalletSellPopUpParam = {
    card?: core.ICard,
    equipment?: core.IEquipment,
    material?: core.IMaterial,
}