/**
  
 * Note:
 */
import { _decorator, Button, CCFloat, CCInteger, Component, EventHandler, EventTouch, Node, UITransform, v3, log } from 'cc';

const { ccclass, property } = _decorator;

export enum EventType {
    SCROLL_START,
    SCROLL_ING,
    SCROLL_END
}

@ccclass('UIScrollSelect')
export class UIScrollSelect extends Component {
    public static EventType = EventType;
    @property(Node)
    content: Node = null;
    @property({
        tooltip: ""
    })
    circlePage: boolean = true;
    @property({
        type: Button,
        tooltip: '',
        visible(this: UIScrollSelect) {
            return !this.circlePage;
        }
    })
    topBtn: Button = null;
    @property({
        type: Button,
        tooltip: '',
        visible(this: UIScrollSelect) {
            return !this.circlePage;
        }
    })
    bottomBtn: Button = null;

    @property({
        type: CCInteger,
        tooltip: ''
    })
    delta: number = 100;   
    @property({
        type: CCFloat,
        tooltip: ''
    })
    centerScale: number = 1.0;
    @property({
        type: CCFloat,
        tooltip: ''
    })
    minScale: number = 1.0;
    @property({
        type: CCFloat,
        tooltip: ''
    })
    scrollSpeed: number = 300;
    @property({
        type: EventHandler,
        tooltip: ""
    })
    selectEvents: Array<EventHandler> = [];



    private childs: Array<Node> = [];
    private isTouching: boolean = false;
    private hasTouchMove: boolean = false;
    private isTest: boolean = false;
    private _touchId: any = null;
    private currentIndex: number = 0;
    private _toMove: number = 1;   
    private dx: number = 0;
    private moveAim: number = 0;

    init(idx = 0) {
        this.childs = [];
        for (let i = 0; i < this.content.children.length; i++) {
            this.childs[i] = this.content.children[i];
            this.childs[i].position = v3(this.childs[i].position.x, this.delta * (i - 1), 0);
        }
        this.isTouching = false;
        this.hasTouchMove = false;
        this.isTest = false;
        this._touchId = null;
        // this.currentIndex = 0;
        this.scrollTo(idx, false);
    }

    /*  
     * @param idx
  
     */
    scrollTo(idx: number, anim: boolean = true) {
        if (idx < 0 && idx >= this.childs.length) {
            return console.error(this.node.name + '');
        }
        this.currentIndex = idx;
        this.moveAim = idx;
        if (!anim) {
            for (let i = 0; i < this.childs.length; i++) {
                this._checkChildY(this.childs[i], (i - idx) * this.delta);
            }
            EventHandler.emitEvents(this.selectEvents, {
                target: this,
                type: EventType.SCROLL_END,
                index: this.currentIndex
            });
        } else {
            this.isTest = true;
            EventHandler.emitEvents(this.selectEvents, {
                target: this,
                type: EventType.SCROLL_START,
                index: this.currentIndex
            });
        }
    }

      
    scrollToTop() {
        this._toMove = 1;
        this.scrollTo((this.currentIndex - 1 + this.childs.length) % this.childs.length);
        this._setPageBtnsStatus();
    }

      
    scrollToBottom() {
        this._toMove = -1;
        this.scrollTo((this.currentIndex + 1 + this.childs.length) % this.childs.length);
        this._setPageBtnsStatus();

    }

    /**
       
     */
    _setPageBtnsStatus() {
        const isRightEdge: boolean = this.currentIndex >= this.childs.length - 1;
        if (!this.circlePage && isRightEdge) {
            log("", this.currentIndex);
            if (this.bottomBtn) this.bottomBtn.interactable = false;
        } else {
            if (this.bottomBtn) this.bottomBtn.interactable = true;
        }
        const isLeftEdge: boolean = this.currentIndex <= 0;
        if (!this.circlePage && isLeftEdge) {
            log("", this.currentIndex);
            if (this.topBtn) this.topBtn.interactable = false;
        } else {
            if (this.topBtn) this.topBtn.interactable = true;
        }
    }

    _checkChildY(child: Node, y: number) {
        if (this.circlePage) {
            if (y > this.childs.length / 2 * this.delta) {
                y -= this.childs.length * this.delta;
            } else if (y < -this.childs.length / 2 * this.delta) {
                y += this.childs.length * this.delta;
            }
        }
        child.position = v3(child.position.x, y, child.position.z);
        let dx = Math.min(Math.abs(y), this.delta);
        let scale: number = (1 - dx / this.delta) * (this.centerScale - this.minScale) + this.minScale;
        child.scale = v3(scale, scale, 1);
    }

