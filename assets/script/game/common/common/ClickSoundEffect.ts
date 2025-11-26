
import { _decorator, Component, Button, EventTouch, Input, Toggle, EventHandler } from 'cc';
import { oops } from '../../../core/Oops';
import { AudioSoundRes } from '../../data/resManger';
const { ccclass, property, requireComponent } = _decorator;
@ccclass('ClickSoundEffect')
@requireComponent(Button)
export class ClickSoundEffect extends Component {
    start() {
          
        let btn = this.node.getComponent(Button);
        let tog = this.node.getComponent(Toggle);
        let handler = new EventHandler();
        handler.target = this.node;
        handler.handler = 'playClickEffect';// this.playClickEffect.name;
        handler.component = 'ClickSoundEffect';
        if (btn) {
            btn.clickEvents.push(handler);
        } else if (tog) {
            tog.clickEvents.push(handler);
        }
        // this.node.on(Input.EventType.TOUCH_START, (event: EventTouch) => {
        //     event.preventSwallow = true;
        //     if ((btn && btn.interactable && btn.enabled) || (tog && tog.interactable && tog.enabled)) {
        //         ClickSoundEffect.playClickEffect();
        //     }
        // }, this);
    }

      
    static playClickEffect() {
        oops.audio.playEffect(AudioSoundRes.commonClick);
    }
    playClickEffect() {
        oops.audio.playEffect(AudioSoundRes.commonClick);
    }
}