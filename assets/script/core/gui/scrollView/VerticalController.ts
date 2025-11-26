import { Component, EventTouch, Input, _decorator, Event, ScrollView, v2 } from 'cc';
const { ccclass, property } = _decorator;

export interface ViewGroupEventTouch extends EventTouch {
    simulate: boolean
    sham?: boolean
}

// https://forum.cocos.org/t/topic/112481
  
// bug https://forum.cocos.org/t/pageview-scrollview/73152/18
@ccclass('VerticalController')
export default class VerticalController extends Component {
    private events: Event[] = [];
    private isInitMove = false
    private isMoveY = false
    private isHasScrollView = false

    onLoad() {
        let t = this;
        t.node.on(Input.EventType.TOUCH_START, t.onTouchHandle, t, true);
        t.node.on(Input.EventType.TOUCH_MOVE, t.onTouchHandle, t, true);
        t.node.on(Input.EventType.TOUCH_END, t.onTouchHandle, t, true);
        t.node.on(Input.EventType.TOUCH_CANCEL, t.onTouchHandle, t, true);
        t.node.on(Input.EventType.MOUSE_WHEEL, t.onTouchHandle, t, true);

        if (this.node.getComponent(ScrollView)) this.isHasScrollView = true
        // t.node.on(ScrollView.EventType.TOUCH_UP, t.onTouchHandle, t, true);
        // t.node.on(ScrollView.EventType.SCROLL_BEGAN, t.onTouchHandle, t, true);
        // t.node.on(ScrollView.EventType.SCROLL_ENDED, t.onTouchHandle, t, true);
        // t.node.on(ScrollView.EventType.SCROLLING, t.onTouchHandle, t, true);
    }
    private touchStart = false

    private onTouchHandle(event: ViewGroupEventTouch) {
        // console.debug(`event -- `, event)
        if (event?.sham || event?.simulate || event?.target === this.node || !this.isHasScrollView) return;
        // console.debug(`event2 -- `, event)
        event.sham = true;
        // console.log('onTouchHandle', event);
        if (event.type == Input.EventType.TOUCH_START) {
            this.touchStart = true
            this.events.push(event);
        } else if (event.type == Input.EventType.TOUCH_END || event.type == Input.EventType.TOUCH_CANCEL) {
            this.touchStart = false
            this.isInitMove = false
            this.isMoveY = false
            this.events.push(event);
            const scrollview = this.node.getComponent(ScrollView)
            const curr = scrollview.getScrollOffset()
            if (curr.y < 0) {
                this.scheduleOnce(() => {
                    scrollview.stopAutoScroll()
                    scrollview.scrollToTop()
                }, 0)
            }
        } else if (event.type == Input.EventType.TOUCH_MOVE) {
            if (!this.touchStart) {
                event.propagationStopped = true
                return
            }
              
            if (!this.isInitMove) {
                let tx = event.getDeltaX()
                let ty = event.getDeltaY()
                if (tx != ty) {
                    this.isMoveY = Math.abs(tx) < Math.abs(ty)
                    this.isInitMove = true
                }
            }
            if (this.isMoveY) {
                event.propagationStopped = true;
                this.events.push(event);
            }
        } else {
            this.events.push(event);
        }
    }

      
      
      
      
    // this.events.push(event);
    update() {
        if (this.events.length == 0) return;
        for (let index = 0; index < this.events.length; index++) {
            this.node.dispatchEvent(this.events[index]);
            // console.debug(`dispatchEvent -- `, this.events[index])
        }
        this.events.length = 0;
    }

    onDestroy() {
        let t = this;
        t.node.off(Input.EventType.TOUCH_START, t.onTouchHandle, t, true);
        t.node.off(Input.EventType.TOUCH_MOVE, t.onTouchHandle, t, true);
        t.node.off(Input.EventType.TOUCH_END, t.onTouchHandle, t, true);
        t.node.off(Input.EventType.TOUCH_CANCEL, t.onTouchHandle, t, true);
        t.node.off(Input.EventType.MOUSE_WHEEL, t.onTouchHandle, t, true);
        // t.node.off(ScrollView.EventType.TOUCH_UP, t.onTouchHandle, t, true);
        // t.node.off(ScrollView.EventType.SCROLL_BEGAN, t.onTouchHandle, t, true);;
        // t.node.off(ScrollView.EventType.SCROLL_ENDED, t.onTouchHandle, t, true);;
        // t.node.off(ScrollView.EventType.SCROLLING, t.onTouchHandle, t, true);
    }
}