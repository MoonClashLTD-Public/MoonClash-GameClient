import { _decorator, Component, instantiate, Node } from 'cc';
import { Message } from '../../../core/common/event/MessageManager';
import { GameEvent } from '../../common/config/GameEvent';
import { PlayerManger } from '../../data/playerManager';
import { EquipAttrItem } from './EquipAttrItem';
const { ccclass, property } = _decorator;
@ccclass('EquipAttrCom')
export class EquipAttrCom extends Component {
    private copyAttrItem: Node = null
    private attrKV: { [key: string]: EquipAttrItem } = {}

    private cardIds: number[]
    private openToogle: boolean
    init(id: number[], openToogle = false) {
        this.cardIds = id
        this.openToogle = openToogle
        this.upViews()
    }

    private upEquip() {
        this.currId = -1
        this.upViews()
    }

    private upViews() {
        this.node.destroyAllChildren()
        this.attrKV = {}
        let i = 1
        for (const cardId of this.cardIds) {
            const attrs = PlayerManger.getInstance().equipManager.playEquips.getDispostionCfgById({ netId: cardId }).list
            for (const key in attrs) {
                const attr = attrs[key]
                const item = instantiate(this.copyAttrItem)
                const equipAttrItem = item.getComponent(EquipAttrItem)
                this.node.addChild(item)
                equipAttrItem.init(i, attr)
                if (this.openToogle) {
                    equipAttrItem.openToogle((b, id) => this.setChoose(attr.attrId))
                    if (this.currId == -1) {
                        this.currId = attr.attrId
                        equipAttrItem.setSelect(true)
                    } else {
                        equipAttrItem.setSelect(false)
                    }
                    this.attrKV[attr.attrId] = equipAttrItem
                }
                i++
            }
        }
    }

    private currId = -1
    private setChoose(attrId: number) {
        if (this.currId == attrId) return
        const prevItem = this.attrKV[this.currId]
        const currItem = this.attrKV[attrId]
        if (prevItem) prevItem.setSelect(false)
        if (currItem) currItem.setSelect(true)
        this.currId = attrId
    }

    getSelectAttrId() {
        if (this.currId == -1) return
        return this.currId
    }

    onLoad() {
        if (!this.copyAttrItem) this.copyAttrItem = instantiate(this.node.children[0])
        this.addEvent();
    }

    onDestroy() {
        this.copyAttrItem = null
        this.removeEvent();
    }

      
    private addEvent() {
        Message.on(GameEvent.EquipDataRefresh, this.upEquip, this);
        Message.on(GameEvent.EquipSingleRefresh, this.upEquip, this);
    }

      
    private removeEvent() {
        Message.off(GameEvent.EquipDataRefresh, this.upEquip, this);
        Message.off(GameEvent.EquipSingleRefresh, this.upEquip, this);
    }
}

