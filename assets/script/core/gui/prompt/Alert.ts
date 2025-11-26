import { _decorator, Component, Node, Sprite, Label, Toggle } from 'cc';
import { CurrType } from '../../../game/walletUI/WalletUtil';
import { oops } from '../../Oops';
import { LanguageLabel } from '../language/LanguageLabel';
const { ccclass, property } = _decorator;

@ccclass('Alert')
export class Alert extends Component {
    @property(Node)
    closeBtn: Node = null;
    @property(Node)
    okBtn: Node = null;
    @property(Node)
    cancelBtn: Node = null;
    @property(Sprite)
    warnSpr: Sprite = null;
    @property(LanguageLabel)
    titleLbl: LanguageLabel = null;
    @property(LanguageLabel)
    contentI18Lbl: LanguageLabel = null;
    @property(Label)
    contentLbl: Label = null;
    @property(Node)
    costNode: Node = null;
    @property(Node)
    toggleNode: Node = null;

    param: AlertParam;
    start() {

    }

    update(deltaTime: number) {

    }

    onAdded(param: AlertParam) {
        param.isAutoClose = param.isAutoClose ?? true;
        this.param = param;
        if (param.titleDataID)
            this.titleLbl.dataID = param.titleDataID;
        if (param.i18DataID)
            this.contentI18Lbl.dataID = param.i18DataID;
        if (param.content)
            this.contentLbl.string = param.content;
        this.contentI18Lbl.node.active = !!param.i18DataID;
        this.contentLbl.node.active = !!param.content;

        this.warnSpr.node.active = !!param.isWarning;
        this.costNode.active = false;

        this.toggleNode.active = !!param.toggleInfo;
        if (param.toggleInfo) {
            this.toggleNode.getComponentInChildren(LanguageLabel).dataID = param.toggleInfo.i18DataID;
            this.toggleNode.getComponentInChildren(Toggle).isChecked = param.toggleInfo.isChecked;
        }

        this.okBtn.getComponentInChildren(LanguageLabel).dataID = param.okI18DataID ?? "common_prompt_ok";
        this.cancelBtn.getComponentInChildren(LanguageLabel).dataID = param.cancelI18DataID ?? "common_prompt_cancal";

        this.closeBtn.active = false;
        this.cancelBtn.active = !!this.param.cancelCB;
        this.okBtn.active = !!this.param.okCB;
    }

    onRemoved() {
    }


    okClick() {
        this.param.okCB && this.param.okCB(this.toggleNode.getComponentInChildren(Toggle).isChecked);
        if (this.param.isAutoClose)
            oops.gui.removeByNode(this.node);
    }

    closeClick() {
        this.param.cancelCB && this.param.cancelCB();
        if (this.param.isAutoClose)
            oops.gui.removeByNode(this.node);
    }
}


export interface AlertParam {
    isAutoClose?: boolean;
    titleDataID?: string;
    i18DataID?: string;
    content?: string;
    isWarning?: boolean;
    cost?: {
        costType: CurrType,
        num: number,
    }
    toggleInfo?: {
        i18DataID: string;
        isChecked: boolean;
    }
    okI18DataID?: string;
    cancelI18DataID?: string;
    okCB?: (...args) => void;
    cancelCB?: () => void;
}
