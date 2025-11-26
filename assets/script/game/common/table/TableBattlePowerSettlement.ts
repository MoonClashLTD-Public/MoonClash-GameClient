
import { JsonUtil } from "../../../core/utils/JsonUtil";

export class BattlePowerSettlementCfg {
    /**id */
    id = 0;
      
    battle_power_min = 0
}

class TableBattlePowerSettlement {
    TableName: string = "battle_power_settlement";
    private _data: BattlePowerSettlementCfg[];

    private _dataKV: { [key: number]: BattlePowerSettlementCfg };
    init() {
        if (!this._data) {
            this._data = JsonUtil.get(this.TableName) as BattlePowerSettlementCfg[];
            this._dataKV = {};
            let table = this._data;
            for (const key in table)
                this._dataKV[table[key].id] = Object.assign(new BattlePowerSettlementCfg(), table[key]);
        }
    }
    get cfgKV() {
        return this._dataKV;
    }
    get cfg(): BattlePowerSettlementCfg[] {
        return this._data;
    }

    getInfoById(id: number): BattlePowerSettlementCfg {
        return this.cfgKV[id];
    }
}

export default new TableBattlePowerSettlement();