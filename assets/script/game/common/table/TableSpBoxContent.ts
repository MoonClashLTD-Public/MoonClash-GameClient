
import { JsonUtil } from "../../../core/utils/JsonUtil";

export class MaterialBoxContentCfg {
    id: number = 0;
    nft_id: number = 0;
    cnt: number = 0;
    weight: number = 0;
    max_cnt: number = 0
}

class TableSpBoxContent {
    TableName: string = "sp_box_content";
    private _data: MaterialBoxContentCfg[];

    private _dataKV: { [key: number]: MaterialBoxContentCfg };
    init() {
        if (!this._data) {
            this._data = JsonUtil.get(this.TableName) as MaterialBoxContentCfg[];
            this._dataKV = {};
            let table = this._data;
            for (const key in table)
                this._dataKV[table[key].id] = Object.assign(new MaterialBoxContentCfg(), table[key]);
        }
    }
    get cfgKV() {
        return this._dataKV;
    }
    get cfg(): MaterialBoxContentCfg[] {
        return this._data;
    }
    getInfoById(id: core.PropType) {
        return this.cfgKV[id];
    }
}

export default new TableSpBoxContent();