import { _decorator, Component, Node, Sprite, Label, find, instantiate, RichText } from 'cc';
import { LanguageLabel } from '../../core/gui/language/LanguageLabel';
import { tips } from '../../core/gui/prompt/TipsManager';
import { oops } from '../../core/Oops';
import { CommonUtil } from '../../core/utils/CommonUtil';
import { UIID } from '../common/config/GameUIConfig';
import HttpHome from '../common/net/HttpHome';
import TableCards from '../common/table/TableCards';
import TableEquipRaity from '../common/table/TableEquipRaity';
import { TradeState } from '../data/constant';
import { PlayerManger } from '../data/playerManager';
import { ResManger } from '../data/resManger';
import { CardDetails } from '../infoPopUp/cardInfoPopUp/CardDetails';
import { EquipmentDetails } from '../infoPopUp/equipmentInfoPopUp/EquipmentDetails';
import { MaterialDetails } from '../infoPopUp/materialInfoPopUp/MaterialDetails';
import WalletUtil, { CurrType } from '../walletUI/WalletUtil';
import { WalletCard } from '../walletUI/widget/WalletCard';
import { WalletEquipment } from '../walletUI/widget/WalletEquipment';
import { WalletMaterial } from '../walletUI/widget/WalletMaterial';
const { ccclass, property, type } = _decorator;

@ccclass('MarketCardInfoPopUp')
export class MarketCardInfoPopUp extends Component {
    @type(LanguageLabel)
    titleLbl: LanguageLabel = null;   
    @type(Label)
    idLbl: Label = null;
    @type(LanguageLabel)
    cardNameLbl: LanguageLabel = null;   
    @type(Label)
    cardTradeIdLbl: Label = null;   

    @type(WalletCard)
    walletCard: WalletCard = null;
    @type(CardDetails)
    cardDetails: CardDetails = null;

    @type(WalletEquipment)
    walletEquipment: WalletEquipment = null;
    @type(EquipmentDetails)
    equipmentDetails: EquipmentDetails = null;
    @type(WalletMaterial)
    walletMaterial: WalletMaterial = null;
    @type(MaterialDetails)
    materialDetails: MaterialDetails = null;

    @type(Node)
    buyInfoNode: Node = null;   
    @type(Node)
    rentInfoNode: Node = null;   

    tradeInfo: watrade.ITrade = null;
    materialTradeInfo: watrade.IMaterialTrade = null;
    start() {

    }

    update(deltaTime: number) {

    }

    onAdded(param: MarketCardInfoPopUpParm) {
        if (param.trade) {
            let trade = param.trade;
            this.tradeInfo = trade;

            this.buyInfoNode.active = trade.tradeType == core.TradeType.Trade;
            this.rentInfoNode.active = trade.tradeType == core.TradeType.Rental;

            this.titleLbl.dataID = trade.tradeType == core.TradeType.Rental ? 'market_title_rent' : 'market_title_buy';

            if (trade.tradeType == core.TradeType.Trade)
                this.updBuyInfo();
            else if (trade.tradeType == core.TradeType.Rental)
                this.updRentInfo();
        } else if (param.materialTrade) {
            this.buyInfoNode.active = true;
            this.rentInfoNode.active = false;
            this.materialTradeInfo = param.materialTrade;
            this.updBuyInfo();
        }
        this.updInfo();
    }

    updInfo() {
        this.walletCard.node.active = !!this.tradeInfo?.card;
        this.cardDetails.node.active = !!this.tradeInfo?.card;
        this.walletEquipment.node.active = !!this.tradeInfo?.equip;
        this.equipmentDetails.node.active = !!this.tradeInfo?.equip;
        this.walletMaterial.node.active = !!this.materialTradeInfo;
        this.materialDetails.node.active = !!this.materialTradeInfo;

        this.initCard();
        this.initEquip();
        this.initMaterial();
        // let cardInfo = TableCards.getInfoByProtoIdAndLv(this.tradeInfo.card.protoId, this.tradeInfo.card.level);
        // this.icon.spriteFrame = ResManger.getInstance().getIconSpriteFrame(cardInfo.proto_id);
        // this.cardNameLbl.dataID = cardInfo.name;
        // this.cardTradeIdLbl.string = `#${this.tradeInfo.tokenId}`;
    }

