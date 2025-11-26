import { CCString, _decorator } from "cc";
import { EDITOR } from "cc/env";
import { StringFormatFunction } from "./StringFormat";
import VMCustom from "./VMCustom";

const { ccclass, property, menu, help } = _decorator;

@ccclass
@menu('ModelViewer/VM-Progress (VM)')
@help('https://github.com/wsssheep/cocos_creator_mvvm_tools/blob/master/docs/VMProgress.md')
export default class VMProgress extends VMCustom {
    @property({
        visible: false,
        override: true
    })
    watchPath: string = '';

    @property({
        type: [CCString],
        tooltip: ''
    })
    public watchPathArr: string[] = ['[min]', '[max]'];

    public templateMode: boolean = true;

    @property({
        visible: function () { return this.componentProperty === 'string' },
        tooltip: ''
    })
    stringFormat: string = '';

    onLoad() {
        if (this.watchPathArr.length < 2 || this.watchPathArr[0] == '[min]' || this.watchPathArr[1] == '[max]') {
            console.error('VMProgress must have two values!');
        }
        super.onLoad();
    }

    start() {
        if (!EDITOR) {
            this.onValueInit();
        }
    }

    onValueInit() {
        let max = this.watchPathArr.length;
        for (let i = 0; i < max; i++) {
            this.templateValueArr[i] = this.VM.getValue(this.watchPathArr[i]);
        }

        let value = this.templateValueArr[0] / this.templateValueArr[1];
        this.setComponentValue(value);
    }

    setComponentValue(value: any) {
        if (this.stringFormat !== '') {
            let res = StringFormatFunction.deal(value, this.stringFormat);
            super.setComponentValue(res);
        }
        else {
            super.setComponentValue(value);
        }
    }

    onValueController(n: any, o: any) {
        let value = Math.round(n * this.templateValueArr[1]);
        if (Number.isNaN(value)) value = 0;
        this.VM.setValue(this.watchPathArr[0], value);
    }

      
    onValueChanged(n: any, o: any, pathArr: string[]) {
        if (this.templateMode === false) return;

        let path = pathArr.join('.');
          
        let index = this.watchPathArr.findIndex(v => v === path);
        if (index >= 0) {
              
            this.templateValueArr[index] = n;   
        }

        let value = this.templateValueArr[0] / this.templateValueArr[1];
        if (value > 1) value = 1;
        if (value < 0 || Number.isNaN(value)) value = 0;

        this.setComponentValue(value);
    }
}
