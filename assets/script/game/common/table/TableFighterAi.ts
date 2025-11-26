
import { JsonUtil } from "../../../core/utils/JsonUtil";

export class FighterAiCfg {
    id = 0
    ai_id = 1
    distance = 0
      
    buf_id = 0
}

class TableFighterAi {
    TableName: string = "fighter_ai";
    private _data: FighterAiCfg[];

    private _dataKV: { [key: number]: FighterAiCfg };
    init() {
        if (!this._data) {
            this._data = JsonUtil.get(this.TableName) as FighterAiCfg[];
            this._dataKV = {};
            let table = this._data;
            for (const key in table)
                this._dataKV[table[key].id] = Object.assign(new FighterAiCfg(), table[key]);
        }
    }
    get cfgKV() {
        return this._dataKV;
    }
    get cfg(): FighterAiCfg[] {
        return this._data;
    }

    getInfoById(id: number) {
        return this.cfgKV[id];
    }

    getInfoByAiId(aiId: number) {
        return this._data.find(v => v.ai_id == aiId);
    }
}

export default new TableFighterAi();