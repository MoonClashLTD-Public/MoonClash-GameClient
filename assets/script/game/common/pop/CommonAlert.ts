import { _decorator, Component, Node } from 'cc'
import { LangLabelParamsItem, LanguageLabel } from '../../../core/gui/language/LanguageLabel'
import { oops } from '../../../core/Oops'
import { CommonUtil } from '../../../core/utils/CommonUtil'
const { ccclass, property } = _decorator

@ccclass('CommonAlert')
export class CommonAlert extends Component {
    @property(LanguageLabel)
    private tip: LanguageLabel
    @property(LanguageLabel)
    private content: LanguageLabel
    @property(Node)
    private cancelNode: Node
    @property(LanguageLabel)
    private cancelLab: LanguageLabel
    @property(LanguageLabel)
    private okLab: LanguageLabel
    @property(LanguageLabel)
    private gasLb: LanguageLabel = null
    private config: IAlertPopConfig = {}

    /**
  
     * {
  
  
  
  
  
  
  
     * }
     */
    public onAdded(params: IAlertPopConfig = {}) {
        this.config = params;
        this.setTitle()
        this.setContent()
        this.setBtnOkLabel()
        this.setBtnCancelLabel()
        this.setGas()
        this.node.active = true
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
    private setTitle() {
        if (this.config.title) {
            this.tip.node.active = true
            this.tip.dataID = this.config.title
        }
    }

    private setContent() {
        if (this.content) {
            this.content.dataID = this.config.content
            this.content.params = this.config.contentParams || []
        }
    }

    private setBtnOkLabel() {
        if (this.config.okWord) this.okLab.dataID = this.config.okWord
    }

    private setBtnCancelLabel() {
        this.cancelNode.active = this.config.needCancel || false
        if (this.config.cancelWord) this.cancelLab.dataID = this.config.cancelWord
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
        oops.gui.removeByNode(this.node, true)
        this.config.removePop && this.config.removePop();
    }

    onDestroy() {
        this.config = null
    }
}

export interface IAlertPopConfig {
    title?: string   
    content?: string   
    contentParams?: LangLabelParamsItem[]   
    okWord?: string   
    okFunc?: Function   
    cancelWord?: string   
    closeFunc?: Function   
    removePop?: Function   
    needCancel?: boolean   
    gas?: string
}