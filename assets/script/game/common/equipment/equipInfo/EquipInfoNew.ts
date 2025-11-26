import { Label, _decorator, Node, Toggle } from "cc";
import { DefLogoAttr } from "../../com/DefLogoAttr";
import { EquipPrefabType } from "../EquipmentPrefab";
import { EquipInfoBase } from "./EquipInfoBase";

const { ccclass, property } = _decorator;
@ccclass('EquipInfoNew')
export class EquipInfoNew extends EquipInfoBase {
    @property(Node)
    deleteBtn: Node

    @property([DefLogoAttr])
    private iconAttrs: DefLogoAttr[] = []

    @property([Node])
    private bgItems: Node[] = []
    init() {
        const equipId = this.equipmentPrefab.param?.id || 0
        const equip = this.equipmentPrefab.param?.equip;
        const cardType = this.equipmentPrefab.cardPrefabType
        this.deleteBtn.active = cardType == EquipPrefabType.NewInfoBannerHasDelete || cardType == EquipPrefabType.NewPveInfoBannerHasDelete
        const disItems = this.playerManager.equipManager.playEquips.getDispostionCfgById2({ netId: equipId, netEquipment: equip }).list
        this.iconAttrs.forEach((attr, Idx) => {
            attr.init2(disItems[Idx])
        })

        const dLen = disItems.length
        this.bgItems.forEach((c, idx) => {
            if (idx == 0) {
                c.active = dLen > 0
            } else if (idx == 1) {
                c.active = dLen > 2
            } else {
                c.active = false
            }
        })

    }
}