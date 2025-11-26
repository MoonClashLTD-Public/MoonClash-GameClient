
import { CommonUtil } from "../../../core/utils/CommonUtil";
import { JsonUtil } from "../../../core/utils/JsonUtil";

export class TableEquipComposeCfg {
    id: number = 0;
    rarity_a: number = 0;
    rarity_b: number = 0;
    extra_material_proto_id: core.NftMaterialType = core.NftMaterialType.MaterialNone;
    rarity_weights: {
        rarity: number
        weight: number
    }[]
    cost: {
        dgg_gwei: number
        dna_gwei: number
        materials: any
    }
}

class TableEquipCompose {
    TableName: string = "equip_compose";
    private _data: TableEquipComposeCfg[];
      
    private _currMaterialId = core.NftMaterialType.MaterialNone
    get currMaterialId() {
        return this._currMaterialId
    }

    private _dataABKV: { [key: number]: { [key: number]: TableEquipComposeCfg[] } };
    init() {
        if (!this._data) {
            this._data = JsonUtil.get(this.TableName) as TableEquipComposeCfg[];
            let table = this._data;
            this._dataABKV = {}
            for (const key in table) {
                const v = Object.assign(new TableEquipComposeCfg(), table[key]);
                if (!this._dataABKV[v.rarity_a]) this._dataABKV[v.rarity_a] = []
                if (!this._dataABKV[v.rarity_a][v.rarity_b]) this._dataABKV[v.rarity_a][v.rarity_b] = []
                this._dataABKV[v.rarity_a][v.rarity_b][v.extra_material_proto_id] = v
                if (v?.extra_material_proto_id != core.NftMaterialType.MaterialNone) {
                    this._currMaterialId = v.extra_material_proto_id
                }
            }
        }
    }

    get cfg(): TableEquipComposeCfg[] {
        return this._data;
    }

    getInfoByABAndMaterial(aMin: number, bMax: number, material: number) {
        return this._dataABKV[aMin][bMax][material];
    }
}

export default new TableEquipCompose();