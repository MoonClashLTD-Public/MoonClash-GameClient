/*
 * @Author: dgflash
 * @Date: 2021-08-11 16:41:12
 * @LastEditors: dgflash
 * @LastEditTime: 2022-04-07 17:25:04
 */

import { Component, _decorator } from 'cc';
import { EffectSingleCase } from './EffectSingleCase';
const { ccclass, property } = _decorator;

/**
   
   
 */
@ccclass('EffectDelayRelease')
export class EffectDelayRelease extends Component {
      
    @property
    public delay: number = 1;

    start() {
        this.scheduleOnce(this.onDelay, this.delay);
    }

    private onDelay() {
        EffectSingleCase.instance.put(this.node);
    }
}
