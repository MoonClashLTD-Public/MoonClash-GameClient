import { _decorator, Component, Node, v2, v3, UITransform, EventTouch, Vec2, size, Tween, tween, Vec3, log } from 'cc';
import { BattleManger } from '../BattleManger';
import { BattleSkill } from './BattleSkill';
import { BattleSkillAnim } from './BattleSkillAnim';
import { BattleSkillManager } from './BattleSkillManager';
const { ccclass, property } = _decorator;

@ccclass('BattleSkillMove')
export class BattleSkillMove extends Component {
    skill: BattleSkill;
    get skillAnim() {
        return this.node.getComponent(BattleSkillAnim);
    }

    tmpPos: Vec3
    bulletSpeed: number = 0;
    isMove = false;
    start() {
    }

    update(dt: number) {
        if (this.isMove == false) return;
        if (this.skill.targetFid) {
            let pos = BattleSkillManager.getInstance().getTargetPos(this.skill.targetFid);
            if (pos) {
                this.tmpPos = pos;
            }
        }
        if (this.tmpPos) {
            let targetPos = this.tmpPos;
            // let targetPos: cc.Vec2 = this.target.getPosition();
            let bulletPos: Vec3 = this.node.getPosition();
            let normalizeVec3: Vec3 = targetPos.subtract(bulletPos).normalize();

            let pos = v3(bulletPos.x + normalizeVec3.x * this.bulletSpeed * dt,
                bulletPos.y + normalizeVec3.y * this.bulletSpeed * dt, 0);
            if (!Vec3.equals(bulletPos, pos))
                this.node.setPosition(pos);
            // this.node.setPosition(this.tmpPos);
        }
    }

    init(s: BattleSkill) {
        this.tmpPos = null;
        this.bulletSpeed = 0;
        this.isMove = false;

        this.skill = s;
    }

    getDir(angle: number) {
        let _angle = Math.abs(angle)
        let _sign = Math.sign(angle)

        // let dir = 0;
        // if (_angle <= 11.25) { // 0
        //     dir = 8;
        // } else if (_angle <= 33.75) { // 1
        //     dir = 7;
        // } else if (_angle <= 56.25) { // 2
        //     dir = 6;
        // } else if (_angle <= 78.75) { // 3
        //     dir = 5;
        // } else if (_angle <= 101.25) { // 4
        //     dir = 4;
        // } else if (_angle <= 123.75) { // 5
        //     dir = 3;
        // } else if (_angle <= 146.25) { // 6
        //     dir = 2;
        // } else if (_angle <= 168.75) { // 7
        //     dir = 1;
        // } else {                       // 8
        //     dir = 0;
        // }
        // let dir = 0;
        // if (_angle <= 56.25) { // 2
        //     dir = 8;
        // } else if (_angle <= 123.75) { // 5
        //     dir = 4;
        // } else {                       // 8
        //     dir = 0;
        // }
        let dir = 0;
        if (_angle <= 90) {
            dir = 8;
        } else {
            dir = 0;
        }

        dir = 8 - dir;
        let s = _sign > 0 ? 1 : -1;
        return { dir: dir, scale: v3(s, 1, 1) }
    }

    calcAngle(startPos?: Vec2, endPos?: Vec2) {
        let targetPos = endPos ?? v2(this.skill.targetPos.x, this.skill.targetPos.y);
        let pos: Vec2 = startPos ?? v2(this.node.position.x, this.node.position.y);
        let normalize: Vec2 = targetPos.clone().subtract(pos).normalize();

          
        let angle = v2(0, 1).signAngle(v2(normalize.x, normalize.y)) * 180 / Math.PI;
        // this.node.angle = angle;
        // this.skillAnim?.setAngle(angle);
        return angle;
    }

    moveTween: Tween<Node> = null;
    moveDstPos: Vec3 = null;
    syncPosWithEntity() {
        this.node.setPosition(this.skill.localPos);
    }
    smoothSyncPosWithEntity(duration: number) {
          
          
          
        if (this.moveDstPos != null && this.moveDstPos.equals(this.skill.targetPos)) {
            // cc.log("here");
            return;
        }

        this.moveDstPos = this.skill.targetPos.clone();

        if (this.moveTween != null) {
            this.moveTween.stop();
        }

        // cc.log('duration:', duration);

          
        this.moveTween = tween(this.node)
            .to(duration, {
                position: this.moveDstPos
            }).start()
    }
      
    // _smoothSyncPosWithEntity() {
      
      
      
    //     if (this.moveDstPos != null && this.moveDstPos.equals(this.skill.targetPos)) {
    //         // cc.log("here");
    //         return;
    //     }

    //     this.moveDstPos = this.skill.targetPos.clone();

    //     if (this.moveTween != null) {
    //         this.moveTween.stop();
    //     }

      
    //     // let duration = this.game.dLogicDt.toNumber();
      
    //     let mgr = BattleManger.getInstance();
    //     let duration = mgr.frameRecvDt || 0;
      
    //     duration = Math.max(
    //         duration,
    //         mgr.dLogicDt
    //     );
      
    //     duration = Math.min(
    //         duration,
    //         mgr.dLogicDt * 3
    //     );

    //     // cc.log('duration:', duration);

      
    //     this.moveTween = tween(this.node)
    //         .to(duration, {
    //             position: this.moveDstPos
    //         }).start()
    // }

}

