/*
 * @Author: dgflash
 * @Date: 2021-10-12 14:11:04
 * @LastEditors: dgflash
 * @LastEditTime: 2022-04-08 15:42:16
 */

import { Component, sp, _decorator } from 'cc';
import { resLoader } from '../../../common/loader/ResLoader';
const { ccclass, property } = _decorator;

  
@ccclass('SpineFinishedRelease')
export class SpineFinishedRelease extends Component {
    @property
    isDestroy: boolean = true;

    private spine!: sp.Skeleton;
    private resPath: string = null!;

      
    setResPath(path: string) {
        this.resPath = path;
    }

    onLoad() {
        this.spine = this.getComponent(sp.Skeleton)!;
        this.spine.setCompleteListener(this.onSpineComplete.bind(this));

        if (this.resPath) {
            resLoader.load(this.resPath, sp.SkeletonData, (err: Error | null, sd: sp.SkeletonData) => {
                if (err) {
                    console.error(`${this.resPath}`);
                    return;
                }

                this.spine.skeletonData = sd;
                this.spine.setAnimation(0, "animation", false);
            });
        }
        else {
            this.spine.setAnimation(0, "animation", false);
        }
    }

    private onSpineComplete() {
        if (this.isDestroy) {
            this.node.destroy();
        }
        else {
            this.node.removeFromParent();
        }
    }
}
