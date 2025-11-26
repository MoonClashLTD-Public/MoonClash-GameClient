import { sp, _decorator } from "cc";
import AnimatorSpine from "./AnimatorSpine";
import AnimatorBase, { AnimationPlayer } from "./core/AnimatorBase";
import { AnimatorStateLogic } from "./core/AnimatorStateLogic";

const { ccclass, property, requireComponent } = _decorator;

/** 
 * Spine          （        ），                  ，          track          ，trackIndex        0
 */
@ccclass
@requireComponent(sp.Skeleton)
export default class AnimatorSpineSecondary extends AnimatorBase {
    @property({ tooltip: '' }) TrackIndex: number = 1;

      
    private _main: AnimatorSpine = null!;
      
    private _spine: sp.Skeleton = null!;

    protected start() {
        if (!this.PlayOnStart || this._hasInit) {
            return;
        }
        this._hasInit = true;

        this._spine = this.getComponent(sp.Skeleton)!;
        this._main = this.getComponent(AnimatorSpine)!;
        this._main.addSecondaryListener(this.onAnimFinished, this);

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

        this._spine = this.getComponent(sp.Skeleton)!;
        this._main = this.getComponent(AnimatorSpine)!;
        this._main.addSecondaryListener(this.onAnimFinished, this);

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
        if (animName) {
            this._spine.setAnimation(this.TrackIndex, animName, loop);
        }
        else {
            this._spine.clearTrack(this.TrackIndex);
        }
    }
}
