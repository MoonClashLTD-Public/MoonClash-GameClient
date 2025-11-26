import { _decorator, Component, Animation, v3, tween, find, sp, Vec3, v2, AnimationState, ParticleSystem2D, UITransform } from 'cc';
import { Logger } from '../../../core/common/log/Logger';
import { oops } from '../../../core/Oops';
import { CommonUtil } from '../../../core/utils/CommonUtil';
import { BattleManger } from '../BattleManger';
import { BattleSkill } from './BattleSkill';
import { BattleSkillManager } from './BattleSkillManager';
import { BattleSkillMove } from './BattleSkillMove';
const { ccclass, property } = _decorator;

enum AnimName {
    ATK = 'atk',
    FLY = 'fly',
    HIT = 'hit',
}

@ccclass('BattleSkillAnim')
export class BattleSkillAnim extends Component {
    battleSkill: BattleSkill;
    get battleSkillMove() {
        return this.node.getComponent(BattleSkillMove);
    }

    start() {
    }

    update(deltaTime: number) {
    }

    init(s: BattleSkill) {
        this.battleSkill = s;
    }

    setAngle(angle: number) {
        // this.node.setRotationFromEuler(v3(0, 0, angle));
    }

    // playAnim(delay: number, moveT: number, localPos: Vec3, targetPos: Vec3) {
    //     tween(this.node)
    //         .delay(delay)
    //         .to(moveT, {})
    //     this.delay = delay;
    //     this.moveT = moveT;
    //     this.localPos = localPos;
    //     this.targetPos = targetPos;
    //     CommonUtil.bezierTo(this.node, moveT, v2(), v2(), targetPos, {});
    // }
    atkAnimState: AnimationState
    flyAnimState: AnimationState
    hitAnimState: AnimationState
    getAnim(name: string) {
        let node = this.battleSkill.skillNode.getChildByName(name);

        let anim = this.node.getComponent(Animation);
        let animState = anim.getState(name);
        if (animState) {
              
        } else {
              
            let angle = this.battleSkill.skillMove.calcAngle(v2(this.localPos.x, this.localPos.y), v2(this.targetPos.x, this.targetPos.y));
            let dirInfo = this.battleSkill.skillMove.getDir(angle);
            animState = anim.getState(name + dirInfo.dir);
            // this.node.setScale(dirInfo.scale);

            if (dirInfo.dir == 0) {
                node.angle = angle - 180;
            } else if (dirInfo.dir == 4) {
                node.angle = angle - 90;
            } else if (dirInfo.dir == 8) {
                node.angle = angle - 0;
            }
        }
        animState.clip.initDefault();
        return animState;
    }

    playAnim(time: number, localPos: Vec3, targetPos: Vec3) {
        this.localPos = localPos;
        this.targetPos = targetPos;
        this.atkAnimState = this.getAnim(AnimName.ATK);
        this.flyAnimState = this.getAnim(AnimName.FLY);
        this.hitAnimState = this.getAnim(AnimName.HIT);

          
        let t = time - this.atkAnimState.duration;//- this.hitAnimState.duration;
        if (t < 0) {
            t = 0.01;
            Logger.erroring(`+` + this.node.name + time);
        }

        // let t = this.atkAnimState.duration / this.atkAnimState.speed;
        // let anim = this.node.getComponent(Animation);
        // anim.on(Animation.EventType.FINISHED, (type: Animation.EventType, state: AnimationState) => {
        //     if (state.name == this.atkAnimState.name) {
        //         this.flyAnimState.speed = this.flyAnimState.duration / t;
        //         this.flyAnimState.play();
        //         this.playSk("fly");
        //         this.moveNode(t);
        //     } else if (state.name == this.flyAnimState.name) {
        //         this.hitAnimState.play();
        //         this.playSk("hit");
        //     } else if (state.name == this.hitAnimState.name) {
        //         this.scheduleOnce(() => {
        //             BattleSkillManager.getInstance().deleteSkll(this.battleSkill)
        //         }, 0)
        //     }
        //     // log(state.name)
        // }, this)

        // if (this.battleSkill.skillInfo.res_name == 'magic_thunder') {
        //     console.log("-===");
        // }

        this.atkAnimState.play();   
        this.playSk(AnimName.ATK);

        tween(this.node)
            .delay(this.atkAnimState.duration)   
            .call(() => {
                this.flyAnimState.play();
                this.playSk(AnimName.FLY);
                this.moveNode(t);
            })
            .start();

        // tween(this.node)
          
        //     .call(() => {
        //         let fly = this.node.getChildByName('skill')?.getChildByName('fly');
        //         fly.active = false;
        //     })
        //     .start();

        tween(this.node)
            .delay(this.atkAnimState.duration + t)   
            .call(() => {
                // this.node.getChildByName('skill').getChildByName('fly');
                // this.flyAnimState.stop();
                this.hitAnimState.play();
                this.playSk(AnimName.HIT);
                this.battleSkillMove.isMove = false;
            })
            .start();

        tween(this.node)
            .delay(this.atkAnimState.duration + t + this.hitAnimState.duration)
            .call(() => {
                this.scheduleOnce(() => {
                    BattleSkillManager.getInstance().deleteSkill(this.battleSkill.skillId);
                }, 0)
            })
            .start();

        // this.localPos = localPos;
        // this.targetPos = targetPos;
        // let anim = this.node.getComponent(Animation);
        // let defaultAnim = anim.getState('anim');
        // if (defaultAnim) {
        // } else {
        //     let angle = this.battleSkill.skillMove.calcAngle(v2(localPos.x, localPos.y), v2(targetPos.x, targetPos.y));
        //     let dirInfo = this.battleSkill.skillMove.getDir(angle);
        //     defaultAnim = anim.getState('anim' + dirInfo.dir);
        //     this.node.setScale(dirInfo.scale);
        // }

        // // let v1 = speed;

        // defaultAnim.clip.initDefault()

        // // let dis = Vec3.distance(this.localPos, this.targetPos);
          
        // let t1 = time;

        // let onAnimStart = defaultAnim.clip.events.find(v => v.func == 'onAnimStart');
        // let onAnimMove = defaultAnim.clip.events.find(v => v.func == 'onAnimMove');
        // let onAnimHit = defaultAnim.clip.events.find(v => v.func == 'onAnimHit');
        // let onAnimComplete = defaultAnim.clip.events.find(v => v.func == 'onAnimComplete');

          
        // let t = defaultAnim.clip.duration - onAnimHit.frame - onAnimMove.frame;
        // if (t <= 0) {
        //     Logger.erroring('BattleSkillAnim.playAnim: t <= 0');
        //     t = defaultAnim.clip.duration;
        // }
          
        // defaultAnim.speed = animSpeed;
        // this.moveT = t1;

        // defaultAnim.play();
    }

