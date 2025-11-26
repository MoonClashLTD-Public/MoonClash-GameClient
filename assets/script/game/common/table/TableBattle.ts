
import { JsonUtil } from "../../../core/utils/JsonUtil";

export class BattleCfg {
    card_level_to_fight_power: number = 0;
    quality_fight_powers: { q: number, fp: number }[] = [];
}

class TableBattle {
    TableName: string = "battle";
    private data: BattleCfg;

    init() {
        if (!this.data) {
            var table = JsonUtil.get(this.TableName);
            this.data = Object.assign(new BattleCfg(), table[0]);
        }
    }
    get cfg(): BattleCfg {
        return this.data;
    }
}

export default new TableBattle();