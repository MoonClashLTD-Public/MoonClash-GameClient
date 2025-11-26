
import { JsonUtil } from "../../../core/utils/JsonUtil";

export class TableAttrPoolCfg {
    id: number = 0;
    inn_name: string = '';
    pool_id: number = 0;
    attr_id: number = 0;
    weight: number = 0;
      
    attr_key: string = '';
}

class TableAttrPool {
    TableName: string = "attr_pool";
    private _data: TableAttrPoolCfg[];

    private _dataKV: { [key: number]: TableAttrPoolCfg };
    private _attrKeyKV: { [key: string]: TableAttrPoolCfg[] };   
    init() {
        if (!this._data) {
            this._data = JsonUtil.get(this.TableName) as TableAttrPoolCfg[];
            let table = this._data;
            this._dataKV = {};
            this._attrKeyKV = {};
            for (const key in table) {
                this._dataKV[table[key].id] = Object.assign(new TableAttrPoolCfg(), table[key]);

                if (!this._attrKeyKV[table[key].attr_key]) {
                    this._attrKeyKV[table[key].attr_key] = [];
                }
                this._attrKeyKV[table[key].attr_key].push(table[key]);
            }
        }
    }
    get cfgKV() {
        return this._dataKV;
    }
      
    get attrKeyKV() {
        return this._attrKeyKV;
    }
    get cfg(): TableAttrPoolCfg[] {
        return this._data;
    }
    getInfoById(id: number) {
        return this.cfgKV[id];
    }
}

export default new TableAttrPool();