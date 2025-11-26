
import { JsonUtil } from "../../../core/utils/JsonUtil";

export class BornAddrsCfg {
    Id: number = 0;
    inn_name: string = '';
    display_name: string = '';
}

class TableBornAddrs {
    TableName: string = "born_addrs";
    private _data: BornAddrsCfg[];

    private _dataKV: { [key: number]: BornAddrsCfg };
    init() {
        if (!this._data) {
            this._data = JsonUtil.get(this.TableName) as BornAddrsCfg[];
            this._dataKV = {};
            let table = this._data;
            for (const key in table)
                this._dataKV[table[key].Id] = Object.assign(new BornAddrsCfg(), table[key]);
        }
    }
    get cfgKV() {
        return this._dataKV;
    }
    get cfg(): BornAddrsCfg[] {
        return this._data;
    }
    getInfoById(id: number) {
        return this.cfgKV[id];
    }
}

export default new TableBornAddrs();