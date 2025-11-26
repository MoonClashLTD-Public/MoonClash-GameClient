
import { JsonUtil } from "../../../core/utils/JsonUtil";

export class SkillCfg {
    /**id */
    id = 0;
      
    name = '';
      
    res_name = '';
    sound: {
        atk_res: string
        atk_volume: number
        fly_res: string
        fly_volume: number
        hit_res: string
        hit_volume: number
    }
      
    action_name = '';
      
    buff_action_name = '';
      
    grp_id = 0;
      
    sk_lv = 0;
      
    order = 0;
      
    type: skill.SkillType = 0;
      
    collision: skill.SkillCollision = 0;
      
    pre_atk_ms = 0;
      
    effect_delay_ms = 0;
      
    effect_ids: number[] = [];
      
    trigger_type: skill.SkillTrigger = 0;
    first_at_ms = 0;
    post_atk_ms = 0;
    fly_speed = 0;
    cd_ms = 0;
    ttl_ms = 0;
    select = 0;
    buff_select = 0;
    atk_radius = 0;
    dmg_radius = 0;
    units: core.UnitType[] = [];
      
    cast_distance = 0;
      
    effect_radius = 0
      
    target: core.UnitType = 0;
      
    client_display: number = 0
      
    description: string = ""
      
    icon_res: string = ""
}

class TableSkill {
    TableName: string = "skill";
    private _data: SkillCfg[];

    private _dataKV: { [key: number]: SkillCfg };
    init() {
        if (!this._data) {
            this._data = JsonUtil.get(this.TableName) as SkillCfg[];
            this._dataKV = {};
            let table = this._data;
            for (const key in table)
                this._dataKV[table[key].id] = Object.assign(new SkillCfg(), table[key]);
        }
    }
    get cfgKV() {
        return this._dataKV;
    }
    get cfg(): SkillCfg[] {
        return this._data;
    }

    getInfoById(id: number) {
        return this.cfgKV[id];
    }
}

export default new TableSkill();