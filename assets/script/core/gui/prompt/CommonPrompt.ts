import { Component, EventTouch, HorizontalTextAlignment, Layout, _decorator } from "cc";
import { oops } from "../../Oops";
import { LanguageLabel } from "../language/LanguageLabel";

const { ccclass, property, menu } = _decorator;

@ccclass("CommonPrompt")
export default class CommonPrompt extends Component {
    @property(LanguageLabel)
    private lab_title: LanguageLabel | null = null;

    @property(LanguageLabel)
    private lab_content: LanguageLabel | null = null;

    @property(LanguageLabel)
    private lab_ok: LanguageLabel | null = null

    @property(LanguageLabel)
    private lab_cancel: LanguageLabel | null = null;
    @property(Layout)
    private btnLayout: Layout | null = null;

    private config: any = {};

    private onTouchEnd(event: EventTouch, data: any) {
        switch (event.target.name) {
            case "btn_ok":
                this.onOk();
                break;
            case "btn_cancel":
                this.onCancel();
                break;
            default:
                break;
        }
    }

    /**
     * @param params    
     * {
     *  title:       
     *  content:     
     *  okWord:    ok      
     *  okFunc:            
     *  cancelWord:        
     *  cancelFunc:         
     *  needCancel:         
     *  order     
     * }
     */
    public onAdded(params: any = {}) {
        this.config = params || {};
        this.setTitle();
        this.setContent();
        this.setBtnOkLabel();
        this.setBtnCancelLabel();
        if (this.btnLayout) {
            const order = this.config.order ?? true
            this.btnLayout.horizontalDirection = order ? Layout.HorizontalDirection.LEFT_TO_RIGHT : Layout.HorizontalDirection.RIGHT_TO_LEFT
        }
        this.node.active = true;
    }
    private setTitle() {
        this.lab_title!.dataID = this.config.title;
    }

    private setContent() {
        this.lab_content!.dataID = this.config.content;
    }

    private setBtnOkLabel() {
        this.lab_ok!.dataID = this.config.okWord;
    }

    private setBtnCancelLabel() {
        this.lab_cancel!.dataID = this.config.cancelWord;
        this.lab_cancel!.node!.parent!.active = this.config.needCancel || false;
    }

    private onOk() {
        if (typeof this.config.okFunc == "function") {
            this.config.okFunc();
        }
        this.close();
    }

    private onClose() {
        if (typeof this.config.closeFunc == "function") {
            this.config.closeFunc();
        }
        this.close();
    }

    private onCancel() {
        if (typeof this.config.cancelFunc == "function") {
            this.config.cancelFunc();
        }
        this.close();
    }

    private close() {
        oops.gui.removeByNode(this.node);
    }

    onDestroy() {
        this.config = null;
    }
}