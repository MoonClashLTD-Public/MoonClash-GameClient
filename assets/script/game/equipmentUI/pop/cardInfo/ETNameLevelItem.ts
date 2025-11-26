import { _decorator, Component, Node, Label } from 'cc';
import { LanguageLabel } from '../../../../core/gui/language/LanguageLabel';
import { EquipmentPrefab, EquipPrefabType, EquipPrefabParam } from '../../../common/equipment/EquipmentPrefab';
import { IEquipCardPopCfg } from '../../utils/enum';
import { EquipSystemUtils } from '../../utils/equipSystemUtils';
const { ccclass, property } = _decorator;

@ccclass('ETNameLevelItem')
export class ETNameLevelItem extends Component {
    @property(EquipmentPrefab)
    private equipPrefab: EquipmentPrefab = null;
    @property(LanguageLabel)
    private nameLb: LanguageLabel = null
    @property(Label)
    private power: Label = null
    @property(Label)
    private isPlayPveLb: Label = null

    init(cfg: IEquipCardPopCfg) {
        const param: EquipPrefabParam = {
            id: cfg.id,
            equipPrefabType: EquipPrefabType.Info,
        }
        this.equipPrefab.init(param)
        const equipInfo = this.equipPrefab.equipInfoCom
        if (equipInfo) {
            this.nameLb.dataID = equipInfo.equipRaityCfg?.name || ''
            this.power.string = `${equipInfo.equipData?.durability || 0}/${equipInfo.equipCfg?.durability_max || 0}`
            this.isPlayPveLb.string = `${EquipSystemUtils.isPlayPve(equipInfo?.equipData) ? 0 : 1}/1`
        }
    }

    get equipInfoCom() {
        return this.equipPrefab.equipInfoCom
    }

    get getEquipName() {
        return this.nameLb?.string || ''
    }
}

