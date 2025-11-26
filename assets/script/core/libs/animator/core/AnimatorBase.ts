import { Component, JsonAsset, _decorator } from 'cc';
import AnimatorController from "./AnimatorController";
import AnimatorState from "./AnimatorState";
import { AnimatorStateLogic } from './AnimatorStateLogic';

const { ccclass, property, executionOrder, menu } = _decorator;

/**
 *             
 */
export interface AnimationPlayer {
      
    onFinishedCallback(target: AnimatorBase): void;
      
    onFrameEventCallback(type: string, target: AnimatorBase): void
      
    playAnimation(animName: string, loop: boolean): void;
      
    scaleTime(scale: number): void;
}

/**
 *                 
 */
@ccclass
@executionOrder(-1000)
@menu('animator/AnimatorBase')
export default class AnimatorBase extends Component {
      

      
    private onFrameEvent(param: string) {
        this._animationPlayer?.onFrameEventCallback(param, this);
    }

      

    @property({ type: JsonAsset, tooltip: '' })
    protected AssetRawUrl: JsonAsset = null!;

    @property({ tooltip: '' })
    protected PlayOnStart: boolean = true;

    @property({ tooltip: '' })
    protected AutoUpdate: boolean = true;

      
    protected _hasInit: boolean = false;
      
    protected _ac: AnimatorController = null!;

      
    protected _stateLogicMap: Map<string, AnimatorStateLogic> = null!;
      
    protected _onStateChangeCall: (fromState: string, toState: string) => void = null!;
      
    protected _animationPlayer: AnimationPlayer = null!;

      
    public get curStateName(): string {
        return this._ac.curState.name;
    }
      
    public get curStateMotion(): string {
        return this._ac.curState.motion;
    }

      
    public getState(name: string): AnimatorState | undefined {
        return this._ac.states.get(name);
    }

    /**
     *         ，   0-3   ，    
     * - onStateChangeCall         
     * - stateLogicMap         
     * - animationPlayer        
     * @virtual
     */
    public onInit(...args: Array<Map<string, AnimatorStateLogic> | ((fromState: string, toState: string) => void) | AnimationPlayer>) {
    }

    /**
     *        
     */
    protected initArgs(...args: Array<Map<string, AnimatorStateLogic> | ((fromState: string, toState: string) => void) | AnimationPlayer>) {
        args.forEach((arg) => {
            if (!arg) {
                return;
            }
            if (typeof arg === 'function') {
                this._onStateChangeCall = arg;
            }
            else if (typeof arg === 'object') {
                if (arg instanceof Map) {
                    this._stateLogicMap = arg;
                }
                else {
                    this._animationPlayer = arg;
                }
            }
        });
    }

    private updateAnimator() {
          
        let playSpeed = this._ac.curState.speed;
        if (this._ac.curState.multi) {
            playSpeed *= this._ac.params.getNumber(this._ac.curState.multi) || 1;
        }
        this.scaleTime(playSpeed);

          
        if (this._stateLogicMap) {
            let curLogic = this._stateLogicMap.get(this._ac.curState.name);
            curLogic && curLogic.onUpdate();
        }

          
        this._ac.updateAnimator();
    }

    protected update() {
        if (this._hasInit && this.AutoUpdate) {
            this.updateAnimator();
        }
    }

    /**
     *       
     */
    public manualUpdate() {
        if (this._hasInit && !this.AutoUpdate) {
            this.updateAnimator();
        }
    }

    /**
     *      json  
     */
    protected initJson(json: any) {
        this._ac = new AnimatorController(this, json);
    }

    /**
     *        
     */
    protected onAnimFinished() {
        this._ac.onAnimationComplete();
        this._animationPlayer?.onFinishedCallback(this);
    }

    /**
     *     
     * @virtual
     * @param animName    
     * @param loop       
     */
    protected playAnimation(animName: string, loop: boolean) {
    }

    /**
     *         
     * @virtual
     * @param scale     
     */
    protected scaleTime(scale: number) {
    }

    /** 
     *         （       ，         ）
     */
    public onStateChange(fromState: AnimatorState, toState: AnimatorState) {
        this.playAnimation(toState.motion, toState.loop);

        let fromStateName = fromState ? fromState.name : '';

        if (this._stateLogicMap) {
            let fromLogic = this._stateLogicMap.get(fromStateName);
            fromLogic && fromLogic.onExit();
            let toLogic = this._stateLogicMap.get(toState.name);
            toLogic && toLogic.onEntry();
        }

        this._onStateChangeCall && this._onStateChangeCall(fromStateName, toState.name);
    }

    /**
     *   boolean      
     */
    public setBool(key: string, value: boolean) {
        this._ac.params.setBool(key, value);
    }

    /**
     *   boolean      
     */
    public getBool(key: string): boolean {
        return this._ac.params.getBool(key) !== 0;
    }

    /**
     *   number      
     */
    public setNumber(key: string, value: number) {
        this._ac.params.setNumber(key, value);
    }

    /**
     *   number      
     */
    public getNumber(key: string): number {
        return this._ac.params.getNumber(key);
    }

    /**
     *   trigger      
     */
    public setTrigger(key: string) {
        this._ac.params.setTrigger(key);
    }

    /**
     *   trigger      
     */
    public resetTrigger(key: string) {
        this._ac.params.resetTrigger(key);
    }

    /**
     *   autoTrigger      （autoTrigger         reset，             reset）
     */
    public autoTrigger(key: string) {
        this._ac.params.autoTrigger(key);
    }

    /**
     *           
     * @param    
     */
    public play(stateName: string) {
        if (!this._hasInit) {
            return;
        }
        this._ac.play(stateName);
    }
}
