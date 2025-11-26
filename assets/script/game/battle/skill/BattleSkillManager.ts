import { instantiate, log, UIOpacity, UITransform, Vec3 } from "cc";
import { Logger } from "../../../core/common/log/Logger";
import TableSkill, { SkillCfg } from "../../common/table/TableSkill";
import { BattleManger } from "../BattleManger";
import { BattleZIndexManager } from "../BattleZIndexManager";
import { FighterManager } from "../flighter/FighterManager";
import { BattleSkill } from "./BattleSkill";
import { BattleSkillSpecial } from "./BattleSkillSpecial";

export class BattleSkillManager {
    private static instance: BattleSkillManager;
    public static getInstance(): BattleSkillManager {
        if (!BattleSkillManager.instance) {
            BattleSkillManager.instance = new BattleSkillManager();
        }
        return BattleSkillManager.instance;
    }
    get BZIndex() {
        return BattleZIndexManager.getInstance();
    }

    skills: Map<number, BattleSkill> = new Map();   

    dataInit() {
        this.skills.clear();
    }

    getCasterPos(fId: number) {
        let fighter = FighterManager.getInstance().flighters.get(fId);
        if (fighter) {
            let atkNode = fighter.atkPoint;
            let dirNode = atkNode.getChildByName(`${fighter.dir}`);
            let wPos = dirNode.getComponent(UITransform).convertToWorldSpaceAR(Vec3.ZERO);

            // let wPos = fighter.node.getComponent(UITransform).convertToWorldSpaceAR(Vec3.ZERO);
            let layer = BattleManger.getInstance().BattleMap.getGroundLayer();
            let pos = layer.getComponent(UITransform).convertToNodeSpaceAR(wPos);
            return pos;
        } else {
            return null;
        }
    }
    getTargetPos(fId: number) {
        let fighter = FighterManager.getInstance().flighters.get(fId);
        if (fighter) {
            let dmgNode = fighter.dmgPoint;
            let dirNode = dmgNode.getChildByName(`${fighter.dir}`);
            let wPos = dirNode.getComponent(UITransform).convertToWorldSpaceAR(Vec3.ZERO);

            // let wPos = fighter.node.getComponent(UITransform).convertToWorldSpaceAR(Vec3.ZERO);
            let layer = BattleManger.getInstance().BattleMap.getGroundLayer();
            let pos = layer.getComponent(UITransform).convertToNodeSpaceAR(wPos);
            return pos;
        } else {
            return null;
        }
    }
    // getPos(fId: number, tFId: number) {
    //     let fighter = FighterManager.getInstance().flighters.get(tFId);
    //     let tFighter = FighterManager.getInstance().flighters.get(fId);

    //     let wPos = tFighter.node.getComponent(UITransform).convertToWorldSpaceAR(Vec3.ZERO);
    //     let layer = BattleManger.getInstance().BattleMap.getGroundLayer();
    //     let pos = fighter.node.getComponent(UITransform).convertToNodeSpaceAR(wPos);
    //     if (pos.y > 0) {
    //         pos.y -= 10;
    //     } else {
    //         pos.y += 10;
    //     }

    //     // let xx = Math.abs(y) / (Math.abs(pos.y) - Math.abs(y));

    //     // if (pos.x > 0) {
    //     //     pos.x -= Math.abs(pos.x * xx);
    //     // } else {
    //     //     pos.x += Math.abs(pos.x * xx);
    //     // }
    //     let _pos = fighter.node.getComponent(UITransform).convertToWorldSpaceAR(pos);
    //     let __pos = layer.node.parent.getComponent(UITransform).convertToNodeSpaceAR(_pos);
    //     return __pos;
    // }

