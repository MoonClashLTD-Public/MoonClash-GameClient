import { CCString, Enum, EventHandler, _decorator } from 'cc';
import VMBase from './VMBase';

  
  
  
  
  
  

  

const { ccclass, property, executeInEditMode, menu, help } = _decorator;

enum FILTER_MODE {
    "none",
    "==",   
    "!=",   
    ">",    
    ">=",   
    "<",    
    "<=",   
}

/**
 *  [VM-Event]
   
   
 */
@ccclass
@executeInEditMode
@menu('ModelViewer/VM-EventCall')
@help('https://github.com/wsssheep/cocos_creator_mvvm_tools/blob/master/docs/VMEvent.md')
export default class VMEvent extends VMBase {
    @property({
        tooltip: ''
    })
    public templateMode: boolean = false;

    @property({
        tooltip: '',
        visible: function () { return this.templateMode === false }
    })
    watchPath: string = "";

    @property({
        tooltip: ''
    })
    triggerOnce: boolean = false;

    @property({
        tooltip: '',
        type: [CCString],
        visible: function () { return this.templateMode === true }
    })
    protected watchPathArr: string[] = [];

    @property({
        tooltip: '',
        type: Enum(FILTER_MODE)
    })
    public filterMode: FILTER_MODE = FILTER_MODE.none;

    @property({
        visible: function () { return this.filterMode !== FILTER_MODE.none }
    })
    public compareValue: string = '';

    @property([EventHandler])
    changeEvents: EventHandler[] = [];

    onValueInit() {

    }

    onValueChanged(newVar: any, oldVar: any, pathArr: any[]) {
        let res = this.conditionCheck(newVar, this.compareValue);
        if (!res) return;

        if (Array.isArray(this.changeEvents)) {
            this.changeEvents.forEach(v => {
                v.emit([newVar, oldVar, pathArr]);
            })
        }

          
        if (this.triggerOnce === true) {
            this.enabled = false;
        }
    }

      
    private conditionCheck(a: any, b: any): boolean {
        let cod = FILTER_MODE;

        switch (this.filterMode) {
            case cod.none:
                return true;
            case cod["=="]:
                if (a == b) return true;
                break;
            case cod["!="]:
                if (a != b) return true;
                break;
            case cod["<"]:
                if (a < b) return true;
                break;
            case cod[">"]:
                if (a > b) return true;
                break;
            case cod[">="]:
                if (a >= b) return true;
                break;
            case cod["<"]:
                if (a < b) return true;
                break;
            case cod["<="]:
                if (a <= b) return true;
                break;

            default:
                break;
        }

        return false;
    }
}