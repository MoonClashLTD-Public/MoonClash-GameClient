
import { JsonUtil } from "../../../core/utils/JsonUtil";

export class BBoxCardCfg {
    /**id */
    Id: number = 0
      
    proto_id: number = 0;
      
    res_name: string = '';
      
    level: number = 0;
      
    inn_name: string = '';
      
    name: string = '';
      
    durable: number = 0;
      
    sortInd: number = -1
      
    needFood: number = 0
      
    addCardGroup: number = -1

      
    attrs: { name: string, attr: string }[] = []
}

class BBoxTableCards {
    static TableName: string = "cards";
    private _data: BBoxCardCfg[];

    private _dataKV: { [key: number]: BBoxCardCfg };
    get cfgKV() {
        if (!this._dataKV) {
            this._dataKV = {};
            let table = JsonUtil.get(BBoxTableCards.TableName) as BBoxCardCfg[];
            for (const key in table)
                this._dataKV[table[key].Id] = Object.assign(new BBoxCardCfg(), table[key]);
        }
        return this._dataKV;
    }
    get cfg(): BBoxCardCfg[] {
        if (!this._data) {
            this._data = JsonUtil.get(BBoxTableCards.TableName) as BBoxCardCfg[];
        }
        return this._data;
    }

    getInfoById(id: number) {
        return this.cfgKV[id];
    }
}

export default new BBoxTableCards();