import { Component, easing, Node, sp, Tween, tween, UIOpacity, UITransform, v2, v3, Vec3 } from "cc";
import { CommonUtil } from "../../../core/utils/CommonUtil";
import { BattleManger } from "../BattleManger";
import { BattleSkill } from "./BattleSkill";
import { BattleSkillManager } from "./BattleSkillManager";

export class BattleSkillSpecial extends Component {
    get battleSkill() {
        return this.node.getComponent(BattleSkill);
    }

    curTween: Tween<UIOpacity>
      
    playLaser(localPos: Vec3, targetPos: Vec3) {
        let dis = Vec3.distance(localPos, targetPos);
        let angle = CommonUtil.calcAngle(localPos, targetPos);

        this.node.setPosition(localPos);
        // let startNode = this.battleSkill.skillNode.getChildByName("start");
        let lineNode = this.battleSkill.skillNode.getChildByName("line");
        let endNode = this.battleSkill.skillNode.getChildByName("end");

        let scale = dis / lineNode.getComponent(UITransform).contentSize.height;
        lineNode.setScale(v3(1, scale, 1));
        lineNode.angle = angle;

        let pos = this.node.parent.getComponent(UITransform).convertToWorldSpaceAR(targetPos);
        endNode.setWorldPosition(pos);

        if (this.curTween)
            this.curTween.stop();
        let uio = this.node.getComponent(UIOpacity) || this.node.addComponent(UIOpacity);
        uio.opacity = 255;
        this.curTween = tween(uio)
            .to(0.5, { opacity: 0 })
            .call(this.delSkill.bind(this))
            .start();
    }

      
    playBomberballoon(localPos: Vec3, targetPos: Vec3) {
        let sound = this.battleSkill.skillInfo.sound;

        this.node.setPosition(localPos);
        let atk = this.battleSkill.skillNode.getChildByName('atk');
        let fly = this.battleSkill.skillNode.getChildByName('fly');
        let hit = this.battleSkill.skillNode.getChildByName('hit');
        let boom = this.battleSkill.skillNode.getChildByName('boom');
        atk.active = false;
        fly.active = false;
        hit.active = false;
        boom.active = false;
        tween(atk)
            .call(() => {
                if (sound?.atk_res)
                    this.playEffect(sound.atk_res, sound.atk_volume)
                atk.active = true;
                let sk = atk.getComponent(sp.Skeleton);
                sk.setAnimation(0, sk.animation, true);
            })
            .delay(0.1)
            .call(() => {
                if (sound?.fly_res)
                    this.playEffect(sound.fly_res, sound.fly_volume)
                atk.active = false;
                fly.active = true;
                let sk = fly.getComponent(sp.Skeleton);
                sk.setAnimation(0, sk.animation, true);
                tween(this.node)
                    .by(1.5, { position: v3(0, -80, 0) }, { easing: easing.bounceOut })
                    .start();
            })
            .delay(1.5)
            .call(() => {
                fly.active = false;
                hit.active = true;
                let sk = hit.getComponent(sp.Skeleton);
                sk.setAnimation(0, sk.animation, false);
                sk.setCompleteListener(() => {
                    if (sound?.hit_res)
                        this.playEffect(sound.hit_res, sound.hit_volume)

                    hit.active = false;
                    boom.active = true;
                    let sk = boom.getComponent(sp.Skeleton);
                    sk.setAnimation(0, sk.animation, false);
                    sk.setCompleteListener(() => {
                        this.delSkill();
                    })
                })
            })
            .start();
    }

    delSkill() {
        this.scheduleOnce(() => {
            BattleSkillManager.getInstance().deleteSkill(this.battleSkill.skillId);
        }, 0)
    }

    playEffect(res: string, volumeScale: number) {
        if (BattleManger.getInstance().gameState == core.BattleState.BattleSettle) return;
        if (res)
            BattleManger.getInstance().Battle.battleAudio.playSkill(res, volumeScale);
    }
}