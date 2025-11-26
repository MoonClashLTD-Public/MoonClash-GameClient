import { _decorator, Component, Label, ProgressBar, Node } from 'cc';
import { oops } from '../../core/Oops';
import TableBattle from '../common/table/TableBattle';
import TableHeroes from '../common/table/TableHeroes';
import TableTower, { TowerCfg } from '../common/table/TableTower';
import { PlayerManger } from '../data/playerManager';
const { ccclass, property } = _decorator;

@ccclass('HomeLevelPopUp')
export class HomeLevelPopUp extends Component {
    @property(Label)
    levelLbl: Label = null;
    @property(ProgressBar)
    expBar: ProgressBar = null;
    @property(Label)
    expLbl: Label = null;
    @property(Label)
    cardPowerLbl: Label = null;
    @property(Label)
    equipmentPowerLbl: Label = null;
    @property(Label)
    towerHpLbl: Label = null;
    @property(Label)
    towerDmgLbl: Label = null;
    @property(Node)
    explainNode: Node = null;
    start() {
    }

    update(deltaTime: number) {

    }
    public onAdded(params: any = {}) {
          
          
        let info = HomeLevelPopUp.calcLevel();
        let king = TableHeroes.getInfoById(info.tower.king_tower_hero_config_id);
        let hp = king.props.find(v => v.t == core.PropType.PropTypeHpMax).i32;
        let atk = king.props.find(v => v.t == core.PropType.PropTypeAtk).i32;

        this.levelLbl.string = `${info.level}`;
        this.expBar.progress = info.power / info.maxPower;
        this.expLbl.string = `${info.power}/${info.maxPower}`;
        this.cardPowerLbl.string = `${HomeLevelPopUp.calcCardPower()}`;
        this.equipmentPowerLbl.string = `${HomeLevelPopUp.calcEquipPower()}`;
        this.towerHpLbl.string = `${hp}`;
        this.towerDmgLbl.string = `${atk}`;
    }
    public onRemoved() {
    }

    static calcLevel() {
        let level = 1;
        let maxPower = 0;
        let power = HomeLevelPopUp.calcEquipPower() + HomeLevelPopUp.calcCardPower();
        let towerCfgs = TableTower.cfg.filter(v => v.type == 0);
        let towerInfo: TowerCfg = towerCfgs[0];
        for (const tower of towerCfgs) {
            maxPower = tower.power;
            if (power > tower.power) {
                level = tower.level;
                towerInfo = tower
            } else {
                break;
            }
        }
        if (maxPower == 0) {
            maxPower = towerCfgs[towerCfgs.length - 1].power;
        }
        return { level: level, power: power, maxPower: maxPower, tower: towerInfo };
    }

    static calcEquipPower() {
        let power = 0;
        let equips = PlayerManger.getInstance().equipManager.playEquipGroup.getCurrCardGroup().filter((v, k) => v.id != 0);
        for (const equip of equips) {
            for (const attr of equip.attrs) {
                power += TableBattle.cfg.quality_fight_powers.find(v => v.q == attr.quality).fp;
            }
        }
        return power;
    }

    static calcCardPower() {
        let power = 0;
        let cards = PlayerManger.getInstance().cardManager.playCardGroup.getCurrCardGroupCards();
        for (const card of cards) {
            power += card.level * TableBattle.cfg.card_level_to_fight_power;
        }
        return power;
    }


    explainClick() {
        this.explainNode.active = !this.explainNode.active;
    }

    closeClick() {
        oops.gui.removeByNode(this.node);
    }
}