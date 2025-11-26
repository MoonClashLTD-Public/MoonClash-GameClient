import { _decorator, Component, Node, Event } from 'cc';
import { LanguageLabel } from '../../../core/gui/language/LanguageLabel';
import { FunComp } from '../widget/FunComp';
const { ccclass, property, type } = _decorator;

@ccclass('SortComp')
export class SortComp extends Component {
    @type(Node)
    itemNode: Node = null;
    cb: Function = null;
    lblKeys: { [key: number]: string } = {}
    start() {

    }

    update(deltaTime: number) {

    }

    init(lblKeys: { [key: number]: string }) {
        this.lblKeys = lblKeys;
        this.itemNode.children.forEach((e) => e.active = false);
        let idx = 0;
        for (const key in lblKeys) {
            let item = lblKeys[key];
            let node = this.itemNode.children[idx];
            node.active = true;
            node.getComponentInChildren(LanguageLabel).dataID = item;
            idx++;
        }
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

