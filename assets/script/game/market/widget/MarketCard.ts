import { _decorator, Component, Node, Sprite, Label, find, log } from 'cc';
import { LanguageLabel } from '../../../core/gui/language/LanguageLabel';
import ListItemOptimize from '../../../core/gui/scrollView/ListItemOptimize';
import { CommonUtil } from '../../../core/utils/CommonUtil';
import TableCards from '../../common/table/TableCards';
import TableEquipRaity from '../../common/table/TableEquipRaity';
import TableNfts from '../../common/table/TableNfts';
import { TradeState } from '../../data/constant';
import { PlayerManger } from '../../data/playerManager';
import { ResManger } from '../../data/resManger';
import { WalletCard } from '../../walletUI/widget/WalletCard';
import { WalletEquipment } from '../../walletUI/widget/WalletEquipment';
import { WalletMaterial } from '../../walletUI/widget/WalletMaterial';
import WalletUtil from '../../walletUI/WalletUtil';
const { ccclass, property, type } = _decorator;

@ccclass('MarketCard')
export class MarketCard extends Component {
    @type(WalletCard)
    walletCard: WalletCard = null;
    @type(WalletEquipment)
    walletEquip: WalletEquipment = null;
    @type(WalletMaterial)
    walletMaterial: WalletMaterial = null;
    @type(LanguageLabel)
    cardLbl: LanguageLabel = null;
    @type(Label)
    tradeLbl: Label = null;
    @type(Node)
    buyInfoNode: Node = null;   
    @type(Node)
    rentInfoNode: Node = null;   
    cb: Function = null;
    trade: watrade.ITrade = null;
    materialTrade: watrade.IMaterialTrade = null;
    start() {
        this.node.addComponent(ListItemOptimize);
    }

    update(deltaTime: number) {

    }

    async setToUInfo() {
        this.tradeLbl.string = "";
        let bnbPrice = this.trade?.bnbPrice ?? this.materialTrade?.bnbPrice ?? '0';
        let u = await WalletUtil.getEthToU(CommonUtil.weiToEther(bnbPrice).toString());
        this.tradeLbl.string = `≈${u}U`;
    }

    init(trade: watrade.ITrade, cb?: Function) {
        // switch (trade.state) {
        //     case TradeState.StateClosed:
        //         break;
        //     default:
        //         break;
        // };
        this.trade = trade;
        this.cb = cb;

        if (trade.card) {
            this.walletCard.init(trade.card);
            this.cardLbl.dataID = this.walletCard.baseCard.cardCfg.name;
            this.tradeLbl.string = `#${this.trade.card.nftId}`
        }
        this.walletCard.node.active = !!trade.card;
        if (trade.equip) {
            this.walletEquip.init(trade.equip)
            let name = TableEquipRaity.getInfoByEquipIdAndRarity(trade.equip.protoId, trade.equip.equipRarity)?.name;
            this.cardLbl.dataID = name;
            this.tradeLbl.string = `#${this.trade.equip.nftId}`
        }
        this.walletEquip.node.active = !!trade.equip;
        this.walletMaterial.node.active = false;

        this.buyInfoNode.active = this.trade.tradeType == core.TradeType.Trade;
        this.rentInfoNode.active = this.trade.tradeType == core.TradeType.Rental;
        this.updBuyInfo();
        this.updRentInfo();

        this.setToUInfo();
    }

    initMaterial(trade: watrade.IMaterialTrade, cb?: Function) {
        this.materialTrade = trade;
        this.cb = cb;

        this.walletCard.node.active = false;
        this.walletEquip.node.active = false;
        this.walletMaterial.node.active = true;

        this.buyInfoNode.active = true;
        this.rentInfoNode.active = false;

        let _material = watrade.MaterialTrade.create(
            {
                tokenType: trade.tokenType,
                cnt: trade.cnt,
            }
        )
        this.walletMaterial.init(_material);
        this.cardLbl.dataID = this.walletMaterial.baseMaterial.nftCfg.display_name;
        this.tradeLbl.string = `#${_material.tokenType}`;
        this.walletMaterial.setNum(trade.cnt);
        this.updBuyInfo();

        this.setToUInfo();
    }

    updBuyInfo() {
        // if (this.trade?.tradeType != core.TradeType.Trade) return;
        let lbl = find("Label", this.buyInfoNode).getComponent(Label);
        let bnbPrice = this.trade?.bnbPrice ?? this.materialTrade?.bnbPrice ?? '0';
        lbl.string = `${CommonUtil.weiToEther(bnbPrice)}`;
    }

    updRentInfo() {
        if (this.trade.tradeType != core.TradeType.Rental) return;
        let lbl = find("Label", this.rentInfoNode).getComponent(Label);
        lbl.string = `${CommonUtil.weiToEther(this.trade.bnbPrice)}/day`;
    }

    bigCardClick() {
        this.cb && this.cb(this.trade ?? this.materialTrade);
    }

      
    buyClick() {
        this.cb && this.cb(this.trade ?? this.materialTrade);
    }

      
    rentClick() {
        this.cb && this.cb(this.trade ?? this.materialTrade);
    }
}

