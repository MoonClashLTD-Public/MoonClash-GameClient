import { _decorator, Component, Node, EventTouch, v3, Vec3, Prefab, instantiate } from 'cc';
import { resLoader } from '../../../core/common/loader/ResLoader';
import { CommonUtil } from '../../../core/utils/CommonUtil';
import { PlayerManger } from '../../data/playerManager';
import { IDispostionCfg } from '../contants/CardCost';
import { CardUtils } from '../utils/CardUtils';
import { PropAttrItem } from './PropAttrItem';
import { PropDefItem } from './PropDefItem';
import { PropSelectPop } from './PropSelectPop';
const { ccclass, property } = _decorator;
export interface IPropSelectedItem {
    status: core.NftMaterialType
    v3: Vec3
    attInd: number
}

export type PropSelectFunction = (item: IPropSelectedItem) => void;
@ccclass('PropSelectCom')
export class PropSelectCom extends Component {
    @property(PropSelectPop)
    private selectPop: PropSelectPop = null
    @property(Node)
    private attsPNode: Node = null;
    @property(Node)
    private propPNode: Node = null;
    private propItems: PropDefItem[] = []
    private currPropStatus: core.NftMaterialType = core.NftMaterialType.MaterialNone
    private currAttrInd = -1
    private currPropInd = -1
    private prevPropInd = -1

    private get attrItem(): Prefab {
        return resLoader.get("common/prefab/homePrefab/select/attrItem", Prefab)!;
    }
    private get propItem(): Prefab {
        return resLoader.get("common/prefab/homePrefab/select/propItem", Prefab)!;
    }

    params: IInitPropSelect
    attrIds: number[] = []
    init(params?: IInitPropSelect) {
        this.params = params
        if (!this.attrItem || !this.propItem) {
            this.attsPNode.active = false
            this.propPNode.active = false
        } else {
            this.attsPNode.active = true
            this.propPNode.active = true
            const cards = CardUtils.getDispostionItems({ cardId: this.params?.cardId })
            if (cards) {
                this.updateItems(cards)
                this.selectPop?.init(cards)
                if (this.propItems.length != 0) this.propClickItem(null, '0')
            } else {
                this.updateItems(null)
                this.selectPop?.init(null)
                this.currPropStatus = core.NftMaterialType.MaterialNone
            }
        }
    }

    private updateItems(cards:
        IDispostionCfg[]
    ) {
        this.propItems = []
        this.attrIds = []
        this.attsPNode.destroyAllChildren()
        this.propPNode.destroyAllChildren()

        if (cards) {
            let cardInd = 0
            for (const key in cards) {
                const copyNode = instantiate(this.attrItem)
                this.attsPNode.addChild(copyNode)
                copyNode.active = true
                const attrItem = copyNode.getComponent(PropAttrItem)
                if (attrItem) {
                    attrItem.init(cards[key])
                    CommonUtil.addClickTouch(copyNode, this.node, 'attrClickItem', 'PropSelectCom', { customEventData: `${cardInd}` })
                }
                this.attrIds.push(Number(key))
                cardInd++
            }
        }

        const propLen = this.params?.props?.length || 0
        for (let index = 0; index < propLen; index++) {
            const status = this.params.props[index]
            const copyNode = instantiate(this.propItem)
            this.propPNode.addChild(copyNode)
            copyNode.active = true
            const defItem = copyNode.getComponent(PropDefItem)
            if (defItem) {
                CommonUtil.addClickTouch(copyNode, this.node, 'propClickItem', 'PropSelectCom', { customEventData: `${index}` })
                defItem.init(status)
                const bgNode = defItem.ccBg
                if (bgNode) bgNode.active = false
                this.propItems.push(defItem)
            }
        }
    }

    private attrClickItem(e: EventTouch, customEventData: string) {
        if (this.currPropStatus == core.NftMaterialType.MaterialLuckyStone) {
            this.currAttrInd = Number(customEventData)
            const vnode = (e.currentTarget as Node)
            const vPos = vnode.getWorldPosition()
            this.clickItemListener({ status: this.currPropStatus, v3: vPos, attInd: this.currAttrInd })
        }
    }

    private propClickItem(e: EventTouch, customEventData: string) {
        const clickIdx = Number(customEventData)
        if (this.propItems.length == 0 || this.currPropInd == clickIdx) return
        this.prevPropInd = this.currPropInd
        this.currPropInd = clickIdx
        if (this.prevPropInd != -1) this.propItems[this.prevPropInd].ccBg.active = false
        if (this.currPropInd != -1) this.propItems[this.currPropInd].ccBg.active = true
        if (clickIdx == 1) {
            this.currPropStatus = core.NftMaterialType.MaterialLuckyStone
            this.currAttrInd = 0
            const vnode = this.attsPNode.children[this.currAttrInd]
            const vPos = vnode.getWorldPosition()
            this.clickItemListener({ status: this.currPropStatus, v3: vPos, attInd: this.currAttrInd })
        } else {
            this.currPropStatus = core.NftMaterialType.MaterialAmnesiaDrug
            this.currAttrInd = -1
            const vPos = this.node.getWorldPosition()
            this.clickItemListener({ status: this.currPropStatus, v3: vPos, attInd: -1 })
        }
    }

    private clickItemListener(params: IPropSelectedItem) {
        this.selectPop?.show(params)
    }

    getSelectAttr(): { status: core.NftMaterialType, attrId: number } {
        return { attrId: this.attrIds[this.currAttrInd], status: this.currPropStatus }
    }

    getPropName() {
        if (this.currPropInd == -1) return
        return this.propItems[this.currPropInd].propName
    }
}

export interface IInitPropSelect {
    cardId: number
    props: core.NftMaterialType[]
}

