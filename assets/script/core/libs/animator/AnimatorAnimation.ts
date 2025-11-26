import { Animation, AnimationState, _decorator } from "cc";
import AnimatorBase, { AnimationPlayer } from "./core/AnimatorBase";
import { AnimatorStateLogic } from "./core/AnimatorStateLogic";

const { ccclass, property, requireComponent, disallowMultiple, menu } = _decorator;

/** 
 * Cocos Animation          
 */
@ccclass
@disallowMultiple
@requireComponent(Animation)
@menu('animator/AnimatorAnimation')
export default class AnimatorAnimation extends AnimatorBase {
      
    protected _animation: Animation = null!;
      
    protected _animState: AnimationState = null!;
      
    protected _wrapModeMap: Map<AnimationState, number> = new Map();

    protected start() {
        if (!this.PlayOnStart || this._hasInit) {
            return;
        }
        this._hasInit = true;

        this._animation = this.getComponent(Animation)!;
        this._animation.on(Animation.EventType.FINISHED, this.onAnimFinished, this);
        this._animation.on(Animation.EventType.LASTFRAME, this.onAnimFinished, this);

        if (this.AssetRawUrl !== null) {
            this.initJson(this.AssetRawUrl.json);
        }
    }

    /**
     *                 ，      0-3      ，        
     * - onStateChangeCall                 
     * - stateLogicMap                 
     * - animationPlayer               
     * @override
     */
    public onInit(...args: Array<Map<string, AnimatorStateLogic> | ((fromState: string, toState: string) => void) | AnimationPlayer>) {
        if (this.PlayOnStart || this._hasInit) {
            return;
        }
        this._hasInit = true;

        this.initArgs(...args);

        this._animation = this.getComponent(Animation)!;
        this._animation.on(Animation.EventType.FINISHED, this.onAnimFinished, this);
        this._animation.on(Animation.EventType.LASTFRAME, this.onAnimFinished, this);

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
        if (!animName) {
            return;
        }

        this._animation.play(animName);
        this._animState = this._animation.getState(animName);
        if (!this._animState) {
            return;
        }
        if (!this._wrapModeMap.has(this._animState)) {
            this._wrapModeMap.set(this._animState, this._animState.wrapMode);
        }
        this._animState.wrapMode = loop ? 2 : this._wrapModeMap.get(this._animState)!;
    }

    /**
     *                 
     * @override
     * @param scale         
     */
    protected scaleTime(scale: number) {
        if (this._animState) {
            this._animState.speed = scale;
        }
    }
}
