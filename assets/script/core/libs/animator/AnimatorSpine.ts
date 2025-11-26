import { sp, _decorator } from "cc";
import AnimatorSpineSecondary from "./AnimatorSpineSecondary";
import AnimatorBase, { AnimationPlayer } from "./core/AnimatorBase";
import { AnimatorStateLogic } from "./core/AnimatorStateLogic";

const { ccclass, property, requireComponent, disallowMultiple } = _decorator;

/** 
  
 */
@ccclass
@disallowMultiple
@requireComponent(sp.Skeleton)
export default class AnimatorSpine extends AnimatorBase {
      
    protected _spine: sp.Skeleton = null!;
      
    protected _completeListenerMap: Map<(entry?: any) => void, any> = new Map();
      
    protected _secondaryListenerMap: Map<(entry?: any) => void, AnimatorSpineSecondary> = new Map();

    protected start() {
        if (!this.PlayOnStart || this._hasInit) {
            return;
        }
        this._hasInit = true;

        this._spine = this.getComponent(sp.Skeleton)!;
        this._spine.setEventListener(this.onSpineEvent.bind(this));
        this._spine.setCompleteListener(this.onSpineComplete.bind(this));

        if (this.AssetRawUrl !== null) {
            this.initJson(this.AssetRawUrl.json);
        }
    }

    /**
       
  
  
  
     * @override
     */
    public onInit(...args: Array<Map<string, AnimatorStateLogic> | ((fromState: string, toState: string) => void) | AnimationPlayer>) {
        if (this.PlayOnStart || this._hasInit) {
            return;
        }
        this._hasInit = true;

        this.initArgs(...args);

        this._spine = this.getComponent(sp.Skeleton)!;
        this._spine.setEventListener(this.onSpineEvent.bind(this));
        this._spine.setCompleteListener(this.onSpineComplete.bind(this));

        if (this.AssetRawUrl !== null) {
            this.initJson(this.AssetRawUrl.json);
        }
    }

      

    public getBone(name: string): any {
        var bone = this._spine.findBone(name);
        return bone
    }

    private onSpineEvent(trackEntry: any, event: any) {
        var animationName = trackEntry.animation ? event.data.name : "";
        this._animationPlayer?.onFrameEventCallback(animationName, this);
    }

      

    private onSpineComplete(entry: any) {
        entry.trackIndex === 0 && this.onAnimFinished();
        this._completeListenerMap.forEach((target, cb) => { target ? cb.call(target, entry) : cb(entry); });
        this._secondaryListenerMap.forEach((target, cb) => { entry.trackIndex === target.TrackIndex && cb.call(target, entry); });
    }

    /**
       
     * @override
  
  
     */
    protected playAnimation(animName: string, loop: boolean) {
        if (animName) {
            this._spine.setAnimation(0, animName, loop);
        }
        else {
            this._spine.clearTrack(0);
        }
    }

    /**
       
     * @override
  
     */
    protected scaleTime(scale: number) {
        if (scale > 0)
            this._spine.timeScale = scale;
    }

    /**
       
     */
    public addSecondaryListener(cb: (entry?: any) => void, target: AnimatorSpineSecondary) {
        this._secondaryListenerMap.set(cb, target);
    }

    /**
       
  
  
     */
    public addCompleteListener(cb: (entry?: any) => void, target: any = null) {
        if (this._completeListenerMap.has(cb)) {
            return;
        }
        this._completeListenerMap.set(cb, target);
    }

    /**
       
  
     */
    public removeCompleteListener(cb: (entry?: any) => void) {
        this._completeListenerMap.delete(cb);
    }

    /**
       
     */
    public clearCompleteListener() {
        this._completeListenerMap.clear;
    }
}
