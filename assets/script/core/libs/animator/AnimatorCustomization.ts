import { _decorator } from "cc";
import AnimatorBase, { AnimationPlayer } from "./core/AnimatorBase";
import { AnimatorStateLogic } from "./core/AnimatorStateLogic";

const { ccclass, property, menu, disallowMultiple } = _decorator;

/** 
 *                           
 */
@ccclass
@disallowMultiple
@menu('animator/AnimatorCustomization')
export default class AnimatorCustomization extends AnimatorBase {
      
    @property({ override: true, visible: false })
    protected PlayOnStart: boolean = false;

    /**
     *                 ，      0-3      ，        
     * - onStateChangeCall                 
     * - stateLogicMap                 
     * - animationPlayer               
     * @override
     */
    public onInit(...args: Array<Map<string, AnimatorStateLogic> | ((fromState: string, toState: string) => void) | AnimationPlayer>) {
        if (this._hasInit) {
            return;
        }
        this._hasInit = true;

        this.initArgs(...args);

        if (this.AssetRawUrl !== null) {
            this.initJson(this.AssetRawUrl.json);
        }
    }

    /**
     *         
     * @override
     * @param animName       
     * @param loop             
     */
    protected playAnimation(animName: string, loop: boolean) {
        if (this._animationPlayer && animName) {
            this._animationPlayer.playAnimation(animName, loop);
        }
    }

    /**
     *                 
     * @override
     * @param scale         
     */
    protected scaleTime(scale: number) {
        if (this._animationPlayer) {
            this._animationPlayer.scaleTime(scale);
        }
    }
}
