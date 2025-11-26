import { _decorator, Component, Node, Vec3, log, UITransform, v2, instantiate } from 'cc';
import { Message } from '../../core/common/event/MessageManager';
import { oops } from '../../core/Oops';
import { CSCardTouchCom } from '../card/com/CSCardTouchCom';
import { CardPrefab, CardPrefabType } from '../common/common/CardPrefab';
import { GameEvent } from '../common/config/GameEvent';
import { PlayerManger } from '../data/playerManager';
import { PVECardGroup } from './com/PVECardGroup';
const { ccclass, property } = _decorator;

@ccclass('PVEFightPop')
export class PVEFightPop extends Component {
    @property(PVECardGroup)
    private cardGroup: PVECardGroup = null

    @property(Node)
    private moveNode: Node = null


    private config: IPVEFullCardGroupConfig
    private cardTouch: CSCardTouchCom
    onAdded(config: IPVEFullCardGroupConfig) {
        this.config = config
        this.cardGroup.init({
            openAnim: true,
            cb1: this.clickCardGroupItem.bind(this),
            cb2: this.clickCardGroupItem.bind(this)
        })
        this.cardTouch = this.getComponentInChildren(CSCardTouchCom)
        this.cardTouch?.addListener({ end: (v) => this.moveEndListener(v) })
        this.updateMoveCard()
    }

    clickCardGroupItem(cardNode, idx) {
        if (cardNode && this.cardTouch?.canClick) {
            const cardId = this.config?.card?.id || 0
            if (idx != -1 && cardId != 0) {
                const copyCard = instantiate(cardNode.node)
                copyCard.setWorldPosition(cardNode.node.worldPosition)
                this.selectNode = copyCard
                this.selectCard = cardNode?.cardInfoCom?.getCardData()
                this.cardTouch.setCopyNode()
                this.config.cb && this.config.cb(cardId, idx)
                return
            }
            this.cardTouch.setMoveNodeStatus(false)
        }
    }

    private updateMoveCard() {
        const moveCard = this.moveNode?.getComponent(CardPrefab)
        moveCard.init({
            card: this.config.card,
            cardPrefabType: CardPrefabType.NumInfoNoPower
        })
        moveCard.cardTopCom.openAssist(PlayerManger.getInstance().pveInfo.isPVEAssist(this.config.card?.id))
    }

    private selectNode: Node
    private selectCard: core.ICard
    private moveEndListener(v: Vec3) {
        const selectCardIndx = this.cardGroup?.cardNodes?.findIndex((roleCard) => {
            const ui = roleCard.node?.getComponent(UITransform)
            let bf = ui.getBoundingBoxToWorld().contains(v2(v.x, v.y));
            return bf
        })
        const cardId = this.config?.card?.id || 0
        if (selectCardIndx != -1 && cardId != 0) {
            const selectPrefab = this.cardGroup.cardNodes[selectCardIndx]
            const copyCard = instantiate(selectPrefab.node)
            copyCard.setWorldPosition(selectPrefab.node.worldPosition)
            this.selectNode = copyCard
            this.selectCard = selectPrefab?.cardInfoCom?.getCardData()
            this.config.cb && this.config.cb(cardId, selectCardIndx)
            return
        }
        this.cardTouch.setMoveNodeStatus(false)
    }
    private async PVECardGroupSaveRefresh(event, ok: boolean) {
        if (ok) {
            this.config.card = this.selectCard
            this.updateMoveCard()
            await this.cardTouch.setMoveNodeStatus(true, this.selectNode)
            this.selectNode.destroy()
            this.selectNode = null
            this.selectCard = undefined
        } else {
            await this.cardTouch.setMoveNodeStatus(false)
            this.selectNode.destroy()
            this.selectNode = null
            this.selectCard = undefined
        }
    }

    onLoad() {
        this.addEvent();
    }

    onDestroy() {
        this.removeEvent();
        this.selectNode?.destroy()
        this.selectNode = null
        this.config = null
    }
    addEvent() {
        Message.on(GameEvent.PVECardGroupSaveRefresh, this.PVECardGroupSaveRefresh, this);
    }
    removeEvent() {
        Message.off(GameEvent.PVECardGroupSaveRefresh, this.PVECardGroupSaveRefresh, this);
    }
    private onCancel() {
        oops.gui.removeByNode(this.node, true)
    }
}

export interface IPVEFullCardGroupConfig {
      
    card: core.ICard
    cb: (cardId: number, cardGroupIdx: number) => void
}

