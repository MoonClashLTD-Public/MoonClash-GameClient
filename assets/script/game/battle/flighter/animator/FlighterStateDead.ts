import { AnimatorStateLogic } from "../../../../core/libs/animator/core/AnimatorStateLogic";
import { Flighter } from "../Flighter";
import { AnimationEventHandler } from "./AnimationEventHandler";

  
export class FlighterStateDead extends AnimatorStateLogic {
    private flighter: Flighter;
    private anim: AnimationEventHandler;

    public constructor(flighter: Flighter, anim: AnimationEventHandler) {
        super();
        this.flighter = flighter;
        this.anim = anim;
        this.anim.addFrameEvent("dead", this.onDead, this);
    }

    private onDead() {
        var onHitActionComplete = this.flighter.animator.onHitActionComplete;
        onHitActionComplete && onHitActionComplete();
    }

    public onEntry() {

    }

    public onUpdate() {

    }

    public onExit() {

    }
}

