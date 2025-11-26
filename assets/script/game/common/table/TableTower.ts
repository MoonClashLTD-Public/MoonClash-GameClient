
import { JsonUtil } from "../../../core/utils/JsonUtil";

export class TowerCfg {
    id = 0;
    level = 0;
    type = 0;
    power = 0;
    king_tower_hero_config_id = 0;
    guard_tower_hero_config_id = 0;
}

class TableTower {
    TableName: string = "tower";
    private _data: TowerCfg[];

    private _dataKV: { [key: number]: TowerCfg };
    init() {
        if (!this._data) {
            this._data = JsonUtil.get(this.TableName) as TowerCfg[];
            this._dataKV = {};
            let table = this._data;
            for (const key in table)
                this._dataKV[table[key].id] = Object.assign(new TowerCfg(), table[key]);
        }
    }
    get cfgKV() {
        return this._dataKV;
    }
    get cfg(): TowerCfg[] {
        return this._data;
    }
    getInfoById(id: number) {
        return this.cfgKV[id];
    }
    getInfoByLevel(level: number, type: number) {
        return this.cfg.find(v => v.level == level && v.type == type);
    }
}

export default new TableTower();