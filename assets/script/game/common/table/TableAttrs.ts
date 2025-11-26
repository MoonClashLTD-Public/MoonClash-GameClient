
import { JsonUtil } from "../../../core/utils/JsonUtil";

export class AttrCfg {
    id: core.PropType;
    inn_name: string = '';
    display_name: string = '';
    res_name: string = '';
}

class TableAttrs {
    TableName: string = "job_attr";
    private _data: AttrCfg[];

    private _dataKV: { [key: number]: AttrCfg };
    init() {
        if (!this._data) {
            this._data = JsonUtil.get(this.TableName) as AttrCfg[];
            this._dataKV = {};
            let table = this._data;
            for (const key in table)
                this._dataKV[table[key].id] = Object.assign(new AttrCfg(), table[key]);
        }
    }
    get cfgKV() {
        return this._dataKV;
    }
    get cfg(): AttrCfg[] {
        return this._data;
    }
    getInfoById(id: core.PropType) {
        return this.cfgKV[id];
    }
}

export default new TableAttrs();