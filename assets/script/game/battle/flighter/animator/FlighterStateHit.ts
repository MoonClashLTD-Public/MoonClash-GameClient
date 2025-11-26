/*
 * @Author: dgflash
 * @Date: 2021-09-01 15:19:04
 * @LastEditors: dgflash
 * @LastEditTime: 2022-01-25 09:45:20
 */
import { AnimatorStateLogic } from "../../../../core/libs/animator/core/AnimatorStateLogic";
import { Flighter } from "../Flighter";
import { AnimationEventHandler } from "./AnimationEventHandler";

  
export class FlighterStateHit extends AnimatorStateLogic {
    private flighter: Flighter;
    private anim: AnimationEventHandler;

    public constructor(flighter: Flighter, anim: AnimationEventHandler) {
        super();
        this.flighter = flighter;
        this.anim = anim;
    }


    public onEntry() {

    }

    public onUpdate() {

    }

    public onExit() {
        var onHitActionComplete = this.flighter.animator.onHitActionComplete;
        onHitActionComplete && onHitActionComplete();
    }
}

