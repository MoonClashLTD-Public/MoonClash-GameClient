import { _decorator, Component, Node, EditBox, log, Event } from 'cc';
import { oops } from '../../core/Oops';
const { ccclass, property } = _decorator;

@ccclass('LoginAlertPopUp')
export class LoginAlertPopUp extends Component {
    start() {
    }

    update(deltaTime: number) {

    }
    public onAdded() {
    }

    public onRemoved() {
    }

    closeClick() {
        oops.gui.removeByNode(this.node);
    }
}

