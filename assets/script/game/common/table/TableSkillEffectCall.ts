
import { JsonUtil } from "../../../core/utils/JsonUtil";

export class SkillEffectCallCfg {
    id: number = 0;
    hero_id: number = 0;
    cnt: number = 0;
}

class TableSkillEffectCall {
    TableName: string = "call";
    private _data: SkillEffectCallCfg[];

    private _dataKV: { [key: number]: SkillEffectCallCfg };
    init() {
        if (!this._data) {
            this._data = JsonUtil.get(this.TableName) as SkillEffectCallCfg[];
            this._dataKV = {};
            let table = this._data;
            for (const key in table)
                this._dataKV[table[key].id] = Object.assign(new SkillEffectCallCfg(), table[key]);
        }
    }
    get cfgKV() {
        return this._dataKV;
    }
    get cfg(): SkillEffectCallCfg[] {
        return this._data;
    }

    getInfoById(id: number) {
        return this.cfgKV[id];
    }
}

export default new TableSkillEffectCall();