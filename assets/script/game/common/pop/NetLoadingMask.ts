import { _decorator, Component, Node, Label, Sprite, Color, v3, tween, Button } from 'cc'
import { Message } from '../../../core/common/event/MessageManager'
import { RandomManager } from '../../../core/common/manager/RandomManager'
import { LangLabelParamsItem, LanguageLabel } from '../../../core/gui/language/LanguageLabel'
import { oops } from '../../../core/Oops'
const { ccclass, property } = _decorator

@ccclass('NetLoadingMask')
export class NetLoadingMask<T> extends Component {
    @property(LanguageLabel)
    private content: LanguageLabel
    @property(Label)
    private cdLbl: Label
    @property(Label)
    private closeDescLbl: Label
    @property(Button)
    private closeBtn: Button
    private param: HomeLoadingConfig<T>
    private returnData: T

    private isAutoOffTime = false;
    private delayedTime = 0;
    /**
  
     * {
  
     * }
     */
    public onAdded(param: HomeLoadingConfig<T>) {
        this.param = param || {}
        this.returnData = null;
        param.content = param.content ? param.content : 'common_wait';
        if (param.closeEventName || param.isShowCloseCD) {
            this.isAutoOffTime = true;
            param.autoOffTime = param.autoOffTime ? param.autoOffTime : 60;
            this.delayedTime = RandomManager.instance.getRandomInt(2, 5);
            this.schedule(() => {
                this.delayedTime--;
                param.autoOffTime--;
                this.updCDLbl();
            }, 1)
        }
        this.updCDLbl();

        if (param.closeEventName instanceof Array) {
            param.closeEventName.forEach(e => {
                this.addEvent(e);
            })
        } else {
            this.addEvent(param.closeEventName);
        }

        this.setContent()

        this.waitAction();
    }

    onBeforeRemove(next: Function) {
        this.param.cb && this.param.cb(this.returnData);
    }

    updCDLbl() {
        this.cdLbl.string = `(${this.param.autoOffTime})`;

        if (this.isAutoOffTime) {
            this.cdLbl.node.active = this.param.autoOffTime >= 0;
            this.closeBtn.interactable = this.param.autoOffTime < 0;
            this.closeDescLbl.node.active = this.param.autoOffTime < 0;
        } else {
            this.closeBtn.interactable = false;
            this.cdLbl.node.active = false;
            this.closeDescLbl.node.active = false;
        }
    }

    private setContent() {
        if (this.content) {
            if (this.param?.content) this.content.dataID = this.param.content
            this.content.params = this.param.contentParams || []
        }
    }

    addEvent(eventName: string) {
        if (eventName)
            Message.on(`${eventName}`, this.msgEvent, this);
    }
    removeEvent(eventName: string) {
        if (eventName)
            Message.off(`${eventName}`, this.msgEvent, this);
    }

    msgEvent(e: string, data: T) {
        this.delayedTime = this.delayedTime < 0 ? 0 : this.delayedTime;
        if (data && data["code"] && data["code"] != errcode.ErrCode.Ok) {
            this.delayedTime = 0;
        }
        tween(this.node)
            .delay(this.delayedTime)
            .call(() => {
                this.returnData = data;
                this.closeClick();
            })
            .start();
    }

    closeClick() {
        oops.gui.removeByNode(this.node, true);
    }

    onDestroy() {
        if (this.param.closeEventName instanceof Array) {
            this.param.closeEventName.forEach(e => {
                this.removeEvent(e);
            })
        } else {
            this.removeEvent(this.param.closeEventName);
        }
    }

    @property([Node])
    private loadings: Node[] = [];
    waitAction() {
        for (let index = 0; index < this.loadings.length; index++) {
            let node = this.loadings[index];
            tween(node)
                .delay(index / 10)
                .to(0.3, { scale: v3(2, 2, 2) })
                .to(0.3, { scale: v3(1, 1, 1) })
                .union()
                .repeatForever()
                .start();
        }
    }
}

export interface HomeLoadingConfig<T> {
      
    content?: string   
      
    contentParams?: LangLabelParamsItem[]   
      
    closeEventName?: string | string[]
    isShowCloseCD?: boolean
      
    autoOffTime?: number
    cb?: (data: T) => void;
}
