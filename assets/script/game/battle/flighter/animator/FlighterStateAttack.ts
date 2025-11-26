/*
 * @Author: dgflash
 * @Date: 2021-09-01 15:19:04
 * @LastEditors: dgflash
 * @LastEditTime: 2022-01-25 09:53:51
 */
import { AnimatorStateLogic } from "../../../../core/libs/animator/core/AnimatorStateLogic";
import { Flighter } from "../Flighter";
import { AnimationEventHandler } from "./AnimationEventHandler";

  
export class FlighterStateAttack extends AnimatorStateLogic {
    private flighter: Flighter;
    private anim: AnimationEventHandler;

    public constructor(flighter: Flighter, anim: AnimationEventHandler) {
        super();
        this.flighter = flighter;
        this.anim = anim;
        this.anim.addFrameEvent("attack", this.onAttack, this);
    }

    private onAttack() {
        var onAttackComplete = this.flighter.animator.onAttackComplete;
        onAttackComplete && onAttackComplete();
    }

    public onEntry() {

    }

    public onUpdate() {

    }

    public onExit() {

    }
}

