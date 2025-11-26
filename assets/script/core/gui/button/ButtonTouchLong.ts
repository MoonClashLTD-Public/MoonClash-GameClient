/*
 * @Author: dgflash
 * @Date: 2022-04-14 17:08:01
 * @LastEditors: dgflash
 * @LastEditTime: 2022-04-14 18:15:42
 */
import { EventHandler, EventTouch, _decorator } from "cc";
import ButtonEffect from "./ButtonEffect";

const { ccclass, property, menu } = _decorator;

@ccclass("ButtonTouchLong")
@menu('ui/button/ButtonTouchLong')
export class ButtonTouchLong extends ButtonEffect {
    @property({
        tooltip: ""
    })
    time: number = 1;

    @property({
        type: [EventHandler],
        tooltip: ""
    })
    clickEvents: EventHandler[] = [];

    protected _passTime = 0;
    protected _isTouchLong: boolean = true;
    protected _event: EventTouch | null = null;

    onLoad() {
        this._isTouchLong = false;
        super.onLoad();
    }

      
    onTouchtStart(event: EventTouch) {
        this._event = event;
        this._passTime = 0;
        super.onTouchtStart(event);
    }

      
    onTouchEnd(event: EventTouch) {
        if (this._passTime > this.time) {
            event.propagationStopped = true;
        }
        this._event = null;
        this._passTime = 0;
        this._isTouchLong = false;

        super.onTouchEnd(event);
    }

    removeTouchLong() {
        this._event = null;
        this._isTouchLong = false;
    }

      
    update(dt: number) {
        if (this._event && !this._isTouchLong) {
            this._passTime += dt;

            if (this._passTime >= this.time) {
                this._isTouchLong = true;
                this.clickEvents.forEach(event => {
                    event.emit([event.customEventData])
                });
                this.removeTouchLong();
            }
        }
    }
}
