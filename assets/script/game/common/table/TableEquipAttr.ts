
import { color, Color } from "cc";
import { JsonUtil } from "../../../core/utils/JsonUtil";

export class TableEquipAttrCfg {
    id: number = 0;
    name: string = ''
    attr_id: number = 0
      
    quality: core.EquipmentAttrQuality = core.EquipmentAttrQuality.EquipmentAttrQualityNone;
    qualityColor: Color = color(255, 255, 255);
    desc: string = ''
      
    description: string = ''
      
    cCombat: number = 0

       
     icon_res: string = ""
}
/*  
  
  
  
  
*/
class TableEquipAttr {
    TableName: string = "equip_attr";
    private _data: TableEquipAttrCfg[];
    // quality attr_id
    private _dataKV: { [key: number]: { [key: number]: TableEquipAttrCfg } };
    private _colorMap: { [num: number]: { color: Color, combat: number } } = {
        [core.EquipmentAttrQuality.EquipmentAttrQualityWhite]: { color: color("20FF3A"), combat: 0.5 },
        [core.EquipmentAttrQuality.EquipmentAttrQualityBlue]: { color: color("54DDFF"), combat: 1.5 },
        [core.EquipmentAttrQuality.EquipmentAttrQualityPurple]: { color: color("F554FF"), combat: 4 },
        [core.EquipmentAttrQuality.EquipmentAttrQualityYellow]: { color: color("FF8813"), combat: 10 },
    }

    init() {
        if (!this._data) {
            this._data = JsonUtil.get(this.TableName) as TableEquipAttrCfg[];
            let table = this._data;
            this._dataKV = {};
            for (const key in table) {
                const v = table[key]
                const mQuality = this.getAttrColorByQualityType(v.quality)
                if (!this._dataKV[v.quality]) this._dataKV[v.quality] = {}
                this._dataKV[v.quality][v.attr_id] = Object.assign(new TableEquipAttrCfg(), v, { qualityColor: mQuality.color, cCombat: mQuality.combat });
            }
        }
    }

    get cfgKV() {
        return this._dataKV;
    }

    get cfg(): TableEquipAttrCfg[] {
        return this._data;
    }

      
    getInfoByQualityAndAttrId(quality: core.EquipmentAttrQuality, attrId: number) {
        return this.cfgKV[quality][attrId]
    }

    getAttrColorByQualityType(quality: core.EquipmentAttrQuality) {
        return this._colorMap[quality] || { color: color("FFFFFF"), combat: 0 }
    }
}


export default new TableEquipAttr();