import { Enum, _decorator } from 'cc';
import VMBase from './VMBase';

const { ccclass, property, menu, help } = _decorator;

  
enum CLAMP_MODE {
    MIN,
    MAX,
    MIN_MAX,
}

/**
 * [VM-Modify]
   
   
 */
@ccclass
@menu('ModelViewer/VM-Modify()')
@help('https://github.com/wsssheep/cocos_creator_mvvm_tools/blob/master/docs/VMModify.md')
export default class VMModify extends VMBase {
    @property({
        tooltip: ""
    })
    watchPath: string = "";

    @property({
        tooltip: ""
    })
    valueClamp: boolean = false;

    @property({
        type: Enum(CLAMP_MODE),
        visible: function () { return this.valueClamp === true }
    })
    valueClampMode: CLAMP_MODE = CLAMP_MODE.MIN_MAX;

    @property({
        visible: function () { return this.valueClamp === true && this.valueClampMode !== CLAMP_MODE.MAX }
    })
    valueMin: number = 0;

    @property({
        visible: function () { return this.valueClamp === true && this.valueClampMode !== CLAMP_MODE.MIN }
    })
    valueMax: number = 1;

      
    private clampValue(res: number): number {
        let min = this.valueMin;
        let max = this.valueMax;
        if (this.valueClamp == false) return res;
        switch (this.valueClampMode) {
            case CLAMP_MODE.MIN_MAX:
                if (res > max) res = max;
                if (res < min) res = min;
                break;
            case CLAMP_MODE.MIN:
                if (res < min) res = min;
                break;
            case CLAMP_MODE.MAX:
                if (res > max) res = max;
                break;
            default:
                break;
        }

        return res;
    }

      
    vAddInt(e: Event, data: string) {
        this.vAdd(e, data, true);
    }

      
    vSubInt(e: Event, data: string) {
        this.vSub(e, data, true);
    }

      
    vMulInt(e: Event, data: string) {
        this.vMul(e, data, true);
    }

      
    vDivInt(e: Event, data: string) {
        this.vDiv(e, data, true);
    }

      
    vAdd(e: Event, data: string, int: boolean = false) {
        let a = parseFloat(data);
        let res = this.VM.getValue(this.watchPath, 0) + a;
        if (int) { res = Math.round(res) }
        this.VM.setValue(this.watchPath, this.clampValue(res));
    }

      
    vSub(e: Event, data: string, int: boolean = false) {
        let a = parseFloat(data);
        let res = this.VM.getValue(this.watchPath, 0) - a;
        if (int) { res = Math.round(res) }
        this.VM.setValue(this.watchPath, this.clampValue(res));
    }

      
    vMul(e: Event, data: string, int: boolean = false) {
        let a = parseFloat(data);
        let res = this.VM.getValue(this.watchPath, 0) * a;
        if (int) { res = Math.round(res) }
        this.VM.setValue(this.watchPath, this.clampValue(res));
    }

      
    vDiv(e: Event, data: string, int: boolean = false) {
        let a = parseFloat(data);
        let res = this.VM.getValue(this.watchPath, 0) / a;
        if (int) { res = Math.round(res) }
        this.VM.setValue(this.watchPath, this.clampValue(res));
    }

      
    vString(e: Event, data: string) {
        let a = data;
        this.VM.setValue(this.watchPath, a);
    }

      
    vNumberInt(e: Event, data: string) {
        this.vNumber(e, data, true);
    }

      
    vNumber(e: Event, data: string, int: boolean = false) {
        let a = parseFloat(data);
        if (int) { a = Math.round(a) }
        this.VM.setValue(this.watchPath, this.clampValue(a));
    }
}
