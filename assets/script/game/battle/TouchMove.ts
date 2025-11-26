import { _decorator, Component, EventTouch, Input, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TouchMove')
export class TouchMove extends Component {
    start() {
        this.node.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    update(deltaTime: number) {

    }

    protected onTouchStart(event: EventTouch) {
        // event.preventSwallow = true;
    }
    protected onTouchMove(event: EventTouch) {
        // event.preventSwallow = true;

        let pos = this.node.getPosition();
        let x = pos.x + event.getUIDelta().x;
        let y = pos.y + event.getUIDelta().y;
        this.node.setPosition(v3(x, y));
    }
    protected onTouchEnd(event: EventTouch) {
        // event.preventSwallow = true;
    }
}

