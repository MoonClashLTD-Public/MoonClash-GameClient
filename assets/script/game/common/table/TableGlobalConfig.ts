
import { JsonUtil } from "../../../core/utils/JsonUtil";

export class GlobalConfigCfg {
      
    chat_cd: number = 0
      
    card_window_size: number = 0
      
    initial_food: number = 0
      
    max_food: number = 0
      
    food_add_interval_ms: number = 0
      
    ready_ms: number = 0
      
    fighting_ms: number = 0
      
    over_time_ms: number = 0
    normal_food_ms: number = 0
    tower_inits: number = 0
      
    customer_service: string = ""
      
    white_paper: string = ""
      
    add_assist_pts: number = 0;
      
    spbox_price: number = 0
      
    goldbox_price: number = 0
      
    bound_box_price: number = 0
      
    transfer_in_game_tax_rate:number = 0
      
    assist_mode: number = 0
}

class TableGlobalConfig {
    TableName: string = "global_config";
    private data: GlobalConfigCfg;

    init() {
        if (!this.data) {
            var table = JsonUtil.get(this.TableName);
            this.data = Object.assign(new GlobalConfigCfg(), table[0]);
        }
    }
    get cfg(): GlobalConfigCfg {
        return this.data;
    }
}

export default new TableGlobalConfig();