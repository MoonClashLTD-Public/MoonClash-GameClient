import { error } from "cc";
import AnimatorBase from "./AnimatorBase";
import AnimatorParams from "./AnimatorParams";
import AnimatorState from "./AnimatorState";

/**
 *             
 */
export default class AnimatorController {
    private _jsonData: any = null;
    private _animator: AnimatorBase = null!;

    private _params: AnimatorParams = null!;
    private _states: Map<string, AnimatorState> = null!;
    private _anyState: AnimatorState = null!;
    private _curState: AnimatorState = null!;

      
    private _changeCount: number = 0;
      
    public animCompleteState: AnimatorState = null!;
      
    public animComplete: boolean = false;
      
    public get curState(): AnimatorState { return this._curState; }
    public get params(): AnimatorParams { return this._params; }
    public get states(): Map<string, AnimatorState> { return this._states }

    constructor(player: AnimatorBase, json: any) {
        this._animator = player;
        this._jsonData = json;
        this._states = new Map<string, AnimatorState>();
        this._params = new AnimatorParams(json.parameters);
        this.init(json);
    }

    /**
     *                         
     */
    private init(json: any) {
        if (json.states.length <= 0) {
            error(`[AnimatorController.init]       json    `);
            return;
        }

        let defaultState: string = json.defaultState;
        this._anyState = new AnimatorState(json.anyState, this);
        for (let i = 0; i < json.states.length; i++) {
            let state: AnimatorState = new AnimatorState(json.states[i], this);
            this._states.set(state.name, state);
        }
        this.changeState(defaultState);
    }

    private updateState() {
        this._curState.checkAndTrans();
        if (this._curState !== this._anyState && this._anyState !== null) {
            this._anyState.checkAndTrans();
        }
    }

    /**
     *               
     */
    public updateAnimator() {
          
        this._changeCount = 0;

        this.updateState();

          
        if (this.animComplete && this.animCompleteState.loop) {
            this.animComplete = false;
        }
          
        this.params.resetAllAutoTrigger();
    }

    public onAnimationComplete() {
        this.animComplete = true;
        this.animCompleteState = this._curState;
        // cc.log(`animation complete: ${this._curState.name}`);
    }

    /**
     *                     
     * @param       
     */
    public play(stateName: string) {
        if (!this._states.has(stateName) || this._curState.name === stateName) {
            return;
        }

          
        this.animComplete = false;
        this.changeState(stateName);
    }

    /**
     *             
     */
    public changeState(stateName: string) {
        this._changeCount++;
        if (this._changeCount > 1000) {
            error('[AnimatorController.changeState] error:                     1000  ，transition            !');
            return;
        }

        if (this._states.has(stateName) && (this._curState === null || this._curState.name !== stateName)) {
            let oldState = this._curState;
            this._curState = this._states.get(stateName)!;

            this._animator.onStateChange(oldState, this._curState);

            this.updateState();
        }
        else {
            error(`[AnimatorController.changeState] error state: ${stateName}`);
        }
    }
}
