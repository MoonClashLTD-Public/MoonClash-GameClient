
import { JsonUtil } from "../../../core/utils/JsonUtil";

export class SkillEffectCfg {
    id: number = 0;
    type: skill.EffectType = 0;
    apportion_method: number = 0;
    heal_value_base: number = 0;
    value: number = 0;
    percentage: number = 0;
    percentage_max: number = 0;
    prop_type: core.PropType = 0;
    prop_pos: number = 0;
    fighter_flag: number
    flag_value: boolean = false;
    description: string = ''
}

class TableSkillEffect {
    TableName: string = "effect";
    private _data: SkillEffectCfg[];

    private _dataKV: { [key: number]: SkillEffectCfg };
    init() {
        if (!this._data) {
            this._data = JsonUtil.get(this.TableName) as SkillEffectCfg[];
            this._dataKV = {};
            let table = this._data;
            for (const key in table)
                this._dataKV[table[key].id] = Object.assign(new SkillEffectCfg(), table[key]);
        }
    }
    get cfgKV() {
        return this._dataKV;
    }
    get cfg(): SkillEffectCfg[] {
        return this._data;
    }

    getInfoById(id: number) {
        return this.cfgKV[id];
    }
}

export default new TableSkillEffect();