    moveNode(t: number) {
        let bezier = this.node.getChildByName("bezier");
        if (bezier) {
            let diffX = this.targetPos.x - this.localPos.x;
            let diffY = this.targetPos.y - this.localPos.y;
            // let x = diffX * bezier.position.x;
            // let y = diffY * bezier.position.y;
            // let controlPoint = v2(this.localPos.x + x, this.localPos.y + y);
            let x = bezier.position.x;
            let y = bezier.position.y;
            let controlPoint = v2(this.localPos.x, this.localPos.y);
            controlPoint.y += y;
            // if (diffY > 0) {
            // } else {
            //     controlPoint.y -= y;
            // }
            if (diffX > 0) {
                controlPoint.x -= x;
            } else {
                controlPoint.x += x;
            }
            CommonUtil.bezierTo(this.node, t, v2(this.localPos.x, this.localPos.y), controlPoint, this.targetPos, {})
                .start();
        } else {
            let dis = Vec3.distance(this.localPos, this.targetPos);
            this.battleSkillMove.bulletSpeed = dis / t;
            this.battleSkillMove.tmpPos = this.targetPos;
            this.battleSkillMove.isMove = true;
            // tween(this.node)
            //     .to(t, { position: this.targetPos })
            //     .start();
        }
    }

    playSk(name: AnimName) {
        let sk = find(name, this.battleSkill.skillNode)?.getComponent(sp.Skeleton)
        if (sk) {
            sk.setAnimation(0, sk.animation, false);
        }

        if (name == AnimName.ATK) {
            this.atkSfxFun();
        } else if (name == AnimName.FLY) {
            this.flySfxFun();
        } else if (name == AnimName.HIT) {
            this.hitSfxFun();
        }
    }

    moveT: number;   
    localPos: Vec3;   
    targetPos: Vec3;   
      
    // onAnimStart() {
    //     let sk = find('skill/atk', this.node)?.getComponent(sp.Skeleton)
    //     if (sk)
    //         sk.setAnimation(0, 'animation', false);
    // }

      
    // onAnimMove() {
    //     // let controlPoint = v2(this.localPos.x, this.localPos.y);
    //     // let diffX = this.localPos.x - this.targetPos.x;
    //     // let diffY = this.localPos.y - this.targetPos.y;
      
    //     // //     controlPoint.x += diffX;
      
    //     // //     controlPoint.x += diffX;
    //     // // }
      
    //     // //     controlPoint.y += diffY * 0.2;
      
    //     // // }

    //     // // controlPoint.x += diffX;
    //     // controlPoint.x = this.targetPos.x;
    //     // controlPoint.y += diffY * 0.2;

    //     // CommonUtil.bezierTo(this.node, this.moveT, v2(this.localPos.x, this.localPos.y), controlPoint, this.targetPos, {})
    //     //     .start();
    //     tween(this.node)
    //         .to(this.moveT, { position: this.targetPos })
    //         .start();
    // }
      
    // onAnimHit() {
    //     let sk = find('skill/hit', this.node)?.getComponent(sp.Skeleton)
    //     if (sk)
    //         sk.setAnimation(0, 'animation', false);
    // }
      
    // onAnimComplete() {
    //     this.scheduleOnce(() => {
    //         BattleSkillManager.getInstance().deleteSkll(this.battleSkill)
    //     }, 0)
    // }

    atkSfxFun() {
        let sound = this.battleSkill.skillInfo.sound;
        if (sound?.atk_res)
            this.playEffect(sound.atk_res, sound.atk_volume);
    }

    flySfxFun() {
        let sound = this.battleSkill.skillInfo.sound;
        if (sound?.fly_res)
            this.playEffect(sound.fly_res, sound.fly_volume);
    }
    hitSfxFun() {
        let sound = this.battleSkill.skillInfo.sound;
        if (sound?.hit_res)
            this.playEffect(sound.hit_res, sound.hit_volume);
    }

    playEffect(res: string, volumeScale: number) {
        if (BattleManger.getInstance().gameState == core.BattleState.BattleSettle) return;
        if (res)
            BattleManger.getInstance().Battle.battleAudio.playSkill(res, volumeScale);
    }
}