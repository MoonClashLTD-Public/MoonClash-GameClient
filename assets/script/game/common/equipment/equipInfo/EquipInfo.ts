import { _decorator, Sprite, Node } from "cc";
import { EquipSystemUtils } from "../../../equipmentUI/utils/equipSystemUtils";
import TableEquip, { TableEquipCfg } from "../../table/TableEquip";
import TableEquipRaity, { TableEquipRaityCfg } from "../../table/TableEquipRaity";
import TableEquipRepairCost, { TableEquipRepairCostCfg } from "../../table/TableEquipRepairCost";
import { EquipPrefabType, isPvePowerKv, showEquipInfoBgKv } from "../EquipmentPrefab";
import { EquipInfoBase } from "./EquipInfoBase";

const { ccclass, property } = _decorator;

@ccclass('EquipInfo')
export class EquipInfo extends EquipInfoBase {
    @property(Sprite)
    private bg: Sprite = null
    @property(Sprite)
    private icon: Sprite = null
    @property(Sprite)
    private glowSprite: Sprite = null;  
      
    @property(Node)
    private cardGroupBg: Node = null;
    @property(Node)
    private lockNode: Node = null
    @property(Node)
    private otherCardGroupNode: Node = null

    private _equipData: core.IEquipment;
    public get equipData() {
        return this._equipData;
    }
    private _equipCfg: TableEquipCfg;
    public get equipCfg(): TableEquipCfg {
        return this._equipCfg;
    }

    private _equipRaityCfg: TableEquipRaityCfg;
    public get equipRaityCfg() {
        return this._equipRaityCfg;
    }

    private _equipRepairCostCfg: TableEquipRepairCostCfg;
    public get equipRepairCostCfg() {
        if (!this._equipRepairCostCfg) {
            this._equipRepairCostCfg = TableEquipRepairCost.getInfoByEquipIdAndRarity(this._equipData?.protoId, this._equipData?.equipRarity)
        }
        return this._equipRepairCostCfg;
    }
    private _powerStr = '0/0'
    private isFullDurability = true
    async init() {
        const id = this.equipmentPrefab.param?.id || 0
        const equip = this.equipmentPrefab.param?.equip;
        if (id != 0 || !!equip) {
            const _equipData = this.playerManager.equipManager.playEquips.getEquipmentById(id) ?? equip;
            const _equipCfg = TableEquip.getInfoById(_equipData?.protoId)
            const _equipRaityCfg = TableEquipRaity.getInfoByEquipIdAndRarity(_equipData?.protoId, _equipData?.equipRarity)
            this._equipData = _equipData
            this._equipCfg = _equipCfg
            this._equipRaityCfg = _equipRaityCfg
        }
        if (this.cardGroupBg)
            this.cardGroupBg.active = !!showEquipInfoBgKv[this.equipmentPrefab.cardPrefabType]

        const isLock = this._equipData?.state == core.NftState.NftStateLock
            || this._equipData?.state == core.NftState.NftStateLockInGame
        if (this.lockNode) this.lockNode.active = isLock
        const durability = this._equipData?.durability || 0
        const maxDurability = this._equipCfg?.durability_max || 0

        if (this._equipRaityCfg) {
            this.resManger.getEquipIconSpriteFrame(this._equipRaityCfg?.res_name).then(c => {
                this.icon.spriteFrame = c
            })
            this.resManger.getEquipIconSpriteFrame(this._equipRaityCfg?.rarity).then(c => {
                this.bg.spriteFrame = c
            })
        }
          
        if (isPvePowerKv[this.equipmentPrefab.cardPrefabType]) {
            this._powerStr = `${EquipSystemUtils.isPlayPve(this._equipData) ? 0 : 1}/1`
            this.isFullDurability = false
        } else {
            this.isFullDurability = durability == maxDurability
            this._powerStr = `${durability}/${maxDurability}`
        }
    }

    isOpenGlow(isOpen: boolean) {
        this.glowSprite.node.active = isOpen
    }

      
    setOtherGroup(bf: boolean = true) {
        if (this.otherCardGroupNode) this.otherCardGroupNode.active = bf
    }

    get powerStr() {
        return this._powerStr
    }

    get canAddDurability() {
        return !this.isFullDurability
    }

}