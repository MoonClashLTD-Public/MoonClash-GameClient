import { _decorator, Component, Node, instantiate, Sprite, EventTouch, Toggle, tween, v3, Layout } from 'cc';
import { ECardSystemPop } from '../utils/enum';
import { PlayerManger } from '../../data/playerManager';
import { BtmItemCardClickListener } from '../utils/fun';
import { CardPrefab, CardPrefabType } from '../../common/common/CardPrefab';
import { ResManger } from '../../data/resManger';
import { Message } from '../../../core/common/event/MessageManager';
import { GameEvent } from '../../common/config/GameEvent';
import { CardTypeTabBar } from './tabBar/CardTypeTabBar';
import { DataEvent } from '../../data/dataEvent';
import { EquipTabBar } from '../../equipmentUI/com/EquipTabBar';
import { EquipmentPrefab, EquipPrefabType } from '../../common/equipment/EquipmentPrefab';
import { CommonUtil } from '../../../core/utils/CommonUtil';
import { EEquipmentPop } from '../../equipmentUI/utils/enum';
import TableEquip from '../../common/table/TableEquip';
import { BtmItemEquipClickListener } from '../../equipmentUI/utils/fun';
import { tips } from '../../../core/gui/prompt/TipsManager';
const { ccclass, property } = _decorator;

@ccclass('CSUIBtmNode')
export class CSUIBtmNode extends Component {
    @property(Node)
    private myCards: Node = null
    @property(Node)
    private noCards: Node = null
    @property(CardTypeTabBar)
    private cardTypeTabBar: CardTypeTabBar = null

    @property(EquipTabBar)
    private mTabBar: EquipTabBar = null
    @property(Node)
    private equipLayout: Node = null
    @property([Node])
    private cardNodes: Node[] = []
    @property([Node])
    private equipNodes: Node[] = []

    @property(Sprite)
    private cardTab: Sprite = null

    @property(Sprite)
    private equipTab: Sprite = null
    @property(Toggle)
    private iconToggle: Toggle = null

    private tabStatus: "CARD" | "EQUIP" = 'CARD'
    private oldTabStatus: "CARD" | "EQUIP" = 'EQUIP'

    private cardCb?: BtmItemCardClickListener
    private equipCb?: BtmItemEquipClickListener
    private get cardManager() {
        return PlayerManger.getInstance().cardManager
    }

    private get cardGroupManager() {
        return PlayerManger.getInstance().cardManager.playCardGroup
    }

    private get cardPrefab() {
        return ResManger.getInstance().getCardPrefab()
    }
    private get equipManager() {
        return PlayerManger.getInstance().equipManager
    }

    private get equipPrefab() {
        return ResManger.getInstance().getEquipPrefab()
    }

    init(param?: { cardCb: BtmItemCardClickListener, equipCb: BtmItemEquipClickListener }) {
        this.cardCb = param?.cardCb
        this.equipCb = param?.equipCb
        this.cardTypeTabBar.init({
            onChoose: async () => {
                await tips.showLoadingMask();
                await this.upHasCards()
                await CommonUtil.waitCmpt(this, 0.1)
                tips.hideLoadingMask();
            }
        })
        this.mTabBar.addListener(
            {
                init: (type) => this.refreshEquips(),
                itemClick: (type) => this.refreshEquips(),
            }
        )
    }

    onToggleChange() {
        for (const key in this._eOtherGKV) {
            this._eOtherGKV[key].node.active = this.iconToggle.isChecked
        }
        for (const key in this._cOtherGKV) {
            this._cOtherGKV[key].node.active = this.iconToggle.isChecked
        }
    }

    upNode() {
        if (this.tabStatus != this.oldTabStatus) {
            this.cardNodes.forEach(c => c.active = this.tabStatus == 'CARD')
            this.equipNodes.forEach(c => c.active = this.tabStatus == 'EQUIP')
            this.cardTab.node.active = this.tabStatus == 'CARD'
            this.equipTab.node.active = this.tabStatus == 'EQUIP'
            this.oldTabStatus = this.tabStatus
            this.cardTab
        }
        this.refreshCards()
        this.refreshEquips()
    }

