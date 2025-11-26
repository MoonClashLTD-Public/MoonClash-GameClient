import { _decorator, Component, Sprite, Node } from 'cc';
import { LanguageLabel } from '../../../core/gui/language/LanguageLabel';
import TableNfts from '../table/TableNfts';
const { ccclass, property } = _decorator;


@ccclass('PropDefItem')
export class PropDefItem extends Component {
    @property(Sprite)
    private icon: Sprite = null
    @property(LanguageLabel)
    private nameLb: LanguageLabel = null
    @property(LanguageLabel)
    private descLb: LanguageLabel = null
    @property(Node)
    ccBg: Node = null
    init(status: core.NftMaterialType) {
        const cfg = TableNfts.getInfoByMaterialType(status)
        if (this.nameLb) this.nameLb.dataID = cfg?.display_name
        if (this.descLb) this.descLb.dataID = cfg?.description
    }

    get propName() {
        return this.nameLb?.string || ''
    }

}



