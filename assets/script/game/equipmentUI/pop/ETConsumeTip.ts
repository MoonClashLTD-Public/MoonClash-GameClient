import { _decorator, Component, Node, Label } from 'cc'
import { LanguageLabel } from '../../../core/gui/language/LanguageLabel';
import { oops } from '../../../core/Oops'
import { CommonUtil } from '../../../core/utils/CommonUtil';
const { ccclass, property } = _decorator

@ccclass('ETConsumeTip')
export class ETConsumeTip extends Component {
    @property(LanguageLabel)
    private title: LanguageLabel = null;
    @property(LanguageLabel)
    private des1: LanguageLabel = null;
    @property(LanguageLabel)
    private des2: LanguageLabel = null;
    @property(Node)
    private dggNode: Node = null;
    @property(Node)
    private dnaNode: Node = null;
    @property(Node)
    private cardNode: Node = null;
    @property(Node)
    private stoneNode: Node = null;
    @property(Label)
    private dggNumLb: Label = null;
    @property(Label)
    private dnaNumLb: Label = null;
    @property(Label)
    private cardNumLb: Label = null;
    @property(Label)
    private stoneNumLb: Label = null;
    @property(LanguageLabel)
    private gasLb: LanguageLabel = null

    private config: ETUseTipPopConfig

    public onAdded(params: ETUseTipPopConfig = {}) {
        this.config = params;
        this.node.active = true
        if (params.titleDataID) this.title.dataID = params.titleDataID;
        if (params.desc1DataID) this.des1.dataID = params.desc1DataID;
        if (params.desc2DataID) this.des2.dataID = params.desc2DataID;
        this.setNum(this.dggNode, this.dggNumLb, params?.dggNum)
        this.setNum(this.dnaNode, this.dnaNumLb, params?.dnaNum)
        this.setNum(this.cardNode, this.cardNumLb, params?.cardNum)
        this.setNum(this.stoneNode, this.stoneNumLb, params?.stoneNum)
        this.setGas()
    }

    private setGas() {
        const gasStr = this.config.gas
        if (Number(gasStr) > 0) {
            this.gasLb.node.active = true
            this.gasLb.params[0].value = `${CommonUtil.weiToEther(gasStr).toFixed()}`;
            this.gasLb.forceUpdate()
        } else {
            this.gasLb.node.active = false
        }
    }

    private setNum(node: Node, lb: Label, num: number) {
        const _num = num ?? 0;
        if (_num == 0) {
            node.active = false
        } else {
            node.active = true
            lb.string = _num.toString()
        }
    }

    private onOk() {
        this.config.okFunc && this.config.okFunc();
        this.close()
    }

    private onClose() {
        this.config.closeFunc && this.config.closeFunc();
        this.close()
    }

    private close() {
        oops.gui.removeByNode(this.node)
        this.config.removePop && this.config.removePop();
    }

    onDestroy() {
        this.config = null
    }
}

export interface ETUseTipPopConfig {
    titleDataID?: string;
    desc1DataID?: string;
    desc2DataID?: string;
    dggNum?: number;
    dnaNum?: number;
    cardNum?: number;
    stoneNum?: number;
    gas?: string
    okFunc?: Function   
    closeFunc?: Function   
    removePop?: Function   
}