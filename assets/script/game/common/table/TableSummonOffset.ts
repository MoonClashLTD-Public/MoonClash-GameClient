
import { JsonUtil } from "../../../core/utils/JsonUtil";

export class SummonOffsetCfg {
    id: number = 0;
    offsets: {
        x: number,
        y: number
    }[] = []
}

class TableSummonOffset {
    TableName: string = "card_summon_offset";
    private _data: SummonOffsetCfg[];

    private _dataKV: { [key: number]: SummonOffsetCfg };
    init() {
        if (!this._data) {
            this._data = JsonUtil.get(this.TableName) as SummonOffsetCfg[];
            this._dataKV = {};
            let table = this._data;
            for (const key in table)
                this._dataKV[table[key].id] = Object.assign(new SummonOffsetCfg(), table[key]);
        }
    }
    get cfgKV() {
        return this._dataKV;
    }
    get cfg(): SummonOffsetCfg[] {
        return this._data;
    }
    getInfoById(id: number) {
        return this.cfgKV[id];
    }
}

export default new TableSummonOffset();