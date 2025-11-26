/*
 * @Author: dgflash
 * @Date: 2022-04-14 17:08:01
 * @LastEditors: dgflash
 * @LastEditTime: 2022-04-14 19:06:34
 */
import { Animation, Component, Label, _decorator } from "cc";
import { LanguageLabel } from "../language/LanguageLabel";

const { ccclass, property } = _decorator;

@ccclass('NotifyComponent')
export class NotifyComponent extends Component {
    @property(Label)
    private lab_content: Label | null = null;

    @property(Animation)
    private animation: Animation | null = null;

    onLoad() {
        if (this.animation)
            this.animation.on(Animation.EventType.FINISHED, this.onFinished, this);
    }

    private onFinished() {
        this.node.destroy();
    }

    /**
       
  
  
  
     */
    public toast(msg: string, useI18n: boolean) {
        let label = this.lab_content?.getComponent(LanguageLabel)!;
        if (useI18n) {
            label.dataID = msg;
        }
        else {
            if (label)
                label.dataID = "";
            this.lab_content!.string = msg;
        }
    }
}