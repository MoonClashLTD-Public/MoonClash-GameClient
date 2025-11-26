
import { JsonUtil } from "../../../core/utils/JsonUtil";

export class JobCfg {
    Id: number = 0;
    inn_name: string = '';
    display_name: string = '';
    res_name: string = '';
}

class TableJobs {
    TableName: string = "jobs";
    private _data: JobCfg[];

    private _dataKV: { [key: number]: JobCfg };
    init() {
        if (!this._data) {
            this._data = JsonUtil.get(this.TableName) as JobCfg[];
            this._dataKV = {};
            let table = this._data;
            for (const key in table)
                this._dataKV[table[key].Id] = Object.assign(new JobCfg(), table[key]);
        }
    }
    get cfgKV() {
        return this._dataKV;
    }
    get cfg(): JobCfg[] {
        return this._data;
    }
    getInfoById(id: number) {
        return this.cfgKV[id];
    }
}

export default new TableJobs();