    private _equipKV: { [key: number]: EquipmentPrefab } = [];
    private _cOtherGKV: { [key: number]: CardPrefab } = [];
    private _eOtherGKV: { [key: number]: EquipmentPrefab } = [];
    private cflag1 = 1
    private cflag2 = 1
    private eflag = 1
    private async refreshEquips() {
        if (this.tabStatus != "EQUIP") return
        if (!this.equipLayout) return
        this.eflag++
        const equipCom = await this.equipPrefab
        let currFlay = this.eflag
        const _cardGroupKV = this.equipManager.playEquipGroup.getCurrCardGroupKV()
        const _cardIds = this.equipManager.playEquips.equipIds || []

        this.mTabBar.setShowNum(_cardIds.length)

        // this.equipLayout?.destroyAllChildren()
        // this._equipKV = {}
        this._eOtherGKV = {}
        for (const key in this._equipKV) {
            let equip = this._equipKV[key];
            if (equip) {
                let idx = _cardIds.findIndex(e => e == equip.param.id);
                if (idx == -1) {
                    equip.node.destroy();
                    delete this._equipKV[key];
                }
            }
        }

        let equipNodes: Node[] = [];
        const currEquipType = this.mTabBar.equipType
        let count = 0
        let hotIdx = 0;
        for (const key in _cardIds) {
            if (currFlay != this.eflag) return
            const equipId = _cardIds[key]
            const equipData = this.equipManager.playEquips.getEquipmentById(equipId)
            const _equipCfg = TableEquip.getInfoById(equipData?.protoId)
            if (currEquipType != core.EquipmentType.EquipmentTypeNone) {
                if (_equipCfg.equipment_type != currEquipType) {
                    if (this._equipKV[equipId])
                        this._equipKV[equipId].node.active = false;
                    continue
                }
            }

            let copyPrefab: Node = null;
            if (this._equipKV[equipId]) {
                copyPrefab = this._equipKV[equipId].node;
            } else {
                if (hotIdx % 1 == 0) await CommonUtil.waitCmpt(this, 0)
                if (currFlay != this.eflag) return
                hotIdx++;
                copyPrefab = instantiate(equipCom);
                this.equipLayout.addChild(copyPrefab)
            }

            // this.cardLayout.addChild(copyPrefab)
            const hasHot = this.equipManager.equipHots.has(equipId)
            equipNodes.push(copyPrefab);

            const equipPrefab = copyPrefab.getComponent(EquipmentPrefab)
            const _userOtherGroup = this.equipManager.playEquipGroup.hasOtherCardGroup(equipId)
            equipPrefab?.init({
                id: equipId,
                equipPrefabType: EquipPrefabType.NewInfoPower,
                cb: () => this.equipCb(EEquipmentPop.KNAPSACK_CARD_INFO, equipPrefab),
                userOtherGroup: _userOtherGroup
            })
            if (hasHot) equipPrefab.openHot(true)
            if (_cardGroupKV[equipId]) {
                copyPrefab.active = false
            } else {
                if (_userOtherGroup) this._eOtherGKV[equipId] = equipPrefab
                if (!this.iconToggle.isChecked && _userOtherGroup) {
                    copyPrefab.active = false
                } else {
                    copyPrefab.active = true
                }
            }
            count++
            this._equipKV[equipId] = equipPrefab
        }

        let children = equipNodes;
        children.sort((a, b) => {
            let aEquip = a.getComponent(EquipmentPrefab).param.id;
            let bEquip = b.getComponent(EquipmentPrefab).param.id;
            let aHot = this.equipManager.equipHots.has(aEquip);
            let bHot = this.equipManager.equipHots.has(bEquip);
            if (aHot == bHot) {
                return _cardIds.findIndex(e => e == aEquip) - _cardIds.findIndex(e => e == bEquip);
            }
            if (aHot) {
                return -1;
            } else if (bHot) {
                return 1;
            }
        })
        for (let index = 0; index < children.length; index++) {
            children[index].setSiblingIndex(index);
        }

        // hotEquips.concat(nomalEquips).forEach(equipNode => {
        //     this.cardLayout.addChild(equipNode)
        // })
    }
    private async refreshCards() {
        if (this.tabStatus != 'CARD') return
        await this.upHasCards()
        await this.updateNoCardItems()
        // this.upCardNum()

    }
      