    start() {
        this.content.on(Node.EventType.TOUCH_START, this._onTouch, this);
        this.content.on(Node.EventType.TOUCH_MOVE, this._onTouch, this);
        this.content.on(Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this.content.on(Node.EventType.TOUCH_CANCEL, this._onTouchEnd, this);
    }

    _onTouch(event: EventTouch) {
        if (this._touchId != null && event.getID() != this._touchId) {
            return;
        }
        if (event.type == Node.EventType.TOUCH_START) {
            this.isTouching = true;
            this.hasTouchMove = false;
            this.isTest = false;
            this._touchId = event.getID();
            this.dx = event.getUIStartLocation().y;
            let evt = {
                target: this,
                type: EventType.SCROLL_START,
                index: this.currentIndex
            };
            EventHandler.emitEvents(this.selectEvents, evt);
            return;
        }
        this.hasTouchMove = true;
        let dx = event.getUILocation().y - this.dx;
        this._move(dx);
        this.dx = event.getUILocation().y;
        let evt = {
            target: this,
            type: EventType.SCROLL_ING,
            dx: this.dx
        };
        EventHandler.emitEvents(this.selectEvents, evt);
    }

    /**
       
     * @returns {{left: boolean, right: boolean}}
     */
    _isMoveEdge() {
        const leftEdge = this.childs[0].position.y >= 0;
        const rightEdge = this.childs[this.childs.length - 1].position.y <= 0;
        return { bottom: leftEdge, top: rightEdge };
    }

    _onTouchEnd(event: EventTouch) {
        if (this._touchId != null && event.getID() != this._touchId) {
            return;
        }
        this.isTouching = false;
        if (event.type == Node.EventType.TOUCH_END || event.type == Node.EventType.TOUCH_CANCEL) {
            this._touchId = null;
        }
        if (!this.circlePage) {
            let edge = this._isMoveEdge();
            if (edge.top) {
                log("");
                this.scrollTo(this.content.children.length - 1, false);
                return;
            }
            if (edge.bottom) {
                log("");
                this.scrollTo(0, false);
                return;
            }
        }
        let tf = this.node.getComponent(UITransform);
        let lo = tf.convertToNodeSpaceAR(v3(event.getUILocation().x, event.getUILocation().y));
        if (!this.hasTouchMove) {

            let mx = Math.ceil((lo.y - this.delta / 2) / this.delta);
            if (mx === 0) {
                let event1 = {
                    target: this,
                    type: EventType.SCROLL_END,
                    index: this.currentIndex
                };
                EventHandler.emitEvents(this.selectEvents, event1);
            } else {
                this.moveAim = (this.currentIndex + mx + this.childs.length) % this.childs.length;
                this._toMove = mx > 0 ? -1 : 1;
                this.isTest = true;
            }
            return;
        }
        let max = this.delta;
        let minidx = 0;
        for (let i = 0; i < this.childs.length; i++) {
            if (Math.abs(this.childs[i].position.y) <= max) {
                max = Math.abs(this.childs[i].position.y);
                minidx = i;
            }
        }
        this.moveAim = minidx;
        this._toMove = this.childs[minidx].position.y >= 0 ? -1 : 1;
        this.isTest = true;
    }

    _move(dt) {
        if (dt === 0) return;
        if (!this.circlePage) {
            let edge = this._isMoveEdge();
            if (dt < 0 && edge.top) {
                log("");
                return;
            }
            if (dt > 0 && edge.bottom) {
                log("");
                return;
            }
        }
        for (let i = 0; i < this.childs.length; i++) {
            this._checkChildY(this.childs[i], this.childs[i].position.y + dt);
        }
    }


    update(dt) {
        if (this.isTouching || !this.isTest) {
            return;
        }
        let stepy = this._toMove * dt * this.scrollSpeed;
        let ly = this.childs[this.moveAim].position.y;
        for (let i = 0; i < this.childs.length; i++) {
            this._checkChildY(this.childs[i], this.childs[i].position.y + stepy);
        }

        let y = this.childs[0].position.y;
        let idx = Math.round(y / this.delta);
        let tox = this.delta * idx;
        let cy = this.childs[this.moveAim].position.y;
        if (ly * cy < 0 && Math.abs(cy) < this.delta) {
            this.isTest = false;
            for (let i = 0; i < this.childs.length; i++) {
                if (Math.abs(this.childs[i].position.y) <= Math.abs(stepy)) {
                    this.currentIndex = i;
                    break;
                }
            }
            for (let i = 0; i < this.childs.length; i++) {
                this._checkChildY(this.childs[i], this.childs[i].position.y + tox - y);
            }
            let event = {
                target: this,
                type: EventType.SCROLL_END,
                index: this.currentIndex
            };
            EventHandler.emitEvents(this.selectEvents, event);
        }
    }
}
