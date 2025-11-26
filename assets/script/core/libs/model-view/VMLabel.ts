import { CCString, error, _decorator } from 'cc';
import { EDITOR } from 'cc/env';
import { StringFormatFunction } from './StringFormat';
import VMBase from './VMBase';

const { ccclass, property, menu, executeInEditMode, help } = _decorator;

const LABEL_TYPE = {
    CC_LABEL: 'cc.Label',
    CC_RICH_TEXT: 'cc.RichText',
    CC_EDIT_BOX: 'cc.EditBox'
}

/**
 *  [VM-Label]
   
   
  
 */
@ccclass
@executeInEditMode
@menu('ModelViewer/VM-Label()')
@help('https://github.com/wsssheep/cocos_creator_mvvm_tools/blob/master/docs/VMLabel.md')
export default class VMLabel extends VMBase {
    @property({
        tooltip: ''
    })
    public templateMode: boolean = false;

    @property({
        readonly: true
    })
    private labelType: string = LABEL_TYPE.CC_LABEL;

    @property({
        visible: function () { return this.templateMode === false; }
    })
    watchPath: string = "";

      
    @property({
        type: [CCString],
        visible: function () { return this.templateMode === true }
    })
    protected watchPathArr: string[] = [];

      
    protected templateValueArr: any[] = [];

      
    private templateFormatArr: string[] = [];

      
    private originText: string | null = null;

    onRestore() {
        this.checkLabel();
    }

    onLoad() {
        super.onLoad();
        this.checkLabel();
        if (!EDITOR) {
            if (this.templateMode) {
                this.originText = this.getLabelValue();
                this.parseTemplate();
            }
        }
    }

    start() {
        if (EDITOR) return;
        this.onValueInit();
    }

      
    parseTemplate() {
        let regexAll = /\{\{(.+?)\}\}/g;                  
        let regex = /\{\{(.+?)\}\}/;                      
        let res = this.originText!.match(regexAll);       
        if (res == null) return;
        for (let i = 0; i < res.length; i++) {
            const e = res[i];
            let arr = e.match(regex);
            let matchName = arr![1];
            // let paramIndex = parseInt(matchName) || 0;
            let matchInfo = matchName.split(':')[1] || '';
            this.templateFormatArr[i] = matchInfo;
        }
    }

      
    getReplaceText() {
        if (!this.originText) return "";
        let regexAll = /\{\{(.+?)\}\}/g;                      
        let regex = /\{\{(.+?)\}\}/;                          
        let res = this.originText.match(regexAll);            
        if (res == null) return '';                           
        let str = this.originText;                            

        for (let i = 0; i < res.length; i++) {
            const e = res[i];
            let getValue;
            let arr = e.match(regex);                         
            let indexNum = parseInt(arr![1] || '0') || 0;     
            let format = this.templateFormatArr[i];           
            getValue = this.templateValueArr[indexNum];
            str = str.replace(e, this.getValueFromFormat(getValue, format));  
        }
        return str;
    }

      
    getValueFromFormat(value: number | string, format: string): string {
        return StringFormatFunction.deal(value, format);
    }

      
    onValueInit() {
          
        if (this.templateMode === false) {
            this.setLabelValue(this.VM.getValue(this.watchPath)); //
        }
        else {
            let max = this.watchPathArr.length;
            for (let i = 0; i < max; i++) {
                this.templateValueArr[i] = this.VM.getValue(this.watchPathArr[i], '?');
            }
            this.setLabelValue(this.getReplaceText());   
        }
    }

      
    onValueChanged(n: any, o: any, pathArr: string[]) {
        if (this.templateMode === false) {
            this.setLabelValue(n);
        }
        else {
            let path = pathArr.join('.');
              
            let index = this.watchPathArr.findIndex(v => v === path);

            if (index >= 0) {
                  
                this.templateValueArr[index] = n;            
                this.setLabelValue(this.getReplaceText());   
            }

        }
    }

    setLabelValue(value: string) {
        var component: any = this.getComponent(this.labelType);
        component.string = value + '';
    }

    getLabelValue(): string {
        var component: any = this.getComponent(this.labelType);
        return component.string;
    }

    private checkLabel() {
        let checkArray = [
            'cc.Label',
            'cc.RichText',
            'cc.EditBox',
        ];

        for (let i = 0; i < checkArray.length; i++) {
            const e = checkArray[i];
            let comp = this.node.getComponent(e);
            if (comp) {
                this.labelType = e;
                return true;
            }
        }

        error('');

        return false;
    }
}