    initCard() {
        if (this.tradeInfo?.card) {
            this.walletCard.init(this.tradeInfo.card);
            this.cardDetails.init({ cardInfo: this.tradeInfo.card });
            this.cardNameLbl.dataID = this.walletCard.baseCard.cardCfg.name;
            this.idLbl.string = `#${this.tradeInfo.card.nftId}`
        }
    }

    initEquip() {
        if (this.tradeInfo?.equip) {
            this.walletEquipment.init(this.tradeInfo.equip);
            this.equipmentDetails.init({ equipInfo: this.tradeInfo.equip });
            let name = TableEquipRaity.getInfoByEquipIdAndRarity(this.tradeInfo.equip.protoId, this.tradeInfo.equip.equipRarity)?.name;
            this.cardNameLbl.dataID = name;
            this.idLbl.string = `#${this.tradeInfo.equip.nftId}`
        }
    }

    initMaterial() {
        if (this.materialTradeInfo) {
            let material = core.Material.create({
                total: this.materialTradeInfo.cnt,
                tokenType: this.materialTradeInfo.tokenType,
            });
            this.walletMaterial.init(material);
            this.materialDetails.init({ materialInfo: material });
            this.walletMaterial.setNum(this.materialTradeInfo.cnt);
            this.cardNameLbl.dataID = this.walletMaterial.baseMaterial.nftCfg.display_name;
            this.idLbl.string = `#${this.materialTradeInfo.tokenType}`
        }
    }

      
    updBuyInfo() {
        let bnbLbl = find("/Sprite/Label", this.buyInfoNode).getComponent(Label);
        let bnbPrice = this.tradeInfo?.bnbPrice ?? this.materialTradeInfo?.bnbPrice ?? "0";
        bnbLbl.string = `${CommonUtil.weiToEtherStr(bnbPrice)}`;
    }

      
    updRentInfo() {
        let bnbLbl = find("/Sprite/Layout/Label", this.rentInfoNode).getComponent(Label);
        let bnbPrice = this.tradeInfo?.bnbPrice ?? this.materialTradeInfo?.bnbPrice ?? "0";
        bnbLbl.string = `${CommonUtil.weiToEtherStr(bnbPrice)}`;
        // bnbLbl.params = [
        //     {
        //         key: 'num',
        //         value: `${CommonUtil.weiToEtherStr(this.tradeInfo.bnbPrice)}`
        //     }
        // ]
    }

    async buyClick() {
        let allBNB = WalletUtil.getTotalCurrByType(CurrType.BNB);
        if (new BigNumber(this.tradeInfo?.bnbPrice ?? this.materialTradeInfo.bnbPrice ?? "0").gt(allBNB)) {
            oops.gui.toast('not_enough_bnb', true);
            return;
        }
        if (this.materialTradeInfo) {
            oops.gui.open(UIID.MarketItemBuyPopUp, this.materialTradeInfo);
        } else if (this.tradeInfo) {
            oops.gui.open(UIID.MarketBuyPopUp, this.tradeInfo);
        }
    }

    async rentClick() {
        let allBNB = WalletUtil.getTotalCurrByType(CurrType.BNB);
        if (new BigNumber(this.tradeInfo?.bnbPrice ?? this.materialTradeInfo.bnbPrice ?? "0").gt(allBNB)) {
            oops.gui.toast('not_enough_bnb', true);
            return;
        }
        oops.gui.open(UIID.MarketRentPopUp, this.tradeInfo);
    }

    closeClick() {
        oops.gui.removeByNode(this.node, true);
    }
}

export type MarketCardInfoPopUpParm = {
    trade?: watrade.ITrade,
    materialTrade?: watrade.IMaterialTrade,
}