    // private hasLen = 0
    // private noLen = 0

    private _backPackKV: { [key: number]: CardPrefab } = [];
    private async upHasCards() {
        this.cflag1++
        const cardCom = await this.cardPrefab
        let currFlay = this.cflag1
        const cardList = this.cardTypeTabBar.getNewPVPCards()
        this.cardTypeTabBar.setNumStr(`${cardList?.length || 0}`)
        const cardGroupCards = this.cardGroupManager.getCurrCardGroupCards()

        this._cOtherGKV = {}
        for (const key in this._backPackKV) {
            let card = this._backPackKV[key];
            if (card) {
                let idx = cardList.findIndex(e => e.showCardId == card.param.id);
                if (idx == -1) {
                    card.node.destroy();
                    delete this._backPackKV[key];
                }
            }
        }

        let hotIdx = 0
        let cardNodes: Node[] = [];
        // let hasGroup: { [num: number]: number } = {}
        for (const mCard of cardList) {
            let cardPrefab: CardPrefab = null;
            if (this._backPackKV[mCard.showCardId]) {
                cardPrefab = this._backPackKV[mCard.showCardId];
            } else {
                if (hotIdx % 1 == 0) await CommonUtil.waitCmpt(this, 0)
                if (currFlay != this.cflag1) return
                hotIdx++
                let cardNode = instantiate(cardCom);
                this.myCards?.addChild(cardNode)
                cardPrefab = cardNode.getComponent(CardPrefab)
            }

            cardPrefab.openHot(!!mCard?.hasHot)
            const _userOtherGroup = this.cardGroupManager.hasOtherCardGroup(mCard.groupTypeId, mCard.showCardId)
            cardPrefab.init({
                id: mCard.showCardId,
                cardPrefabType: CardPrefabType.NewInfoPower,
                cb: () => this.cardCb(ECardSystemPop.KNAPSACK_CARD_INFO, cardPrefab),
                userOtherGroup: _userOtherGroup
            })
            this._backPackKV[mCard.showCardId] = cardPrefab

            cardNodes.push(cardPrefab.node);
            // hasGroup[mCard.groupTypeId] = mCard.groupTypeId
            if (cardGroupCards.findIndex(v => v.id == mCard.showCardId) == -1) {
                if (_userOtherGroup) this._cOtherGKV[mCard.showCardId] = cardPrefab
                if (!this.iconToggle.isChecked && _userOtherGroup) {
                    cardPrefab.node.active = false
                } else {
                    cardPrefab.node.active = true
                }
            } else {
                cardPrefab.node.active = false
            }
        }

        let children = cardNodes;
        children.sort((a, b) => {
            let aIdx = cardList.findIndex(e => e.showCardId == a.getComponent(CardPrefab).param.id);
            let bIdx = cardList.findIndex(e => e.showCardId == b.getComponent(CardPrefab).param.id);
            return aIdx - bIdx;
        })
        for (let index = 0; index < children.length; index++) {
            children[index].setSiblingIndex(index);
        }

        // cardGroupCards.forEach((card) => {
        //     const cardId = card?.id ?? 0
        //     if (this._backPackKV[cardId]) {
        //         this._backPackKV[cardId].node.active = false
        //     }
        // })
        // for (const key in hasGroup) {
        //     this.hasLen++
        // }
        // this.upCardNum()

          
        tween(this.myCards)
            .by(0.001, { position: v3(0, 0.001, 0) })
            .call(() => {
                this.myCards.parent.getComponent(Layout).updateLayout(true);
            })
            .start();
        await CommonUtil.waitCmpt(this, 0.001);
        // this.myCards.setPosition(v3(pos.x, pos.y - 1, pos.z))
    }

