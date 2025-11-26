import { CCString, Component, error, Label, RichText, warn, _decorator } from "cc";
import { EDITOR } from "cc/env";
import { LanguageManager } from "./Language";
import { LanguageData } from "./LanguageData";

const { ccclass, property, menu, executeInEditMode } = _decorator;

@ccclass("LangLabelParamsItem")
export class LangLabelParamsItem {
    @property
    key: string = "";
    @property
    value: string = "";
}

@ccclass("LanguageLabel")
@menu('ui/language/LanguageLabel')
@executeInEditMode(true)
export class LanguageLabel extends Component {
    @property({
        type: LangLabelParamsItem,
        displayName: "params"
    })
    private _params: Array<LangLabelParamsItem> = [];

    @property({
        type: LangLabelParamsItem,
        displayName: "params"
    })
    set params(value: Array<LangLabelParamsItem>) {
        this._params = value;
        this._needUpdate = true;
    }
    get params(): Array<LangLabelParamsItem> {
        return this._params || [];
    }

    @property({ serializable: true })
    private _dataID: string = "";
    @property({ type: CCString, serializable: true })
    get dataID(): string {
        return this._dataID || "";
    }
    set dataID(value: string) {
        this._dataID = value;
        this._needUpdate = true;
    }

    @property({ serializable: false, visible: false })
    _refresh: boolean = false;
    @property({ displayName: "" })
    get refresh() {
        return this._refresh;
    }
    set refresh(val: boolean) {
        this._refresh = val;
        LanguageManager.instance.init(true, () => {
            console.log("this._needUpdate", this._needUpdate)
            this._needUpdate = true;
        })
    }

    get string(): string {
        return LanguageData.getLangByIDAndParams(this._dataID, this._params);
    }

      
    forceUpdate() {
        this._needUpdate = true;
    }

      
    language() {
        this._needUpdate = true;
    }

    initFontSize: number = 0;

    onLoad() {
        if (EDITOR) {

        } else {
            this._needUpdate = true;
            if (!this.getComponent(Label) && !this.getComponent(RichText)) {
                error(this.node.name, this._dataID);
                return;
            }

            if (this.getComponent(RichText)) {
                this.initFontSize = this.getComponent(RichText)!.fontSize;
            }

            if (this.getComponent(Label)) {
                this.initFontSize = this.getComponent(Label)!.fontSize;
            }
        }
    }

    /**
       
     */
    public getLabelFont(lang: string): string {
        switch (lang) {
            case "zh":
            case "tr": {
                return "SimHei";
            }
        }
        return "Helvetica";
    }

    /**
       
  
  
     */
    setVars(key: string, value: string) {
        let haskey = false;
        for (let i = 0; i < this._params.length; i++) {
            let element: LangLabelParamsItem = this._params[i];
            if (element.key === key) {
                element.value = value;
                haskey = true;
            }
        }
        if (!haskey) {
            let ii = new LangLabelParamsItem();
            ii.key = key;
            ii.value = value;
            this._params.push(ii);
        }
        this._needUpdate = true;
    }
    private _needUpdate: boolean = false;

    update() {
        if (this._needUpdate) {
            this.updateLabel();
            this._needUpdate = false;
        }
    }
    updateLabel() {
        do {
            if (!this._dataID) {
                break;
            }

            let spcomp: any = this.getComponent(Label);
            if (!spcomp) {
                spcomp = this.getComponent(RichText);
                if (!spcomp) {
                    
                    break;
                }
            }

            spcomp.string = this.string;
        }
        while (false);
    }
}
