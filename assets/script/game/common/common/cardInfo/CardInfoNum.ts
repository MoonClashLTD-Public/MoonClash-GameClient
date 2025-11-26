import { Label, _decorator, Node, Toggle } from "cc";
import { LanguageLabel } from "../../../../core/gui/language/LanguageLabel";
import TableCards from "../../table/TableCards";
import { CardPrefabType } from "../CardPrefab";
import { CardInfoBase } from "./CardInfoBase";

const { ccclass, property } = _decorator;

@ccclass('CardInfoNum')
export class CardInfoNum extends CardInfoBase {
    @property(Label)
    foodLb: Label = null
    @property(LanguageLabel)
    levelLb: LanguageLabel = null
    @property(Toggle)
    private toggle: Toggle = null
    @property(Node)
    private maskNode: Node = null
    @property(Label)
    private power: Label = null


    init() {
        const cardType = this.cardInfoPrefab.cardPrefabType
        const cardId = this.cardInfoPrefab.param?.id
        const _card = this.cardInfoPrefab.param?.card
        const cardCfgId = this.cardInfoPrefab.param?.cardId
        const showPowerLb = (cardType == CardPrefabType.NumInfoHasPower
            || cardType == CardPrefabType.NumInfoHasPowerAndBg)
        this.power.node.active = showPowerLb
        if (cardId || _card) {
            const netCard = _card ? _card : this.cardManager.getNetCardById(cardId)
            const cardCfg = TableCards.getInfoByProtoIdAndLv(netCard.protoId, netCard.level)
            const currPower = netCard?.power || 0
            const maxPower = cardCfg?.max_power || 0
            if (this.foodLb) this.foodLb.string = `${cardCfg?.cost || 0}`
            if (this.levelLb) {
                this.levelLb.params[0].value = `${netCard?.level || 0}`
                this.levelLb.forceUpdate()
            }
            if (showPowerLb) this.power.string = `${currPower}/${maxPower}`

        } else if (cardCfgId) {
            const cardCfg = this.cardManager.getTableCfgByLIdMaxLevel(cardCfgId)
            if (this.foodLb) this.foodLb.string = `${cardCfg?.cost || 0}`
            if (this.levelLb) {
                this.levelLb.params[0].value = `1`
                this.levelLb.forceUpdate()
            }
            if (showPowerLb) this.power.node.active = false
        }
    }

      
    setSelect(bf: boolean = false) {
        if (!this.toggle.node.active) this.toggle.node.active = true
        this.maskNode.active = bf;
        this.toggle.isChecked = bf
    }
}