    private _noCardKV: { [key: number]: CardPrefab } = [];
    private async updateNoCardItems() {
        this.cflag2++
        const cardCom = await this.cardPrefab
        let currFlay = this.cflag2
        const cards = this.cardManager.playCard.noCardKV
        // this.noCards?.destroyAllChildren()
        for (const key in this._noCardKV) {
            let card = this._noCardKV[key];
            if (card) {
                let idx = -1;
                for (const key in cards) {
                    if (card.param.cardId == cards[key][0]) {
                        idx = 1;
                        break;
                    }
                }
                if (idx == -1) {
                    card.node.destroy();
                    delete this._noCardKV[key];
                }
            }
        }

        // this.noLen = 0
        let noLen = 0
        for (const key in cards) {
            const cardId = cards[key][0];
            let cardNode: Node = null;
            if (this._noCardKV[cardId]) {
                cardNode = this._noCardKV[cardId].node;
            } else {
                if (noLen % 1 == 0) await CommonUtil.waitCmpt(this, 0)
                if (currFlay != this.cflag2) return
                noLen++
                cardNode = instantiate(cardCom);
                this.noCards?.addChild(cardNode)
            }

            const roleCard = cardNode.getComponent(CardPrefab)
            // roleCard.cardSprite.grayscale = true
            roleCard.init({
                cardId: cardId,
                cardPrefabType: CardPrefabType.CardInfo,
                cb: () => this.cardCb(ECardSystemPop.NO_CARD_INFO, roleCard)
            })
            roleCard.setGray(true)
            this._noCardKV[cardId] = roleCard;
        }
    }

    // private upCardNum() {
    // this.cardTypeTabBar.setNumStr(`${this.hasLen}/${this.hasLen + this.noLen}`)
    // this.cardTypeTabBar.setNumStr(`${this.hasLen}`)
    // }

    onLoad() {
        this.addEvent();
    }

    onDestroy() {
        this.removeEvent();
    }

    private refreshCardHot(event, cardId: number) {
        if (this._backPackKV[cardId]) this._backPackKV[cardId].openHot(false)
    }

    private refreshEquipHot(event, cardId: number) {
        if (this._equipKV[cardId]) this._equipKV[cardId].openHot(false)
    }

    private tabClick(event: EventTouch, tag: "CARD" | "EQUIP") {
        this.tabStatus = tag
        this.upNode()
    }

      
    private addEvent() {
          
        Message.on(GameEvent.CardDataRefresh, this.refreshCards, this);
        Message.on(GameEvent.CardGroupDataRefresh, this.refreshCards, this);
        Message.on(GameEvent.CardHotDeleteRefresh, this.refreshCardHot, this);
        Message.on(DataEvent.DATA_CURRCARDGROUPID_CHANGE, this.upNode, this);


        Message.on(GameEvent.EquipGroupDataRefresh, this.refreshEquips, this);
        // Message.on(DataEvent.DATA_CURREQUIPGROUPID_CHANGE, this.refreshEquips, this);
        Message.on(GameEvent.EquipDataRefresh, this.refreshEquips, this);
        Message.on(GameEvent.EquipHotDeleteRefresh, this.refreshEquipHot, this);
    }

      
    private removeEvent() {
        Message.off(GameEvent.CardDataRefresh, this.refreshCards, this);
        Message.off(GameEvent.CardGroupDataRefresh, this.refreshCards, this);
        Message.off(GameEvent.CardHotDeleteRefresh, this.refreshCardHot, this);
        Message.off(DataEvent.DATA_CURRCARDGROUPID_CHANGE, this.upNode, this);


        Message.off(GameEvent.EquipGroupDataRefresh, this.refreshEquips, this);
        // Message.off(DataEvent.DATA_CURREQUIPGROUPID_CHANGE, this.refreshEquips, this);
        Message.off(GameEvent.EquipDataRefresh, this.refreshEquips, this);
        Message.off(GameEvent.EquipHotDeleteRefresh, this.refreshEquipHot, this);
    }
}

