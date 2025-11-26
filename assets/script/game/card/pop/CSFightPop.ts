import { _decorator, Component, Node, Vec3, log, UITransform, v2, instantiate } from 'cc';
import { Message } from '../../../core/common/event/MessageManager';
import { oops } from '../../../core/Oops';
import { CardPrefab, CardPrefabType } from '../../common/common/CardPrefab';
import { GameEvent } from '../../common/config/GameEvent';
import { PlayerManger } from '../../data/playerManager';
import { CSCardGroupBanner } from '../com/CSCardGroupBanner';
import { CSCardTouchCom } from '../com/CSCardTouchCom';
const { ccclass, property } = _decorator;

@ccclass('CSFightPop')
export class CSFightPop extends Component {
    @property(CSCardGroupBanner)
    private banners: CSCardGroupBanner
    @property(Node)
    private moveNode: Node = null

    private config: IFullCardGroupConfig
    private cardTouch: CSCardTouchCom
    onAdded(config: IFullCardGroupConfig) {
        this.config = config
        this.moveNode.active = true
        this.cardTouch = this.getComponentInChildren(CSCardTouchCom)
        const currPageIdex = PlayerManger.getInstance().cardManager.playCardGroup.getCurrCardGroupInd()
        this.cardTouch?.addListener({ end: (v) => this.moveEndListener(v) })
        this.banners.init({
            openCardAnim: true, hasBtm: false, listener: {
                onListPageChange: (pageNum) => {
                    if (currPageIdex != pageNum) {
                        this.cardTouch?.isHidden(true)
                    }
                },
                itemClick: (cardNode, idx) => {
                    if (cardNode && this.cardTouch?.canClick) {
                        const cardId = this.config?.id || 0
                        if (idx != -1 && cardId != 0) {
                            const copyCard = instantiate(cardNode.node)
                            copyCard.setWorldPosition(cardNode.node.worldPosition)
                            this.selectNode = copyCard
                            this.selectId = cardNode?.param?.id
                            this.cardTouch.setCopyNode()

                            this.config.cb && this.config.cb(this.config.id, idx)
                            return
                        }
                        this.cardTouch.setMoveNodeStatus(false)
                    }
                },
            }
        })
        this.banners.updateItems()
        this.updateMoveCard()
    }

    private updateMoveCard() {
        const moveCard = this.moveNode?.getComponent(CardPrefab)
        moveCard.init({
            id: this.config.id,
            cardPrefabType: CardPrefabType.NumInfoNoPower
        })
    }

    private selectNode: Node
    private selectId: number
    private moveEndListener(v: Vec3) {
        const curBanner = this.banners?.getCurPageBanner()
        if (curBanner) {
            const selectCardIndx = curBanner?.cardNodes?.findIndex((roleCard) => {
                const ui = roleCard.node?.getComponent(UITransform)
                let bf = ui.getBoundingBoxToWorld().contains(v2(v.x, v.y));
                return bf
            })
            const cardId = this.config?.id || 0
            if (selectCardIndx != -1 && cardId != 0) {
                const selectPrefab = curBanner.cardNodes[selectCardIndx]
                const copyCard = instantiate(selectPrefab.node)
                copyCard.setWorldPosition(selectPrefab.node.worldPosition)
                this.selectNode = copyCard
                this.selectId = selectPrefab?.param?.id
                // this.cardTouch.setMoveNodeActive(false, this.selectNode)
                this.config.cb && this.config.cb(this.config.id, selectCardIndx)
                return
            }
        }
        this.cardTouch.setMoveNodeStatus(false)
    }

    private async CSCardGroupSaveRefresh(event, ok: boolean) {
        if (ok) {
            this.config.id = this.selectId
            this.updateMoveCard()
            await this.cardTouch.setMoveNodeStatus(true, this.selectNode)
            this.selectNode?.destroy()
            this.selectNode = null
            this.selectId = -1
        } else {
            await this.cardTouch.setMoveNodeStatus(false)
            this.selectNode?.destroy()
            this.selectNode = null
            this.selectId = -1
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
        Message.on(GameEvent.CSCardGroupSaveRefresh, this.CSCardGroupSaveRefresh, this);
    }
    removeEvent() {
        Message.off(GameEvent.CSCardGroupSaveRefresh, this.CSCardGroupSaveRefresh, this);
    }

    private onCancel() {
        oops.gui.removeByNode(this.node, true)
    }
}

export interface IFullCardGroupConfig {
      
    id: number
    cb: (cardId: number, cardGroupIdx: number) => void
}

