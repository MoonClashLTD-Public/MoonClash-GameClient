
import { JsonUtil } from "../../../core/utils/JsonUtil";
import { MaterialCosts } from "./TableCards";

export class TableEquipRepairCostCfg {
    id: number = 0;
    equip_id: number = 0;
      
    durability: number = 0;
    res_name: string = '';
    cost: MaterialCosts
}

class TableEquipRepairCost {
    TableName: string = "equip_repair_cost";
    private _data: TableEquipRepairCostCfg[];

    private _dataKV: { [key: number]: TableEquipRepairCostCfg };
    private _dataGroupKV: { [key: number]: TableEquipRepairCostCfg[] };
    init() {
        if (!this._data) {
            this._data = JsonUtil.get(this.TableName) as TableEquipRepairCostCfg[];
            let table = this._data;
            this._dataKV = {};
            this._dataGroupKV = {}
            for (const key in table) {
                const v = Object.assign(new TableEquipRepairCostCfg(), table[key]);
                this._dataKV[table[key].id] = v
                let _dataGroup = this._dataGroupKV[table[key].equip_id]
                if (!_dataGroup) this._dataGroupKV[table[key].equip_id] = []
                this._dataGroupKV[table[key].equip_id][table[key].durability] = v
            }
        }
    }
    get cfgKV() {
        return this._dataKV;
    }
    get cfg(): TableEquipRepairCostCfg[] {
        return this._data;
    }
    getInfoById(id: number) {
        return this.cfgKV[id];
    }
      
      
    getInfoByEquipIdAndRarity(equipId: number, durability: number): TableEquipRepairCostCfg {
        // if (!equipId || !rarity) return
        // return this._dataGroupKV[equipId][durability];
        if (!equipId) return
        return this._dataGroupKV[equipId][1];
    }
}

export default new TableEquipRepairCost();