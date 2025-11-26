import { _decorator, Component, Node, Label, tween } from 'cc';
import { Message } from '../../core/common/event/MessageManager';
import { LanguageLabel } from '../../core/gui/language/LanguageLabel';
import { oops } from '../../core/Oops';
import { GameEvent } from '../common/config/GameEvent';
import { HomeTurnPagesParam } from '../homeUI/HomeBottom';
import { HOMEPAGEENUM } from '../homeUI/HomeEvent';
const { ccclass, property } = _decorator;

@ccclass('FriendBattleInvitePopUp')
export class FriendBattleInvitePopUp extends Component {
    @property(Node)
    closeBtn: Node = null;
    @property(Node)
    okBtn: Node = null;
    @property(Node)
    cancelBtn: Node = null;
    @property(Node)
    isEditNode: Node = null;
    @property(LanguageLabel)
    titleLbl: LanguageLabel = null;
    @property(Label)
    contentLbl: Label = null;
    @property(Label)
    timeCDLbl: Label = null;

    param: FriendBattleInvitePopUpParam;
    start() {

    }

    update(deltaTime: number) {

    }

    onAdded(param: FriendBattleInvitePopUpParam) {
        this.param = param;

        this.contentLbl.string = param.content;

        this.closeBtn.active = false;
        this.cancelBtn.active = !!this.param.cancelCB;
        this.okBtn.active = !!this.param.okCB;
        this.isEditNode.active = !!this.param.isEditNode;

        if (this.param.cd) {
            this.timeCDLbl.string = `(${this.param.cd})`;
            this.timeCDLbl.node.active = true;
            tween(this.node)
                .delay(1)
                .call(() => {
                    this.timeCDLbl.string = `(${this.param.cd--})`;
                })
                .union()
                .repeat(this.param.cd)
                .call(() => {
                    oops.gui.removeByNode(this.node, true);
                })
                .start();
        } else {
            this.timeCDLbl.node.active = false;
        }

        if (param.okI18Lbl)
            this.okBtn.getComponentInChildren(LanguageLabel).dataID = param.okI18Lbl;
        if (param.cancelI18Lbl)
            this.cancelBtn.getComponentInChildren(LanguageLabel).dataID = param.cancelI18Lbl;
    }

    onRemoved() {
    }

    goToEdit() {
        Message.dispatchEvent(GameEvent.HomeTurnPages, <HomeTurnPagesParam>{ page: HOMEPAGEENUM.CARDSPAGE });
        oops.gui.removeByNode(this.node, true);
    }

    async okClick() {
        let bf = this.param.okCB && await this.param.okCB();
        if (bf ?? true)
            oops.gui.removeByNode(this.node, true);
    }

    async closeClick() {
        let bf = this.param.cancelCB && await this.param.cancelCB();
        if (bf ?? true)
            oops.gui.removeByNode(this.node, true);
    }
}


export interface FriendBattleInvitePopUpParam {
    isEditNode?: boolean;
    content: string;
    cd?: number;
    okI18Lbl?: string;
    okCB?: (...args) => Promise<boolean>;
    cancelI18Lbl?: string,
    cancelCB?: () => Promise<boolean>;
}
