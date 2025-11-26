import { _decorator, Component, Animation, Vec3, tween, Node } from 'cc';
import TableSkill, { SkillCfg } from '../../common/table/TableSkill';
import { BattleManger } from '../BattleManger';
import { FighterManager } from '../flighter/FighterManager';
import { BattleSkillAnim } from './BattleSkillAnim';
import { BattleSkillManager } from './BattleSkillManager';
import { BattleSkillMove } from './BattleSkillMove';
import { BattleSkillSpecial } from './BattleSkillSpecial';
const { ccclass, property } = _decorator;

@ccclass('BattleSkill')
export class BattleSkill extends Component {

    skillAnim: BattleSkillAnim
    skillMove: BattleSkillMove

    localPos: Vec3   
    targetPos: Vec3   

    skillId: number
    protoId: number
    skillInfo: SkillCfg

    targetFid: number = 0;
    skillNode: Node = null;
    effect: core.IDelayEffect = null;
    time: number = 0;
    init(targetFid: number, time: number, localPos: Vec3, targetPos: Vec3, effect: core.IDelayEffect) {
        this.targetFid = targetFid;
        this.effect = effect;
        this.localPos = localPos;
        this.targetPos = targetPos;

        this.protoId = effect.skProtoId;
        this.skillId = effect.id;
        let skillInfo = TableSkill.getInfoById(this.protoId);
        this.skillInfo = skillInfo;
        this.time = time;
        // this.skillAnim = this.node.getComponent(Animation);
    }

      
    playAnim() {
        let skillInfo = this.skillInfo;
        let effect = this.effect;
        let skill = this.node.getChildByName('skill');
        if (!skill) {
            let skill_b = this.node.getChildByName('skill_b');
            let skill_r = this.node.getChildByName('skill_r');
            let f = FighterManager.getInstance().flighters.get(effect.targetId);
            if (!f)
                f = FighterManager.getInstance().flighters.get(effect.casterId);
            let team = f.fGo.props.GetValue(core.PropType.PropTypeTeam).i32;
            let isBlue = BattleManger.getInstance().getDisplayColorByTeam(team) == core.Team.Blue;

            skill_b.active = isBlue;
            skill_r.active = !isBlue;
            if (skill_b.active) {
                skill = skill_b;
            } else {
                skill = skill_r;
            }
        }
        this.skillNode = skill;

        if (skillInfo.res_name == 'skill_magictower') {
              
            this.playLaserAnim();
        } else if (skillInfo.res_name == 'skill_bomberballoon') {
              
            this.playBomberballoonAnim();
        } else {
            this.playNormal();
        }

    }

      
    playNormal() {
        this.skillAnim = this.node.getComponent(BattleSkillAnim) ?? this.node.addComponent(BattleSkillAnim);
        this.skillAnim.init(this);
        this.skillMove = this.node.getComponent(BattleSkillMove) ?? this.node.addComponent(BattleSkillMove);
        this.skillMove.init(this);

        // let t1 = 100 / 1000;
        // let t2 = 900 / 1000;
        this.skillMove.syncPosWithEntity();

        this.skillAnim.playAnim(this.time, this.localPos, this.targetPos);
        // tween(this.node)
        //     .delay(t1)
        //     .call(() => {
        //         this.skillAnim.play("anim");
        //         skillMove.smoothSyncPosWithEntity(t2);
        //     })
        //     .delay(t2)
        //     .delay(0.5)
        //     .call(() => {
        //         BattleSkillManager.getInstance().deleteSkll(this);
        //     })
        //     .start();
    }

      
    playLaserAnim() {
        let s = this.node.getComponent(BattleSkillSpecial) || this.node.addComponent(BattleSkillSpecial);
        s.playLaser(this.localPos, this.targetPos);
    }

      
    playBomberballoonAnim() {
        let s = this.node.getComponent(BattleSkillSpecial) || this.node.addComponent(BattleSkillSpecial);
        s.playBomberballoon(this.localPos, this.targetPos);
    }
}