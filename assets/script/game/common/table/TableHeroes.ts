
import { JsonUtil } from "../../../core/utils/JsonUtil";

export class HeroCfg {
    Id = 0;
    name = '';
    inn_name = '';
    level = 0;
    res_name = '';
    sk_ids: number[] = [];
      
    ai = 1;
    type: core.UnitType = 0;
    threat_units = [];
    collision: {
        type: number,
        width: number,
        height: number,
        corner: number,
    }
    props: {
        t: core.PropType
        i32: number
    }[] = [];
      
    threat_radius = 0;
      
    skill_born_place: core.SkillBornPlace = 0;
    sound: {
        born_res: string
        born_delay: number
        born_volume: number
        dead_res: string
        dead_volume: number
        jump_frame: number[]
        jump_res: string
        jump_volume: number
        run_frame: number[]
        run_res: string
        run_volume: number
        rush_frame: number[]
        rush_res: string
        rush_volume: number
        atk_frame: number[]
        atk_res: string
        atk_volume: number
    }

      
    _isShield: boolean = null;
    get isShield() {
        if (this._isShield == null) {
            let bf = !!this.props.find((v, k) => v.t == core.PropType.PropTypeHpMax1);
            if (!bf)
                bf = !!this.props.find((v, k) => v.t == core.PropType.PropTypeHp1);
            this._isShield = bf;
        }
        return this._isShield;
    }
}

class TableHeroes {
    TableName: string = "heroes";
    private _data: HeroCfg[];

    private _dataKV: { [key: number]: HeroCfg };
    init() {
        if (!this._data) {
            this._data = JsonUtil.get(this.TableName) as HeroCfg[];
            this._dataKV = {};
            let table = this._data;
            for (const key in table)
                this._dataKV[table[key].Id] = Object.assign(new HeroCfg(), table[key]);
        }
    }
    get cfgKV() {
        return this._dataKV;
    }
    get cfg(): HeroCfg[] {
        return this._data;
    }
    getInfoById(id: number) {
        return this.cfgKV[id];
    }
}

export default new TableHeroes();