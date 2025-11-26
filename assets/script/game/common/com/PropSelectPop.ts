import { _decorator, Component, v3, Prefab, instantiate, UITransform, BlockInputEvents } from 'cc';
import { resLoader } from '../../../core/common/loader/ResLoader';
import { IDispostionCfg } from '../contants/CardCost';
import { PropAttrItem } from './PropAttrItem';
import { IPropSelectedItem } from './PropSelectCom';
const { ccclass, property } = _decorator;

@ccclass('PropSelectPop')
export class PropSelectPop extends Component {
    private attrItem: Prefab = null;

    private isInitPrefab = false
    private initPrefab() {
        if (!this.isInitPrefab) {
            this.isInitPrefab = true
            this.node.addComponent(BlockInputEvents)
            this.attrItem = resLoader.get("common/prefab/homePrefab/select/attrItemSelected", Prefab)!;
        }
    }

    init(cards:
        IDispostionCfg[]
    ) {
        this.initPrefab()
        this.node.active = false
        this.updateItems(cards)
    }

    private _cardList: PropAttrItem[] = []
    private updateItems(cards: IDispostionCfg[]) {
        this.node.destroyAllChildren()
        if (!cards) return
        this._cardList = []
        for (const key in cards) {
            const copyNode = instantiate(this.attrItem)
            this.node.addChild(copyNode)
            copyNode.active = true
            const _attrItem = copyNode.getComponent(PropAttrItem)
            if (_attrItem) {
                _attrItem?.init(cards[key])
                this._cardList.push(_attrItem)
            }
        }
    }

      
    show(item: IPropSelectedItem) {
        if (item.status == core.NftMaterialType.MaterialAmnesiaDrug) {
            this.node.active = true
            for (const cardList of this._cardList) {
                cardList.node.active = true
            }
            this.node.getComponent(UITransform).setAnchorPoint(0.5, 1)
            this.node.setWorldPosition(v3(this.node.getWorldPosition().x, item.v3.y))
        // } else if (item.status == core.NftMaterialType.MaterialBlindGrass) {
        //     this.node.active = true
        //     let cardIndx = 0
        //     for (const key in this._cardList) {
        //         this._cardList[key].node.active = (cardIndx == item?.attInd)
        //         cardIndx++
        //     }
        //     this.node.getComponent(UITransform).setAnchorPoint(0.5, 0.5)
        //     this.node.setWorldPosition(v3(this.node.getWorldPosition().x, item.v3.y))
        } else {
            this.node.active = false
        }
    }
}

