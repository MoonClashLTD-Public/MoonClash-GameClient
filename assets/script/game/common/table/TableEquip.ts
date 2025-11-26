
import { LanguageData } from "../../../core/gui/language/LanguageData";
import { JsonUtil } from "../../../core/utils/JsonUtil";
import { MaterialCosts } from "./TableCards";

export class TableEquipCfg {
    id: number = 0;
    nft_id: number = 0;
    equipment_type: core.EquipmentType = core.EquipmentType.EquipmentTypeNone;
    name: string = ''
    get showName() {
        return LanguageData.getLangByID(this.name)
    }
    durability_max: number = 0
    durability_cost: number = 0
    desc: string = ''
    description: string = ''
    reset_all_cost: MaterialCosts
    reset_attr_cost: MaterialCosts
}

class TableEquip {
    TableName: string = "equip";
    private _data: TableEquipCfg[];

    private _dataKV: { [key: number]: TableEquipCfg };
    init() {
        if (!this._data) {
            this._data = JsonUtil.get(this.TableName) as TableEquipCfg[];
            let table = this._data;
            this._dataKV = {};
            for (const key in table)
                this._dataKV[table[key].id] = Object.assign(new TableEquipCfg(), table[key]);
        }
    }

    get cfgKV() {
        return this._dataKV;
    }

    get cfg(): TableEquipCfg[] {
        return this._data;
    }

      
    getInfoById(id: number) {
        return this.cfgKV[id];
    }
}

export default new TableEquip();