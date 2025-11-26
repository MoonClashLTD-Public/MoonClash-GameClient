
import { JsonUtil } from "../../../core/utils/JsonUtil";

export class TableBlindBoxCfg {
    id: number = 0;
    type: core.NftSubType;
    cost: {
        dna_gwei: number
    }
}

class TableBlindBox {
    TableName: string = "blind_box";
    private _data: TableBlindBoxCfg[];

    private _dataKV: { [key: number]: TableBlindBoxCfg };
    init() {
        if (!this._data) {
            this._data = JsonUtil.get(this.TableName) as TableBlindBoxCfg[];
            let table = this._data;
            this._dataKV = {};
            for (const key in table)
                this._dataKV[table[key].id] = Object.assign(new TableBlindBoxCfg(), table[key]);
        }
    }
    get cfgKV() {
        return this._dataKV;
    }
    get cfg(): TableBlindBoxCfg[] {
        return this._data;
    }
    getInfoById(id: number) {
        return this.cfgKV[id];
    }
}

export default new TableBlindBox();