import { Animation, js, JsonAsset, _decorator } from "cc";
import AnimatorAnimation from "../../../core/libs/animator/AnimatorAnimation";
import { AnimatorStateLogic } from "../../../core/libs/animator/core/AnimatorStateLogic";
import { AnimationEventHandler } from "./animator/AnimationEventHandler";
import { FlighterStateAttack } from "./animator/FlighterStateAttack";
import { FlighterStateDead } from "./animator/FlighterStateDead";
import { FlighterStateHit } from "./animator/FlighterStateHit";
import { FlighterStateRun } from "./animator/FlighterStateRun";
import { Flighter } from "./Flighter";

const { ccclass, property, requireComponent, disallowMultiple } = _decorator;

/** 
   
  
  
  
 */

export enum FlighterAnimatorType {
      
    Idle = "Idle",
      
    Attack = "Attack",
      
    Hurt = "Hurt",
      
    Dead = "Dead",
      
    Run = "Run"
}

@ccclass("FlighterViewAnimator")
@disallowMultiple
export class FlighterViewAnimator extends AnimatorAnimation {
      
    onRunComplete: Function = null!;
      
    onAttackComplete: Function = null!;
      
    onHitActionComplete: Function = null!;
      
    flighter: Flighter = null!;

      
    private weaponAnimName: string = null!;

    init(flighter: Flighter, json: JsonAsset) {
        this.AssetRawUrl = json;

        this.flighter = flighter;
          
        let anim = new AnimationEventHandler();
        let asl: Map<string, AnimatorStateLogic> = new Map();
        asl.set(FlighterAnimatorType.Run, new FlighterStateRun(this.flighter, anim));
        asl.set(FlighterAnimatorType.Attack, new FlighterStateAttack(this.flighter, anim));
        asl.set(FlighterAnimatorType.Hurt, new FlighterStateHit(this.flighter, anim));
        asl.set(FlighterAnimatorType.Dead, new FlighterStateDead(this.flighter, anim));
        this.initArgs(asl, anim);
    }
      
    // left() {
    //     this.node.parent!.setScale(1, 1, 1);
    // }

      
    // right() {
    //     this.node.parent!.setScale(-1, 1, 1);
    // }

      
    // refresh() {
      
    //     this.onStateChange(this._ac.curState, this._ac.curState);
    // }

    /**
       
     * @override
  
  
     */
    protected playAnimation(animName: string, loop: boolean) {
        if (animName == FlighterAnimatorType.Idle) {
            animName = "idle" + this.flighter.dir;
        } else if (animName == FlighterAnimatorType.Attack) {
            animName = "attack" + this.flighter.dir;
        } else if (animName == FlighterAnimatorType.Run) {
            animName = "run" + this.flighter.dir;
        }
        super.playAnimation(animName, loop);
    }

      
    // private getWeaponAnimName() {
    //     var job = this.role.RoleModelJob;
    //     var weaponAnimName = WeaponName[job.weaponType[0]];
    //     return weaponAnimName;
    // }
}