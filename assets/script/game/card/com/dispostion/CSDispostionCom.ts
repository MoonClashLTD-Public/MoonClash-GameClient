import { _decorator, Component, instantiate, Node } from 'cc';
import { CardUtils } from '../../../common/utils/CardUtils';
import { PlayerManger } from '../../../data/playerManager';
import { CSCardDispositionItem } from './CSCardDispositionItem';
const { ccclass, property } = _decorator;

@ccclass('CSDispostionCom')
export class CSDispostionCom extends Component {
    private copyAttrItem: Node = null
    private dispostionKV: { [key: string]: CSCardDispositionItem } = {}

    init(id: number, openToogle = false) {
        if (!this.copyAttrItem) this.copyAttrItem = instantiate(this.node.children[0])
        const disposCfgs = CardUtils.getDispostionItems({ cardId: id }) || []
        if (!disposCfgs) return
        this.node.destroyAllChildren()
        this.dispostionKV = {}
        this.currId = -1
        let i = 1
        for (const key in disposCfgs) {
            const attr = disposCfgs[key]
            const item = instantiate(this.copyAttrItem)
            this.node.addChild(item)
            const disItem = item.getComponent(CSCardDispositionItem)
            disItem?.init(i, attr)
            if (openToogle) {
                disItem.openToogle((b, id) => this.setChoose(attr.attrId))
                if (this.currId == -1) {
                    this.currId = attr.attrId
                    disItem.setSelect(true)
                } else {
                    disItem.setSelect(false)
                }
                this.dispostionKV[attr.attrId] = disItem
            }
            i++
        }
    }

    private currId = -1
    private setChoose(attrId: number) {
        if (this.currId == attrId) return
        const prevItem = this.dispostionKV[this.currId]
        const currItem = this.dispostionKV[attrId]
        if (prevItem) prevItem.setSelect(false)
        if (currItem) currItem.setSelect(true)
        this.currId = attrId
    }

    getSelectAttrId() {
        if (this.currId == -1) return
        return this.currId
    }
}

