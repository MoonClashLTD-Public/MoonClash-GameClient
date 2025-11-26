import { _decorator, Component, Node, instantiate, Label, log } from 'cc';
import { Message } from '../../../core/common/event/MessageManager';
import { CommonUtil } from '../../../core/utils/CommonUtil';
import { CardPrefab, CardPrefabType } from '../../common/common/CardPrefab';
import { GameEvent } from '../../common/config/GameEvent';
import { DataEvent } from '../../data/dataEvent';
import { PlayerManger } from '../../data/playerManager';
import { ResManger } from '../../data/resManger';
import { ECardSystemPop } from '../utils/enum';
import { BtmItemCardClickListener } from '../utils/fun';
const { ccclass, property } = _decorator;

@ccclass('CSPopBtmNode')
export class CSPopBtmNode extends Component {
    @property(Label)
    private cardNumLb: Label = null
    @property(Node)
    private myCards: Node
    private itemFunc?: BtmItemCardClickListener
    private get cardPrefab() {
        return ResManger.getInstance().getCardPrefab()
    }

    private get cardGroupManager() {
        return PlayerManger.getInstance().cardManager.playCardGroup
    }

    private get cardManager() {
        return PlayerManger.getInstance().cardManager.playCard
    }

      
    private cardTypeId: number
    init(param?: { cardTypeId: number, itemCb?: BtmItemCardClickListener }) {
        this.itemFunc = param?.itemCb
        this.cardTypeId = param.cardTypeId
        this.upCards()
    }

    private _cardKV: { [key: number]: CardPrefab } = [];
    private flag = 1
    private async upCards() {
        this.flag++
        const cardCom = await this.cardPrefab
        let currFlay = this.flag
        let cardIds = this.cardManager.getCardTypeGroupSortByGId(this.cardTypeId) || []
        const cardGroupCards = this.cardGroupManager.getCurrCardGroupCards()
        this.myCards.destroyAllChildren()
        let maxLen = 0
        let hasLen = 0
        for (const key in cardIds) {
            if (maxLen % 50 == 0) await CommonUtil.waitCmpt(this, 0)
            if (currFlay != this.flag) break
            const cardId = cardIds[key]
            // if (CardSystemUtils.isHiddenByCardId(cardId)) continue
            let cardNode = instantiate(cardCom);
            this.myCards.addChild(cardNode)
            const cardPrefab = cardNode.getComponent(CardPrefab)
            cardPrefab.init({
                id: cardId,
                cardPrefabType: CardPrefabType.NumInfoHasPower,
                cb: () => this.itemFunc(ECardSystemPop.KNAPSACK_CARD_INFO, cardPrefab),
                userOtherGroup: this.cardGroupManager.hasOtherCardGroup(this.cardTypeId, cardId)
            })
            this._cardKV[cardId] = cardPrefab
            maxLen++
        }
        cardGroupCards.forEach((card) => {
            const cardId = card?.id ?? 0
            if (this._cardKV[cardId]) {
                hasLen++
                this._cardKV[cardId].node.active = false
            }
        })
        this.cardNumLb.string = `${maxLen - hasLen}/${maxLen}`
    }

    onLoad() {
        this.addEvent();
    }

    onDestroy() {
        this.removeEvent();
    }

      
    private addEvent() {
        Message.on(GameEvent.CardGroupDataRefresh, this.upCards, this);
        Message.on(DataEvent.DATA_CURRCARDGROUPID_CHANGE, this.upCards, this);
        Message.on(GameEvent.CardDataRefresh, this.upCards, this);
    }

      
    private removeEvent() {
        Message.off(GameEvent.CardGroupDataRefresh, this.upCards, this);
        Message.off(DataEvent.DATA_CURRCARDGROUPID_CHANGE, this.upCards, this);
        Message.off(GameEvent.CardDataRefresh, this.upCards, this);
    }
}

