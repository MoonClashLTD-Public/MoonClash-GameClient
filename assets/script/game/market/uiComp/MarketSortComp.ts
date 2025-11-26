import { _decorator, Component, Node, Event } from 'cc';
const { ccclass, property, type } = _decorator;

@ccclass('MarketSortComp')
export class MarketSortComp extends Component {
    cb: Function = null;
    start() {

    }

    update(deltaTime: number) {

    }

    show(cb: Function) {
        this.node.active = true;
        this.cb = cb;
    }

    hide() {
        this.node.active = false;
    }

    btnClick(e: Event, customEventData: string) {
        this.cb && this.cb(Number(customEventData));
        this.hide();
    }
}

