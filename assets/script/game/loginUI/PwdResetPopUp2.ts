import { _decorator, Component, Node, EditBox, log, Event } from 'cc';
import { oops } from '../../core/Oops';
import { UIID } from '../common/config/GameUIConfig';
const { ccclass, property } = _decorator;

@ccclass('PwdResetPopUp2')
export class PwdResetPopUp2 extends Component {
    start() {
    }

    update(deltaTime: number) {

    }
    public onAdded() {
    }

    public onRemoved() {
    }

    confirm() {
        oops.gui.open(UIID.PwdResetPopUp3)
    }

    closeClick() {
        oops.gui.removeByNode(this.node, true);
    }
}

