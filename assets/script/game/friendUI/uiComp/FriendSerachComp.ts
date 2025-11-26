import { _decorator, Component, Node, EditBox } from 'cc';
import { oops } from '../../../core/Oops';
import { CommonUtil } from '../../../core/utils/CommonUtil';
import HttpHome from '../../common/net/HttpHome';
const { ccclass, property, type } = _decorator;

@ccclass('FriendSerachComp')
export class FriendSerachComp extends Component {
    @type(EditBox)
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

    serachClick() {
        let str = this.editBox.string;
        this.cb(str);
    }
}

