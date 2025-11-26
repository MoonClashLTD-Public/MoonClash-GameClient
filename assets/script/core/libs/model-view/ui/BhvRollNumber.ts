import { Component, Enum, Label, lerp, misc, _decorator } from "cc";

const { ccclass, property, menu } = _decorator;

enum VALUE_TYPE {
      
    INTEGER,
      
    FIXED_2,
      
    TIMER,
      
    PERCENTAGE,
      
    KMBT_FIXED2,
      
    CUSTOMER
}

/**
  
   
 */
@ccclass
@menu("")
export default class BhvRollNumber extends Component {
    @property({
        type: Label,
        tooltip: ''
    })
    label: Label | null = null;

    @property({
        tooltip: ''
    })
    value: number = 0;

    @property({
        tooltip: ''
    })
    showPlusSymbol: boolean = false;

    @property({
        tooltip: ''
    })
    public get targetValue(): number {
        return this._targetValue;
    }
    public set targetValue(v: number) {
        this._targetValue = v;
        this.scroll();  
    }
    @property
    private _targetValue: number = 100;

      
    @property({
        tooltip: '',
        step: 0.01,
        max: 1,
        min: 0
    })
    lerp = 0.1;

    @property({
        tooltip: ''
    })
    private playAtStart: boolean = true;

    @property({
        tooltip: '',
        step: 0.1,
        max: 1,
        min: 0
    })
    private runWaitTimer: number = 0;

    @property({
        type: Enum(VALUE_TYPE),
        tooltip: ''
    })
    private valueType: VALUE_TYPE = VALUE_TYPE.INTEGER;

      
    private _custom_callback: (curValue: number, targetValue: number) => string = null;

    private isScrolling: boolean = false;

    onLoad() {
        if (this.label == undefined) {
            this.label = this.node.getComponent(Label);
        }

        if (this.playAtStart) {
            this.updateLabel();
            this.scroll();
        }
    }


      
    scroll() {
        if (this.isScrolling) return;         
        if (this.runWaitTimer > 0) {
            this.scheduleOnce(() => {
                this.isScrolling = true;
            }, this.runWaitTimer);
        }
        else {
            this.isScrolling = true;
        }
    }

      
    stop() {
        this.value = this.targetValue;
        this.isScrolling = false;
        this.updateLabel();
    }

      
    init(value?: number, target?: number, lerp?: number) {
        this.targetValue = target || 0;
        this.value = value || 0;
        this.lerp = lerp || 0.1;
    }

      
    scrollTo(target?: number) {
        if (target === null || target === undefined) return;
        this.targetValue = target;
    }

      
    updateLabel() {
        let value = this.value;
        let string = '';

        switch (this.valueType) {
            case VALUE_TYPE.INTEGER:                          
                string = Math.round(value) + '';
                break;
            case VALUE_TYPE.FIXED_2:                          
                string = value.toFixed(2);
                break;
            case VALUE_TYPE.TIMER:                            
                string = parseTimer(value);
                break;
            case VALUE_TYPE.PERCENTAGE:                       
                string = Math.round(value * 100) + '%';
                break;
            case VALUE_TYPE.KMBT_FIXED2:                      
                if (value >= Number.MAX_VALUE) {
                    string = 'MAX';
                }
                else if (value > 1000000000000) {
                    string = (value / 1000000000000).toFixed(2) + 'T';
                }
                else if (value > 1000000000) {
                    string = (value / 1000000000).toFixed(2) + 'B';
                }
                else if (value > 1000000) {
                    string = (value / 1000000).toFixed(2) + 'M';
                }
                else if (value > 1000) {
                    string = (value / 1000).toFixed(2) + "K";
                }
                else {
                    string = Math.round(value).toString();
                }
                break;
            case VALUE_TYPE.CUSTOMER:   
                if (this._custom_callback) {
                    string = this._custom_callback(this.value, this.targetValue)
                }
                break;
            default:
                break;
        }

          

        if (this.showPlusSymbol) {
            if (value > 0) {
                string = '+' + string;
            }
            else if (value < 0) {
                string = '-' + string;
            }
        }

        if (this.label) {
            if (string === this.label.string) return;     
            this.label.string = string;
        }
    }

    update(dt: number) {
        if (this.isScrolling == false) return;
        this.value = lerp(this.value, this.targetValue, this.lerp);
        this.updateLabel();
        if (Math.abs(this.value - this.targetValue) <= 0.0001) {
            this.value = this.targetValue;
            this.isScrolling = false;
              
            return;
        }
    }
}

  
function parseTimer(timer: number = 0, isFullTimer: boolean = true) {
    let t: number = Math.floor(timer);
    let hours: number = Math.floor(t / 3600);
    let mins: number = Math.floor((t % 3600) / 60);
    let secs: number = t % 60;
    let m = '' + mins;
    let s = '' + secs;
    if (secs < 10) s = '0' + secs;

      
    if (isFullTimer) {
        if (mins < 10) m = '0' + mins;
        return hours + ':' + m + ':' + s;
    }
    else {
        m = '' + (mins + hours * 60);
        if (mins < 10) m = '0' + mins;
        return m + ':' + s;
    }
}