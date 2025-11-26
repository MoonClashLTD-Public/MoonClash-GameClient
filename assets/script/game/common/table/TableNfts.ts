
import { Message } from "../../../core/common/event/MessageManager";
import { JsonUtil } from "../../../core/utils/JsonUtil";
import { DataEvent } from "../../data/dataEvent";
import { PlayerManger } from "../../data/playerManager";

export class NftCfg {
    Id: number = 0;
    inn_name: string = '';
    nft_type: core.NftType;
    res_name: string = '';
    display_name: string = '';
    sub_type: core.NftSubType;
    material_type: core.NftMaterialType;
    description: string = '';
    bgcolor: string = '';

    get count() {
        let material = PlayerManger.getInstance().playerSelfInfo.materials.find(v => v.tokenType == this.material_type);
        return material ? material.total - material.locking : 0;
    }
}

class TableNfts {
    TableName: string = "nfts";
    private _data: NftCfg[];
    private _dataMaterial: NftCfg[];
    private _dataKV: { [key: number]: NftCfg };
    private _dataMaterialKV: { [key: number]: NftCfg };
    init() {
        if (!this._data) {
            this._data = JsonUtil.get(this.TableName) as NftCfg[];
            this._dataMaterial = [];
            this._dataKV = {};
            this._dataMaterialKV = {};
            let table = this._data;
            for (const key in table) {
                let d = Object.assign(new NftCfg(), table[key]);
                this._dataKV[table[key].Id] = d;
                if (d.material_type != core.NftMaterialType.MaterialNone) {
                    this._dataMaterialKV[d.material_type] = d;
                    this._dataMaterial.push(d);
                }
            }
        }
    }
    get cfgKV() {
        return this._dataKV;
    }
    get cfgMaterialKV() {
        return this._dataMaterialKV;
    }
    get cfgMaterial() {
        return this._dataMaterial;
    }
    get cfg(): NftCfg[] {
        return this._data;
    }
    getInfoById(id: number) {
        return this.cfgKV[id];
    }
    getInfoByMaterialType(materialType: core.NftMaterialType) {
        return this._dataMaterialKV[materialType];
    }
}

export default new TableNfts();