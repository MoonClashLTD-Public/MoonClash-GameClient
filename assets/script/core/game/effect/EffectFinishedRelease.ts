/*
 * @Author: dgflash
 * @Date: 2021-12-30 19:16:47
 * @LastEditors: dgflash
 * @LastEditTime: 2022-04-07 17:08:44
 */

import { Animation, Component, _decorator } from 'cc';
import { EffectSingleCase } from './EffectSingleCase';
const { ccclass, property } = _decorator;

@ccclass('EffectFinishedRelease')
  
export class EffectFinishedRelease extends Component {
    @property({ type: Animation, tooltip: '' })
    anim: Animation = null!;
 
    onLoad() {
        this.anim.on(Animation.EventType.FINISHED, this.onFinished, this);
        this.anim.on(Animation.EventType.LASTFRAME, this.onFinished, this);
    }

    start() {
        this.anim.play();
    }

    private onFinished() {
        EffectSingleCase.instance.put(this.node);
    }
}
