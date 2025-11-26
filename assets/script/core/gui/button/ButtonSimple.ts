import { Component, EventTouch, game, Node, _decorator } from "cc";

const { ccclass, property, menu } = _decorator;

@ccclass("ButtonSimple")
@menu('ui/button/ButtonSimple')
export default class ButtonSimple extends Component {
    @property({
        tooltip: ""
    })
    private once: boolean = false;

    @property({
        tooltip: ""
    })
    private interval: number = 500;

    private touchCount = 0;
    private touchtEndTime = 0;

    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchtStart, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

      
    protected onTouchtStart(event: EventTouch) { }

      
    protected onTouchEnd(event: EventTouch) {
        if (this.once) {
            if (this.touchCount > 0) {
                event.propagationStopped = true;
                return;
            }
            this.touchCount++;
        }

          
        if (this.touchtEndTime && game.totalTime - this.touchtEndTime < this.interval) {
            event.propagationStopped = true;
        }
        else {
            this.touchtEndTime = game.totalTime;
        }
    }

    onDestroy() {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchtStart, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
}
