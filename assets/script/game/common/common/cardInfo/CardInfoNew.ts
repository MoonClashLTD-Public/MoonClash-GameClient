import { Label, _decorator, Node, Toggle } from "cc";
import { CardSystemUtils } from "../../../card/utils/cardSystemUtils";
import { DefLogoAttr } from "../../com/DefLogoAttr";
import TableCards from "../../table/TableCards";
import { CardUtils } from "../../utils/CardUtils";
import { CardPrefabType, isPveKv, showNewInfoPowerKv } from "../CardPrefab";
import { CardInfoBase } from "./CardInfoBase";

const { ccclass, property } = _decorator;
@ccclass('CardInfoNew')
export class CardInfoNew extends CardInfoBase {
    @property(Label)
    foodLb: Label = null
    @property(Label)
    lvLb: Label = null
    @property(Label)
    private power: Label = null
    @property(Node)
    deleteBtn: Node

    @property([DefLogoAttr])
    private iconAtts: DefLogoAttr[] = []

    @property([Node])
    private bgItems: Node[] = []
    @property(Toggle)
    private toggle: Toggle = null
    @property(Node)
    private maskNode: Node = null


    init() {
        const cardType = this.cardInfoPrefab.cardPrefabType
        const cardId = this.cardInfoPrefab.param?.id
        const _card = this.cardInfoPrefab.param?.card
        const cardCfgId = this.cardInfoPrefab.param?.cardId
        const showPowerLb = !!showNewInfoPowerKv[cardType]
        this.power.node.active = showPowerLb
        this.deleteBtn.active = (cardType == CardPrefabType.NewInfoBannerHasDelete || cardType == CardPrefabType.NewPVEInfoBannerHasDelete)
        if (cardId || _card) {
            const netCard = _card ? _card : this.cardManager.getNetCardById(cardId)
            const cardCfg = TableCards.getInfoByProtoIdAndLv(netCard.protoId, netCard.level)
            if (this.foodLb) this.foodLb.string = `${cardCfg?.cost || 0}`
            if (this.lvLb) {
                this.lvLb.string = `Lv.${netCard?.level || 0}`
            }
            if (showPowerLb) {
                const isPve = !!isPveKv[cardType]
                if (isPve) {
                    this.power.string = `${CardSystemUtils.isPlayPve(netCard) ? 0 : 1}/1`
                } else {
                    const currPower = netCard?.power || 0
                    const maxPower = cardCfg?.max_power || 0
                    this.power.string = `${currPower}/${maxPower}`
                }
            }

            const disItems = CardUtils.getDispostionIconNameItems({ netCard: netCard })
            let itemCount = 0
            this.iconAtts.forEach((attr, Idx) => {
                const disItem = disItems[Idx]
                if (disItem) itemCount++
                attr.init(disItem)
            })
            this.bgItems.forEach((c, idx) => {
                if (idx == 0) {
                    c.active = itemCount != 0
                } else if (idx == 1) {
                    c.active = itemCount > 2
                } else {
                    c.active = false
                }
            })


        } else if (cardCfgId) {
            const cardCfg = this.cardManager.getTableCfgByLIdMaxLevel(cardCfgId)
            if (this.foodLb) this.foodLb.string = `${cardCfg?.cost || 0}`
            if (this.lvLb) {
                this.lvLb.string = `Lv.${1}`
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