
import { JsonUtil } from "../../../core/utils/JsonUtil";

export class MapCfg {
    /**id */
    Id = 0;
      
    name = '';
      
    inn_name = '';
      
    tile_path = '';
      
    res_name = '';
      
    pagoda_id = 0;
}

class TableMaps {
    TableName: string = "maps";
    private _data: MapCfg[];

    private _dataKV: { [key: number]: MapCfg };
    init() {
        if (!this._data) {
            this._data = JsonUtil.get(this.TableName) as MapCfg[];
            this._dataKV = {};
            let table = this._data;
            for (const key in table)
                this._dataKV[table[key].Id] = Object.assign(new MapCfg(), table[key]);
        }
    }
    get cfgKV() {
        return this._dataKV;
    }
    get cfg(): MapCfg[] {
        return this._data;
    }

    getInfoById(id: number): MapCfg {
        return this.cfgKV[id];
    }
}

export default new TableMaps();