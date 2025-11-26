
import { log } from "cc";
import { CommonUtil } from "../../../core/utils/CommonUtil";
import { JsonUtil } from "../../../core/utils/JsonUtil";
import { ResManger } from "../../data/resManger";
import TableNfts from "./TableNfts";

export class CardCfg {
    /**id */
    Id: number = 0;
      
    proto_id: number = 0;
      
    card_type: core.NftSubType = 0;
      
    get res_name() {
        return ResManger.getInstance().getIconSpriteFrame(this.proto_id);
    }
    set res_name(val) { }
      
    level: number = 0;
      
    get name() {
        return TableNfts.getInfoById(this.proto_id).display_name;
    }
    set name(val) { }
      
    inn_name: string = '';
      
    cost: number = 0;
      
    cast_range: core.CastRange = 0;
      
    summons: {
        id: number
        count: number
        offset_id: number
    }[] = [];
      
    power_cost: number = 0;
      
    max_power: number = 0;
      
    power_recover_interval: number = 0;
      
    power_recover_value: number = 0;
      
    hero_config_id: number = 0;
      
    hero_count: number = 0;
      
    upgrade_cost: CardCfgUpradeCost
    reset_all_cost: MaterialCosts
    reset_attr_cost: MaterialCosts
    reset_power_cost: MaterialCosts
      
    attr_pool_id: number = 0
    desc: string = ''
}

export class CardCfgUpradeCost {
      
    dna_gwei: number = 0;
      
    dgg_gwei: number = 0;
      
    cards: number = 0;
      
    jxs: number = 0;
      
    cd_sec: number = 0;
}
export class MaterialCosts {
    dna_gwei: number = 0
    materials: core.IdCount[]
}
class TableCards {
    TableName: string = "cards";
    private _data: CardCfg[];

    private _dataKV: { [key: number]: CardCfg };
    private _dataGroupKV: { [key: number]: CardCfg[] };
    init() {
        if (!this._data) {
            this._data = JsonUtil.get(this.TableName) as CardCfg[];
            this._dataKV = {};
            this._dataGroupKV = {}
            let table = this._data;
            for (const key in table) {
                this._dataKV[table[key].Id] = Object.assign(new CardCfg(), table[key]);
                let _dataGroup = this._dataGroupKV[table[key].proto_id]
                if (!_dataGroup) this._dataGroupKV[table[key].proto_id] = []
                this._dataGroupKV[table[key].proto_id][table[key].level - 1] = table[key];
            }
        }
    }
    get cfgKV() {
        return this._dataKV;
    }
    get cfg(): CardCfg[] {
        return this._data;
    }

    getInfoById(id: number) {
        return this.cfgKV[id];
    }
    getInfoByProtoIdAndLv(protoId: number, lv: number) {
        let cards = this._dataGroupKV[protoId];
        return cards && cards[lv - 1];
    }

    getMaxLvByProtoId(protoId: number) {
        return this._dataGroupKV[protoId].length;
    }

      
    creNetCardByProtoId(protoId: number) {
        return core.Card.create({
            protoId: protoId,
            level: 1
        })
    }
}

export default new TableCards();