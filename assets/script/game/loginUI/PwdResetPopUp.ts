import { _decorator, Component, Node, EditBox, log, Event } from 'cc';
import { oops } from '../../core/Oops';
const { ccclass, property } = _decorator;

@ccclass('PwdResetPopUp')
export class PwdResetPopUp extends Component {
    start() {
    }

    update(deltaTime: number) {

    }
    public onAdded() {
    }

    public onRemoved() {
    }

    confirm() {

    }

    closeClick() {
        oops.gui.removeByNode(this.node);
    }
}

