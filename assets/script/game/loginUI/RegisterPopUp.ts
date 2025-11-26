import { _decorator, Component, Node, EditBox, log, Event } from 'cc';
import { oops } from '../../core/Oops';
import { UIID } from '../common/config/GameUIConfig';
const { ccclass, property } = _decorator;

@ccclass('RegisterPopUp')
export class RegisterPopUp extends Component {
    start() {
    }

    update(deltaTime: number) {

    }
    public onAdded() {
    }

    public onRemoved() {
    }

    clickTermsOfService() {
        oops.gui.open(UIID.TermsOfServicePopUp);
    }

    closeClick() {
        oops.gui.removeByNode(this.node);
    }
}

