
import { CommonUtil } from "../../../core/utils/CommonUtil";
import { JsonUtil } from "../../../core/utils/JsonUtil";

export class TableEquipBurnCfg {
    id: number = 0;
    equip_id: number = 0;
      
    rarity: number = 0;
    name: string = '';
    res_name: string = '';
    dgg_gwei: number = 0
    get showDgg() {
        return CommonUtil.gweiToNum(this.dgg_gwei.toString())
    }
    dna_gwei: number = 0
    get showDna() {
        return CommonUtil.gweiToNum(this.dna_gwei.toString())
    }
}

class TableEquipBurn {
    TableName: string = "equip_burn";
    private _data: TableEquipBurnCfg[];

    private _dataKV: { [key: number]: TableEquipBurnCfg };
    private _dataGroupKV: { [key: number]: TableEquipBurnCfg[] };
    init() {
        if (!this._data) {
            this._data = JsonUtil.get(this.TableName) as TableEquipBurnCfg[];
            let table = this._data;
            this._dataKV = {};
            this._dataGroupKV = {}
            for (const key in table) {
                const v = Object.assign(new TableEquipBurnCfg(), table[key]);
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
    get cfg(): TableEquipBurnCfg[] {
        return this._data;
    }
    getInfoById(id: number) {
        return this.cfgKV[id];
    }

      
    getInfoByEquipIdAndRarity(equipId: number, rarity: number): TableEquipBurnCfg {
        if (!equipId || !rarity) return
        return this._dataGroupKV[equipId][rarity];
    }
}

export default new TableEquipBurn();