import { _decorator, Component, EditBox } from 'cc';
import { oops } from '../../core/Oops';
import HttpHome from '../common/net/HttpHome';
const { ccclass, property, type } = _decorator;

@ccclass('ShareParentCodePopUp')
export class ShareParentCodePopUp extends Component {
    @type(EditBox)
    editBox: EditBox = null;
    cb?: Function = null;
    start() {

    }

    update(deltaTime: number) {

    }

    onAdded(param: { cb: Function }) {
        this.cb = param?.cb;
    }

    async confimClick() {
        let inviteCode = this.editBox.string;
        if (!!!inviteCode) {
            oops.gui.toast("ValidationError", true);
            return
        }
        let _d = await HttpHome.bindInviter(inviteCode);
        if (_d) {
            oops.gui.toast("tip_ok", true);
            this.cb && this.cb();
            this.closeClick();
        }
    }

    closeClick() {
        oops.gui.removeByNode(this.node, true);
    }
}