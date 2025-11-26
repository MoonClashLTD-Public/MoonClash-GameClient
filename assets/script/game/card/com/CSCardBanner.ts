import { _decorator, Component, Node, instantiate, Prefab, Vec3, log, Label } from 'cc';
import { Message } from '../../../core/common/event/MessageManager';
import { BBoxCardCfg } from '../../common/blindBox/BBoxTableCards';
import { CardPrefab, CardPrefabParam, CardPrefabType } from '../../common/common/CardPrefab';
import { GameEvent } from '../../common/config/GameEvent';
import { EquipmentPrefab, EquipPrefabParam, EquipPrefabType } from '../../common/equipment/EquipmentPrefab';
import { CardCfg } from '../../common/table/TableCards';
import { PlayerManger } from '../../data/playerManager';
import { CardSystemUtils } from '../utils/cardSystemUtils';
import { CardGroupClickItemListener } from '../utils/fun';
const { ccclass, property } = _decorator;
export type CardBanerItemFunction = (node: Node, vec: Vec3, show: boolean, info: BBoxCardCfg) => void;
@ccclass('CSCardBanner')
export class CSCardBanner extends Component {
    @property([CardPrefab])
    private cardPrefabs: CardPrefab[] = []
    @property([EquipmentPrefab])
    private equipCards: EquipmentPrefab[] = []
    @property(Label)
    private needFoodLb: Label = null
    @property(Node)
    private addPower: Node = null

    private get playerManager() {
        return PlayerManger.getInstance()
    }
    private get equipManager() {
        return PlayerManger.getInstance().equipManager
    }
    get cardNodes() {
        return this.cardPrefabs
    }
    private _cardCfg: CardCfg
    get propCfg() {
        return this._cardCfg
    }

    private _materialId = 0
    get materialId() {
        return this._materialId
    }
      
      
    private cardsCosts: { cost: number, power: number }[] = []
    private _minCost: number
      
    private _canClick = true
    get canClick() {
        return this._canClick
    }
    private config: IInitCardBannner
    init(params: IInitCardBannner) {
        this.config = params
        this.upCards()
        this.upEquips()
    }

    getNeedPropNum(sliderNum: number) {
        let curPropNum = 0
        for (const cardCost of this.cardsCosts) {
            let diff = (sliderNum - cardCost.power)
            if (diff > 0) curPropNum += diff * cardCost.cost
        }
        return curPropNum
    }

    upCards() {
        const _openCardAnim = this.config?.openCardAnim || false
        const _hasBtm = this.config?.hasBtm ?? true
        let totalFood = 0
        let len = 0
        let materialId = 0
        this.cardsCosts = []
        let minCost = -1
        const _cardIds = this.playerManager.cardManager.playCardGroup.getCardGroupByIdx(this.config.groupIdx)?.cards || []
        this.cardPrefabs.forEach((cardPrefab, i) => {
            const _cardId = _cardIds[i]?.id ?? 0
            const cardParam: CardPrefabParam = {
                id: _cardId,
                cardPrefabType: CardPrefabType.None
            }
            if (_cardId != 0) {
                if (this.config.fun?.itemClick) cardParam.cb = () => this.config.fun.itemClick(cardPrefab, i)
                if (this.config.fun?.removeClick) cardParam.remove = () => this.config.fun.removeClick(cardPrefab, i)
                cardParam.cardPrefabType = CardPrefabType.NewInfoBannerHasDelete
            }
            cardPrefab?.init(cardParam)
            const cardInfoCom = cardPrefab.cardInfoCom
            if (cardInfoCom && _cardId != 0) {
                const cardCfg = cardInfoCom.getCardCfg()
                const cnt = cardCfg.reset_power_cost.materials[0].cnt || 0
                materialId = cardCfg.reset_power_cost.materials[0].id
                const cardData = cardInfoCom.getCardData()
                totalFood += cardCfg?.cost || 0
                len += 1
                this._cardCfg = cardCfg
                if (minCost == -1) {
                    minCost = cardData.power
                } else {
                    minCost = Math.min(cardData.power, minCost)
                }
                this.cardsCosts.push({ cost: cnt, power: cardData.power })
                if (this._canClick) this._canClick = CardSystemUtils.canClickBtn({ card: cardData })
            }
            if (_openCardAnim) cardPrefab.rumAnim()
        })
        if (totalFood == 0) this._canClick = false
        if (this.addPower) this.addPower.active = _hasBtm
        if (this.needFoodLb) this.needFoodLb.string = `${len > 0 ? (totalFood / len).toFixed(1) : '0'}`
        this._materialId = materialId
        this._minCost = minCost == -1 ? 0 : minCost
    }

    private _equipKV: { [key: number]: EquipmentPrefab } = [];
    upEquips() {
        const _equipGroup = this.equipManager.playEquipGroup.getCardGroupByIdx(this.config.groupIdx)
        this.equipCards.forEach((equipCard, i) => {
            const equipId = _equipGroup.equipments[i]?.id ?? 0

            const equipParam: EquipPrefabParam = {
                id: equipId,
                equipPrefabType: EquipPrefabType.None,
            }
            if (equipId != 0) {
                equipParam.equipPrefabType = EquipPrefabType.NewInfoBannerHasDelete
                if (this.config.fun?.itemEquipClick) equipParam.cb = () => this.config.fun.itemEquipClick(equipCard)
                if (this.config.fun?.removeEquipClick) equipParam.remove = () => this.config.fun.removeEquipClick(equipCard, i)
            }
            equipCard?.init(equipParam)
            if (equipId != 0) {
                const hasHot = this.equipManager.equipHots.has(equipId)
                if (hasHot) equipCard.openHot(true)
                if (hasHot) this._equipKV[equipId] = equipCard
            }
        })
    }

    private hotRefresh(event, cardId: number) {
        if (this._equipKV[cardId]) this._equipKV[cardId].openHot(false)
    }

    get minCost() {
        return this._minCost
    }

    async onLoad() {
        this.addEvent();
    }

    onDestroy() {
        this.removeEvent();
    }

      
    private addEvent() {
        Message.on(GameEvent.EquipHotDeleteRefresh, this.hotRefresh, this);
    }

      
    private removeEvent() {
        Message.off(GameEvent.EquipHotDeleteRefresh, this.hotRefresh, this);
    }
}

export interface IInitCardBannner {
    groupIdx: number
    openCardAnim?: boolean
    fun?: CardGroupClickItemListener
    hasBtm?: boolean
}

