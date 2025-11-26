import { _decorator, Component, Node, Toggle, ScrollView, Event } from 'cc';
import { LanguageLabel } from '../../core/gui/language/LanguageLabel';
import WalletUtil from '../walletUI/WalletUtil';
import { MarketCardComp } from './comp/MarketCardComp';
import { MarketEquipmentComp } from './comp/MarketEquipmentComp';
import { MarketItemComp } from './comp/MarketItemComp';
import { MarketFunComp } from './widget/MarketFunComp';
const { ccclass, property, type } = _decorator;

@ccclass('MarketPage')
export class MarketPage extends Component {
    @type(LanguageLabel)
    titleLbl: LanguageLabel = null;
    @type(ScrollView)
    sv: ScrollView = null;
    @type(Node)
    tradeCheckNode: Node = null;   
    @type(MarketCardComp)
    cardComp: MarketCardComp = null;
    @type(MarketEquipmentComp)
    equipmentComp: MarketEquipmentComp = null;
    @type(MarketItemComp)
    itemComp: MarketItemComp = null;
    @type(MarketFunComp)
    marketFunComp: MarketFunComp = null;
    @type([Node])
    tradeTypeBtns: Node[] = [];
    pageType: core.NftType = core.NftType.NftTypeCard;

      
    tradeType: core.TradeType = core.TradeType.Trade;
    @type(Node)
    topBtnNode: Node = null;
    start() {
        this.topBtnNode.active = false;
        this.sv.node.on(ScrollView.EventType.SCROLLING, () => {
            this.topBtnNode.active = this.sv.getScrollOffset().y > 1400;
        }, this);
    }

    update(deltaTime: number) {

    }

      
    pageInit() {
        this.updatePage(this.pageType, this.tradeType);
    }

      
    pageOuit() {
        WalletUtil.marketFlag++;
        this.cardComp.cardItemNode.destroyAllChildren();
        this.sv.stopAutoScroll();
        this.sv.scrollToTop(0);
        this.marketFunComp.clear();
    }

    checkEvent(tog: Toggle, customEventData: string) {
        this.pageType = Number(tog.node.name);
        this.updatePage(this.pageType, this.tradeType);
    }
    trideCheckEvent(e: Event, customEventData: string) {
        this.tradeType = Number(customEventData);
        this.tradeTypeBtns[core.TradeType.Trade].active = this.tradeType == core.TradeType.Trade;
        this.tradeTypeBtns[core.TradeType.Rental].active = this.tradeType == core.TradeType.Rental;
        this.updatePage(this.pageType, this.tradeType);
    }

    async updatePage(type: core.NftType, tradeType: core.TradeType) {
        await WalletUtil.getEthToU("1", true);

          
        this.tradeCheckNode.active = false // type == core.NftType.NftTypeCard;

        this.cardComp.cardItemNode.destroyAllChildren();
        this.cardComp.hide();
        this.equipmentComp.hide();
        this.itemComp.hide();

        type == core.NftType.NftTypeCard && this.cardComp.show(tradeType);
        type == core.NftType.NftTypeEquipment && this.equipmentComp.show(core.TradeType.Trade);
        type == core.NftType.NftTypeItem && this.itemComp.show(core.TradeType.Trade);

        let titleDateId = '';
        switch (type) {
            case core.NftType.NftTypeCard:
                titleDateId = "wallet_title_card";
                break;
            case core.NftType.NftTypeEquipment:
                titleDateId = "wallet_title_equipment";
                break;
            case core.NftType.NftTypeItem:
                titleDateId = "wallet_title_item";
                break;
            default:
                break;
        }

        this.titleLbl.dataID = titleDateId;
    }
    topClick() {
        this.sv.scrollToTop(0.3);
    }
}

