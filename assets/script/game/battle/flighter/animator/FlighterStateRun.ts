/*
 * @Author: dgflash
 * @Date: 2021-09-01 15:19:04
 * @LastEditors: dgflash
 * @LastEditTime: 2022-01-25 09:53:51
 */
import { AnimatorStateLogic } from "../../../../core/libs/animator/core/AnimatorStateLogic";
import { Flighter } from "../Flighter";
import { AnimationEventHandler } from "./AnimationEventHandler";

  
export class FlighterStateRun extends AnimatorStateLogic {
    private flighter: Flighter;
    private anim: AnimationEventHandler;

    public constructor(flighter: Flighter, anim: AnimationEventHandler) {
        super();
        this.flighter = flighter;
        this.anim = anim;
        this.anim.addFrameEvent("run", this.onRun, this);
    }

    private onRun() {
        var onRunComplete = this.flighter.animator.onRunComplete;
        onRunComplete && onRunComplete();
    }

    public onEntry() {
        // this.flighter.animator.scheduleOnce(() => {
        //     this.flighter.animator.play(FlighterAnimatorType.Idle);
        // }, 5);
    }

    public onUpdate() {

    }

    public onExit() {

    }
}

