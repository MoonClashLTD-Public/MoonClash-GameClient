import { _decorator, Component, Animation, AnimationClip, v3, AnimationState } from 'cc';
import { Logger } from '../../../core/common/log/Logger';
import { BattleManger } from '../BattleManger';
import { FlighterAnimType } from '../utils/BattleEnum';
import { Flighter } from './Flighter';
const { ccclass, property } = _decorator;

@ccclass('FlighterAnim')
export class FlighterAnim extends Component {
    flighter: Flighter;
    curAnimType: string = '';   

    start() {
    }

    update(deltaTime: number) {
    }

    init(f: Flighter) {
        this.flighter = f;
        this.curAnimType = '';
        this.isPlay = false;

        let anim = this.flighter.roleAnimation;
        anim.on(Animation.EventType.FINISHED, this.onAnimFinished, this);
    }

    onDestroy() {
        let anim = this.flighter?.roleAnimation;
        if (anim)
            anim.off(Animation.EventType.FINISHED, this.onAnimFinished, this);
    }

    onAnimFinished() {
        this.isPlay = false;
        let isKing = this.flighter.fGo.props.GetValue(core.PropType.PropTypeTowerType).i32 == core.TowerType.TowerTypeKing;
        if (isKing && this.curAnimType == FlighterAnimType.IDLE && this.curAnimType == this.flighter.flighterAnimName) {
              
        } else {
            // this.playDirAnim();
        }
    }

    setAngle(angle: number) {
        let _angle = Math.abs(angle)
        let _sign = Math.sign(angle)

        let dir = 0;
        if (_angle <= 11.25) { // 0
            dir = 8;
        } else if (_angle <= 33.75) { // 1
            dir = 7;
        } else if (_angle <= 56.25) { // 2
            dir = 6;
        } else if (_angle <= 78.75) { // 3
            dir = 5;
        } else if (_angle <= 101.25) { // 4
            dir = 4;
        } else if (_angle <= 123.75) { // 5
            dir = 3;
        } else if (_angle <= 146.25) { // 6
            dir = 2;
        } else if (_angle <= 168.75) { // 7
            dir = 1;
        } else {                       // 8
            dir = 0;
        }

        dir = 8 - dir;

        // this.flighter.dir = dir;
        // this.flighter.sign = _sign > 0 ? 1 : -1;
        // this.playDirAnim();
    }
    defSpeed: { [key: string]: number } = {}
    isPlay: boolean = false;
    currState: AnimationState

    /**
     * 
  
     * @returns 
     */
    playDirAnim(forceAnim: boolean = false) {
        // if (this.isPlay && forceAnim == false) return;

        let dir = this.flighter.dir;
        let sign = this.flighter.sign;
        let animType = this.flighter.flighterAnimName;

        this.curAnimType = animType;

        let animation = this.flighter.roleAnimation;
        // this.isPlay = true;

        // animation.crossFade(animType + dir, 0.1);
        let animationState = animation.getState(animType + dir);
        if (animationState) {
            if (!this.defSpeed[animationState.name])
                this.defSpeed[animationState.name] = animationState.speed;
            animationState.speed = this.defSpeed[animationState.name] * this.flighter.animSpeed;
            this.currState = animationState;
            animation.play(animationState.name);
            // this.flighter.roleSpr.spriteFrame.flipUVX = sign == -1;
            let spr = this.flighter.roleSpr.node;
            let s = spr.getScale();
            s.x = sign * Math.abs(s.x);
            spr.setScale(s);
            this.flighter.atkPoint.setScale(v3(s.x, 1, 1));
            this.flighter.dmgPoint.setScale(v3(s.x, 1, 1));
        } else {
            let protoId = this.flighter.fGo.props.GetValue(core.PropType.PropTypeProtoId).i32;
            Logger.erroring(`hero protoId ${protoId} not animationState  ${animType} ${dir}`);
        }

    }
}

