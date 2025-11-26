import { Label, _decorator } from "cc";
import { LanguageLabel } from "../../../../core/gui/language/LanguageLabel";
import { CardPrefabType } from "../CardPrefab";
import { CardInfoBase } from "./CardInfoBase";

const { ccclass, property } = _decorator;

@ccclass('CardInfoClassify')
export class CardInfoClassify extends CardInfoBase {
    @property(LanguageLabel)
    numLbl: LanguageLabel = null;
    @property(Label)
    foodLb: Label = null
    start() { }

    init() {
        const typeInd = this.cardInfoPrefab?.param?.cardProtoId
        if (typeInd) {
            const cardMager = this.playerManager.cardManager.playCard
            const cardTypeGroup = cardMager.getCardTypeGroupByGId(typeInd) || []
            if (cardTypeGroup.length == 0) return
            const card = cardMager.getTableCfgByNetId(cardTypeGroup[0])
            if (this.numLbl) {
                let _hasNum = cardTypeGroup.length || 0
                if (this.cardInfoPrefab.cardPrefabType == CardPrefabType.PVPclassifyInfo) {
                    _hasNum -= this.playerManager.cardManager.playCardGroup.getCardNumsByProtoId(typeInd)
                } else if (this.cardInfoPrefab.cardPrefabType == CardPrefabType.PVEclassifyInfo) {
                    _hasNum -= this.playerManager.pveInfo.getCardNumsByProtoId(typeInd)
                }
                this.numLbl.params[0].value = `${_hasNum > 0 ? _hasNum : 0}`
                this.numLbl.forceUpdate()
            }
            if (this.foodLb) this.foodLb.string = `${card?.cost || 0}`
        }
    }
}