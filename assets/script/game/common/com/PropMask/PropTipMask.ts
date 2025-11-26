import { _decorator, Component, Node } from 'cc'
import { LanguageLabel } from '../../../../core/gui/language/LanguageLabel'
import { oops } from '../../../../core/Oops'
import TableNfts from '../../table/TableNfts'
import { PropItem } from './PropItem'
const { ccclass, property } = _decorator

@ccclass('PropTipMask')
export class PropTipMask extends Component {
    @property(LanguageLabel)
    private propName: LanguageLabel = null
    @property(LanguageLabel)
    private propDesc: LanguageLabel = null
    @property(PropItem)
    private propItem: PropItem = null

    private config: IPropTipMaskCfg
    onAdded(params: IPropTipMaskCfg) {
        if (!params.clickNode) throw new Error("params click node null");
        this.config = params
        this.node.active = true
        const propType = params.type
        // const propData = PlayerManger.getInstance().playerSelfInfo.getPropDataByType(propType)
        // const propCfg = PlayerManger.getInstance().playerSelfInfo.getPropTableCfgByType(propType)
        this.propItem.upData(propType, params.cost || 0)
        const cfg = TableNfts.getInfoByMaterialType(propType)
        this.propName.dataID = cfg?.display_name || ''
        this.propDesc.dataID = cfg?.description || ''
        this.propItem.node.setWorldPosition(params.clickNode.getWorldPosition())
    }

    onDestroy() {
        this.config = null
    }

    private onClose() {
        oops.gui.removeByNode(this.node, true)
    }

}

export interface IPropTipMaskCfg {
    clickNode: Node
    type: core.NftMaterialType
    cost?: number
}
