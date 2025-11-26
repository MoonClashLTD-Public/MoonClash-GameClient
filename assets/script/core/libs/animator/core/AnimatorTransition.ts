import AnimatorCondition, { ParamType } from "./AnimatorCondition";
import AnimatorController from "./AnimatorController";

/**
   
 */
export default class AnimatorTransition {
    private _toStateName: string = '';
    private _hasExitTime: boolean = false;
    private _conditions: AnimatorCondition[] = [];
    private _ac: AnimatorController = null!;

    constructor(data: any, ac: AnimatorController) {
        this._toStateName = data.toState;
        this._hasExitTime = data.hasExitTime;
        this._ac = ac;
        for (let i = 0; i < data.conditions.length; i++) {
            let condition: AnimatorCondition = new AnimatorCondition(data.conditions[i], ac);
            this._conditions.push(condition);
        }
    }

    /**
       
     */
    public isValid(): boolean {
        return this._hasExitTime || this._conditions.length > 0;
    }

    /**
       
     */
    public check(): boolean {
        if (this._toStateName === this._ac.curState.name) {
            return false;
        }

        if (this._hasExitTime && (this._ac.curState !== this._ac.animCompleteState || !this._ac.animComplete)) {
            return false;
        }

        for (let i = 0; i < this._conditions.length; i++) {
            if (!this._conditions[i].check()) {
                return false;
            }
        }
        return true;
    }

    /**
       
     */
    public doTrans() {
          
        if (this._hasExitTime) {
            this._ac.animComplete = false;
        }
          
        for (let i = 0; i < this._conditions.length; i++) {
            let type = this._conditions[i].getParamType();
            let name = this._conditions[i].getParamName();
            if (type === ParamType.TRIGGER) {
                this._ac.params.resetTrigger(name);
            } else if (type === ParamType.AUTO_TRIGGER) {
                this._ac.params.resetAutoTrigger(name);
            }
        }

        this._ac.changeState(this._toStateName);
    }
}
