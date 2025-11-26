import { _decorator, Component, log, v3 } from 'cc';
import TableSkill, { SkillCfg } from '../../common/table/TableSkill';
import BattleFlashSprite from '../cmps/BattleFlashSprite';
import { FighterManager } from './FighterManager';
import { Flighter } from './Flighter';
const { ccclass, property } = _decorator;

@ccclass('FlighterBuff')
export class FlighterBuff extends Component {
    flighter: Flighter

    get roleSpr() {
        return this.flighter.roleSpr;
    }

    cFighter: core.IFighter

    start() {

    }

    update(deltaTime: number) {

    }

    onDestroy() {
    }

    init(f: Flighter) {
        this.flighter = f;
    }

    playBuffs(cFighter: core.IFighter) {
        this.cFighter = cFighter;
        for (const buff of cFighter.doBuffs) {
            let _buff = TableSkill.getInfoById(buff.buffConfigId);
            if (_buff && _buff.buff_action_name) {
                this[`play${_buff.buff_action_name}`] && this[`play${_buff.buff_action_name}`](_buff, buff.op);
            }
        }
    }

      
    playFrozenBuff(_buff: SkillCfg, op: skill.BuffOp) {
        if (op == skill.BuffOp.Add) {
            this.roleSpr.setMaterial(this.flighter.blinkBuffSpeedMat, 0);
            this.roleSpr.getComponent(BattleFlashSprite).defaultColor();
            this.roleSpr.getComponent(BattleFlashSprite).uiOf.opacity = 76.5;
            this.setAnimSpeed(0);
        } else if (op == skill.BuffOp.Remove) {
            this.roleSpr.getComponent(BattleFlashSprite).defaultColor();
            this.flighter.resetDefMat();
            this.setAnimSpeed(1);
        }
    }

      
    playSlowDownBuff(_buff: SkillCfg, op: skill.BuffOp) {
        if (op == skill.BuffOp.Add) {
            this.roleSpr.setMaterial(this.flighter.blinkBuffSpeedMat, 0);
            this.roleSpr.getComponent(BattleFlashSprite).defaultColor();
            this.roleSpr.getComponent(BattleFlashSprite).uiOf.opacity = 76.5;
            this.setAnimSpeed(0.3);
        } else if (op == skill.BuffOp.Remove) {
            this.roleSpr.getComponent(BattleFlashSprite).defaultColor();
            this.flighter.resetDefMat();
            this.setAnimSpeed(1);
        }
    }

      
    playDizzinessBuff(_buff: SkillCfg, op: skill.BuffOp) {
        if (op == skill.BuffOp.Add) {
            let top = FighterManager.getInstance().getFighterTop(this.cFighter.id);
            if (top) {
                let pos = top.topNode.getPosition();
                this.flighter.dizzinessAnim.node.setPosition(v3(pos.x, pos.y - 30));
            }
            this.flighter.dizzinessAnim.node.active = true;
            this.setAnimSpeed(0);
        } else if (op == skill.BuffOp.Remove) {
            this.flighter.dizzinessAnim.node.active = false;
            this.setAnimSpeed(1);
        }
    }

    die() {
        this.flighter.dizzinessAnim.node.active = false;
    }

    setAnimSpeed(speed: number) {
        let state = this.flighter.roleAnimation.getState(this.flighter.flighterAnim.currState?.name);
        if (state)
            state.speed = speed;
        this.flighter.animSpeed = speed;
    }
}