    createSkill(effect: core.IDelayEffect) {
        // casterFId: number, targetFid: number, skillId: number
        let casterFId = effect.casterId;
        let targetFid = effect.targetId;
        let skillProtoId = effect.skProtoId;

        let skillInfo = TableSkill.getInfoById(skillProtoId);
        // if (skillInfo.res_name == 'skill_magictower') {
        //     log(effect);
        // }
        if (!skillInfo || !skillInfo.res_name) {
            if (skillInfo && skillInfo.sound) {   
                if (skillInfo.sound.atk_res)
                    BattleManger.getInstance().Battle.battleAudio.playSkill(skillInfo.sound.atk_res, skillInfo.sound.atk_volume);
                if (skillInfo.sound.fly_res)
                    BattleManger.getInstance().Battle.battleAudio.playSkill(skillInfo.sound.fly_res, skillInfo.sound.fly_volume);
                if (skillInfo.sound.hit_res)
                    BattleManger.getInstance().Battle.battleAudio.playSkill(skillInfo.sound.hit_res, skillInfo.sound.hit_volume);
            }
            return;
        }

        let casterF = FighterManager.getInstance().flighters.get(casterFId);
        let targetF = FighterManager.getInstance().flighters.get(targetFid);
        if (!casterF) {
            Logger.erroring("not casterF fid " + casterFId);
            return;
        }
        if (!targetF && targetFid != 0) {
            Logger.erroring("not targetF fid " + targetFid);
            return;
        }
        let t = 0;
        if (effect.effectDelayMs > 0) {
            t = effect.effectDelayMs / 1000;
        }

        let pos = this.getCasterPos(casterFId);
        let targetPos = pos;

        let releaseInPlace = skillInfo.effect_ids.findIndex(v => v == 2) != -1;   

        if (targetF && releaseInPlace == false) {
            targetPos = this.getTargetPos(targetFid);
        }

        let skillPrefabs = BattleManger.getInstance().skillPrefabs;
        let prefab = skillPrefabs[skillInfo.res_name];
        if (!prefab) {
            Logger.erroring("skill prefab err skillid " + skillInfo.id + skillInfo.res_name)
        } else if (skillInfo.res_name == 'skill_magictower' && this.getCurSkill(casterFId, skillProtoId)) {
              
            let sk = this.getCurSkill(casterFId, skillProtoId);
            let skill = sk.getComponent(BattleSkill);
            this.skills.delete(skill.skillId);

            skill.init(targetFid, 0, pos, targetPos, effect);
            this.skills.set(skill.skillId, skill);
            skill.playAnim();
        } else {
            // let skillNode = instantiate(prefab);
            let skillNode = BattleManger.getInstance().getSkillByPool(skillInfo);
            skillNode.getComponent(BattleSkill)?.destroy();
            // skillNode.children.forEach(e => e.active = true);
            // skillNode.getComponentsInChildren(UIOpacity).forEach(e => e.opacity = 255);
            let skill = skillNode.addComponent(BattleSkill);

            let isUndergrond = false;
            if (skillInfo.res_name == 'magic_snowball') {   
                isUndergrond = true;
            }
            this.BZIndex.addSkill(skillNode, casterF.node.position.y, pos.y - targetPos.y > 0, isUndergrond);

            // let preT = skillInfo.effect_delay_ms / 1000;
            // let t = (effect.effectDelayMs - skillInfo.pre_atk_ms) / 1000;
            skill.init(targetFid, t, pos, targetPos, effect);
            this.skills.set(skill.skillId, skill);
            skill.playAnim();
        }
    }

      
    getCurSkill(casterFId: number, skillProtoId: number) {
        let sk: BattleSkill;
        for (let e of this.skills.values()) {
            if (e.effect.casterId == casterFId && e.effect.skProtoId == skillProtoId) {
                sk = e;
                break;
            }
        }
        return sk;
    }

    deleteSkill(skillId: number) {
        let sk = this.skills.get(skillId);
        if (sk) {
            this.skills.delete(skillId);
            // this.BZIndex.delSkill(sk.node)
            BattleManger.getInstance().putSkillByPool(sk.skillInfo, sk.node);
        }
    }

    // getEffectNode(skillInfo: SkillCfg) {
    //     if (this.isFlySkill(skillInfo)) {
      
    //     } else {
      
    //     }
    // }

      
    // isFlySkill(skillInfo: SkillCfg) {
      
    //     return idx != -1;
    // }
}