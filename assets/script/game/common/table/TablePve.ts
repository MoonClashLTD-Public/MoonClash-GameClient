
import { JsonUtil } from "../../../core/utils/JsonUtil";

export class PveCfg {
    /**id */
    id = 0;
      
    name = '';
      
    tower_id = 0
      
    map_id = 0
      
    award_dgg_gwei = 0
      
    award_dna_gwei = 0
      
    min_fight_power = 0
      
    max_fight_power = 0
    description = ''
}

class TablePve {
    TableName: string = "pve_battle";
    private _data: PveCfg[];

    private _dataKV: { [key: number]: PveCfg };
    init() {
        if (!this._data) {
            this._data = JsonUtil.get(this.TableName) as PveCfg[];
            this._dataKV = {};
            let table = this._data;
            for (const key in table)
                this._dataKV[table[key].id] = Object.assign(new PveCfg(), table[key]);
        }
    }
    get cfgKV() {
        return this._dataKV;
    }
    get cfg(): PveCfg[] {
        return this._data;
    }

    getInfoById(id: number): PveCfg {
        return this.cfgKV[id];
    }
}

export default new TablePve();