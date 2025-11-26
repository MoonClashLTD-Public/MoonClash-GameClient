import { _decorator, Component, Node, Event, EditBox } from 'cc';
const { ccclass, property, type } = _decorator;

@ccclass('MarketSearchComp')
export class MarketSearchComp extends Component {
    @property(EditBox)
    editBox: EditBox = null;
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
        this.cb && this.cb(this.editBox.string);
        this.hide();
    }
}

