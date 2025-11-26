
import { JsonUtil } from "../../../core/utils/JsonUtil";
import TableSkill from "./TableSkill";
import TableSkillEffect from "./TableSkillEffect";

export class PvePowerDeltaCfg {
    id = 0
      
    name = 0
      
    buff_id = 0
}

class TablePvePowerDelta {
    TableName: string = "pve_power_delta";
    private _data: PvePowerDeltaCfg[];

    private _dataKV: { [key: number]: PvePowerDeltaCfg };
    init() {
        if (!this._data) {
            this._data = JsonUtil.get(this.TableName) as PvePowerDeltaCfg[];
            this._dataKV = {};
            let table = this._data;
            for (const key in table)
                this._dataKV[table[key].id] = Object.assign(new PvePowerDeltaCfg(), table[key]);
        }
    }
    get cfgKV() {
        return this._dataKV;
    }
    get cfg(): PvePowerDeltaCfg[] {
        return this._data;
    }

    getPerByDiff(diff: number): number {
        let skillId = 0
        for (const key in this.cfgKV) {
            const cfg = this.cfgKV[key]
            if (diff >= cfg.name) {
                skillId = cfg.buff_id
            } else {
                break
            }
        }
        if (skillId == 0) return 0
        const skillInfo = TableSkill.getInfoById(skillId)
        const effect_ids = skillInfo?.effect_ids
        if ((effect_ids?.length ?? 0) == 0) return 0
        const skillEffectInfo = TableSkillEffect.getInfoById(effect_ids[0])
        const v = skillEffectInfo?.value || 0
        const per = skillEffectInfo?.percentage || 0
        let num = 0
        if (v != 0) num = v / 100
        else if (per != 0) num = per / 100
        return num
    }
}

export default new TablePvePowerDelta();