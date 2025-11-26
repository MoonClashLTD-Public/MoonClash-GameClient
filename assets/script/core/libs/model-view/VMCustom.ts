import { Toggle, _decorator } from 'cc';
import { EDITOR } from 'cc/env';
import VMBase from './VMBase';

const { ccclass, property, executeInEditMode, menu, help } = _decorator;

  
const COMP_ARRAY_CHECK = [
    ['BhvFrameIndex', 'index', false],
    ['BhvGroupToggle', 'index', false],
    ['BhvRollNumber', 'targetValue', false],
      
    ['cc.Label', 'string', false],
    ['cc.RichText', 'string', false],
    ['cc.EditBox', 'string', true],
    ['cc.Slider', 'progress', true],
    ['cc.ProgressBar', 'progress', false],
    ['cc.Toggle', 'isChecked', true]
];


/**
 * [VM-Custom]
   
 */
@ccclass
@executeInEditMode
@menu('ModelViewer/VM-Custom')
@help('https://github.com/wsssheep/cocos_creator_mvvm_tools/blob/master/docs/VMCustom.md')
export default class VMCustom extends VMBase {
    @property({
        tooltip: '',
    })
    controller: boolean = false;

    @property({
        tooltip: ""
    })
    watchPath: string = "";

    @property({
        tooltip: ''
    })
    componentName: string = "";

    @property({
        tooltip: ''
    })
    componentProperty: string = "";

    @property({
        tooltip: '',
        step: 0.01,
        range: [0, 1],
        visible: function () { return this.controller === true }
    })
    refreshRate: number = 0.1;

      
    private _timer = 0;

      
    private _watchComponent: any = null;

      
    private _canWatchComponent: boolean = false;

      
    private _oldValue: any = null;

    onLoad() {
        super.onLoad();

          
        this.checkEditorComponent();  
        if (!EDITOR) {
            this._watchComponent = this.node.getComponent(this.componentName);
            this.checkComponentState();
        }
    }

    onRestore() {
        this.checkEditorComponent();
    }

    start() {
          
        this.onValueInit();
    }

      
    checkEditorComponent() {
        if (EDITOR) {
            let checkArray = COMP_ARRAY_CHECK;
            for (let i = 0; i < checkArray.length; i++) {
                const params = checkArray[i];
                let comp = this.node.getComponent(params[0] as string);
                if (comp) {
                    if (this.componentName == '') this.componentName = params[0] as string;
                    if (this.componentProperty == '') this.componentProperty = params[1] as string;
                    if (params[2] !== null) this.controller = params[2] as boolean;

                    break;
                }
            }
        }
    }

    checkComponentState() {
        this._canWatchComponent = false;
        if (!this._watchComponent) { console.error(''); return; }
        if (!this.componentProperty) { console.error(''); return; }
        if (this.componentProperty in this._watchComponent === false) { console.error(''); return; }
        this._canWatchComponent = true;
    }

    getComponentValue() {
        return this._watchComponent[this.componentProperty];
    }

    setComponentValue(value: any) {
          
        if (this.componentName == "cc.Toggle") {
            this.node.getComponent(Toggle)!.isChecked = value
        }
        else {
            this._watchComponent[this.componentProperty] = value;
        }
    }

      
    onValueInit() {
        if (EDITOR) return;   
          
        this.setComponentValue(this.VM.getValue(this.watchPath));
    }

      
    onValueController(newValue: any, oldValue: any) {
        this.VM.setValue(this.watchPath, newValue);
    }

      
    onValueChanged(n: any, o: any, pathArr: string[]) {
        this.setComponentValue(n);
    }

    update(dt: number) {
          
        if (EDITOR == true) return;
          
        if (!this.controller) return;
        if (!this._canWatchComponent || this._watchComponent['enabled'] === false) return;

          
        this._timer += dt;
        if (this._timer < this.refreshRate) return;
        this._timer = 0;

        let oldValue = this._oldValue;
        let newValue = this.getComponentValue();

        if (this._oldValue === newValue) return;
        this._oldValue = this.getComponentValue();
        this.onValueController(newValue, oldValue);
    }
}
