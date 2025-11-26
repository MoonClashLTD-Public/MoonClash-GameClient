
import { JsonUtil } from "../../../core/utils/JsonUtil";

export class TableEquipRaityCfg {
    id: number = 0;
    equip_id: number = 0;
      
    rarity: number = 0;
    name: string = '';
    res_name: string = '';
}

class TableEquipRaity {
    TableName: string = "equip_rarity_display";
    private _data: TableEquipRaityCfg[];

    private _dataKV: { [key: number]: TableEquipRaityCfg };
    private _dataGroupKV: { [key: number]: TableEquipRaityCfg[] };
    init() {
        if (!this._data) {
            this._data = JsonUtil.get(this.TableName) as TableEquipRaityCfg[];
            let table = this._data;
            this._dataKV = {};
            this._dataGroupKV = {}
            for (const key in table) {
                const v = Object.assign(new TableEquipRaityCfg(), table[key]);
                this._dataKV[table[key].id] = v
                let _dataGroup = this._dataGroupKV[table[key].equip_id]
                if (!_dataGroup) this._dataGroupKV[table[key].equip_id] = []
                this._dataGroupKV[table[key].equip_id][table[key].rarity] = v
            }
        }
    }
    get cfgKV() {
        return this._dataKV;
    }
    get cfg(): TableEquipRaityCfg[] {
        return this._data;
    }
    getInfoById(id: number) {
        return this.cfgKV[id];
    }

      
    getInfoByEquipIdAndRarity(equipId: number, rarity: number): TableEquipRaityCfg {
        if (!equipId || !rarity) return
        return this._dataGroupKV[equipId][rarity];
    }
}

export default new TableEquipRaity();