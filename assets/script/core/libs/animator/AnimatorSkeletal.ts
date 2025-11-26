/*
 * @Author: dgflash
 * @Date: 2021-06-30 13:56:26
 * @LastEditors: dgflash
 * @LastEditTime: 2022-06-22 09:29:52
 */

import { AnimationClip, CCFloat, game, SkeletalAnimation, _decorator } from 'cc';
import AnimatorAnimation from './AnimatorAnimation';

const { ccclass, property, requireComponent, disallowMultiple, menu } = _decorator;

@ccclass
@disallowMultiple
@requireComponent(SkeletalAnimation)
@menu('animator/AnimatorSkeletal')
export class AnimatorSkeletal extends AnimatorAnimation {
    @property({
        type: CCFloat,
        tooltip: ""
    })
    private duration: number = 0.3;

    private cross_duration: number = 0;           
    private current_time: number = 0;             

    onLoad() {
        this.cross_duration = this.duration * 1000;
    }

    /**
        
      * @override
  
  
      */
    protected playAnimation(animName: string, loop: boolean) {
        if (!animName) {
            return;
        }

        if (game.totalTime - this.current_time > this.cross_duration) {
            this._animation.crossFade(animName, this.duration);
        }
        else {
            this._animation.play(animName);
        }
        this.current_time = game.totalTime;

        this._animState = this._animation.getState(animName);
        if (!this._animState) {
            return;
        }
        if (!this._wrapModeMap.has(this._animState)) {
            this._wrapModeMap.set(this._animState, this._animState.wrapMode);
        }
        // this._animState.wrapMode = loop ? 2 : this._wrapModeMap.get(this._animState)!;
        this._animState.wrapMode = loop ? AnimationClip.WrapMode.Loop : AnimationClip.WrapMode.Normal;     
    }
}
