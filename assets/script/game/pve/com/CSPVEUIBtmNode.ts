import { _decorator, Component, Node, instantiate, Sprite, EventTouch, tween, v3, Layout } from 'cc';
import { PlayerManger } from '../../data/playerManager';
import { CardPrefab, CardPrefabType } from '../../common/common/CardPrefab';
import { ResManger } from '../../data/resManger';
import { Message } from '../../../core/common/event/MessageManager';
import { GameEvent } from '../../common/config/GameEvent';
import { EquipTabBar } from '../../equipmentUI/com/EquipTabBar';
import { EquipmentPrefab, EquipPrefabType } from '../../common/equipment/EquipmentPrefab';
import { CommonUtil } from '../../../core/utils/CommonUtil';
import TableEquip from '../../common/table/TableEquip';
import { CardTypeTabBar } from '../../card/com/tabBar/CardTypeTabBar';
import { PVECardClickPop, PVEEquipClickPop } from '../utils/enum';
import { PVEBtmItemCardClickListener, PVEBtmItemEquipClickListener } from '../utils/fun';
import { tips } from '../../../core/gui/prompt/TipsManager';
const { ccclass, property } = _decorator;

@ccclass('CSPVEUIBtmNode')
export class CSPVEUIBtmNode extends Component {
    @property(Node)
    private myCards: Node = null
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

    private tabStatus: "CARD" | "EQUIP" = 'CARD'
    private oldTabStatus: "CARD" | "EQUIP" = 'EQUIP'

    private cardCb?: PVEBtmItemCardClickListener
    private equipCb?: PVEBtmItemEquipClickListener
    private get playerManager() {
        return PlayerManger.getInstance()
    }

    private get cardPrefab() {
        return ResManger.getInstance().getCardPrefab()
    }

    private get equipPrefab() {
        return ResManger.getInstance().getEquipPrefab()
    }

    init(param?: { cardCb: PVEBtmItemCardClickListener, equipCb: PVEBtmItemEquipClickListener }) {
        this.cardCb = param?.cardCb
        this.equipCb = param?.equipCb
        this.cardTypeTabBar.init({
            onChoose: async () => {
                await tips.showLoadingMask();
                await this.upHasCards()
                await CommonUtil.waitCmpt(this, 0.1)
                tips.hideLoadingMask();
            }, isPVE: true
        })
        this.mTabBar.addListener(
            {
                init: (type) => this.refreshEquips(),
                itemClick: (type) => this.refreshEquips(),
            }
        )
        this.upNode()
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
    private async refreshEquips() {
        if (this.tabStatus != "EQUIP") return
        if (!this.equipLayout) return
        this.eflag++
        let currFlay = this.eflag
        const equipCom = await this.equipPrefab
        const _cardGroup = this.playerManager.pveInfo.equipGroupCards
        const _equipIds = this.playerManager.equipManager.playEquips.equipPVEIds || []

        this.mTabBar.setShowNum(_equipIds.length)
        // this.equipLayout?.destroyAllChildren()

        for (const key in this._equipKV) {
            let equipId = this._equipKV[key];
            if (equipId) {
                let idx = _equipIds.findIndex(e => e == equipId.param.id);
                if (idx == -1) {
                    equipId.node.destroy();
                    delete this._equipKV[key];
                } else {
                    equipId.node.active = false;
                }
            }
        }

        const currEquipType = this.mTabBar.equipType
        let count = 0
        let hotIdx = 0
        for (const key in _equipIds) {
            const equipId = _equipIds[key]
            const equipData = this.playerManager.equipManager.playEquips.getEquipmentById(equipId)
            const _equipCfg = TableEquip.getInfoById(equipData?.protoId)
            if (currEquipType != core.EquipmentType.EquipmentTypeNone) {
                if (_equipCfg.equipment_type != currEquipType) continue
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

            const equipPrefab = copyPrefab.getComponent(EquipmentPrefab)
            equipPrefab?.init({
                id: equipId,
                equipPrefabType: EquipPrefabType.NewPveInfoPower,
                cb: () => this.equipCb(PVEEquipClickPop.KNAPSACK_CARD_INFO, equipPrefab),
            })
            this._equipKV[equipId] = equipPrefab
            count++

            copyPrefab.active = _cardGroup.findIndex(v => v.id == equipId) == -1;
        }

        // let hasLen = 0
        // _cardGroup.forEach((card) => {
        //     const cardId = card?.id ?? 0
        //     if (this._equipKV[cardId]) {
        //         hasLen++
        //         this._equipKV[cardId].node.active = false
        //     }
        // })
        // this.mTabBar.setShowNum(count - hasLen)
    }
    private async refreshCards() {
        if (this.tabStatus != 'CARD') return
        this.upHasCards()
    }
    private _cardKV: { [key: number]: CardPrefab } = {};
    private cflag = 1
    private eflag = 1
    private async upHasCards() {
        this.cflag++
        let currFlay = this.cflag
        const cardCom = await this.cardPrefab
        const _cardGroupCards = this.playerManager.pveInfo.getPveCardGroup
        const pveList = this.cardTypeTabBar.getPVECardTypes()

        this.cardTypeTabBar.setNumStr(`${pveList?.length || 0}`)

        for (const key in this._cardKV) {
            let cardId = this._cardKV[key];
            if (cardId) {
                let idx = pveList.findIndex(e => e.showCardId == cardId.param.id);
                if (idx == -1) {
                    cardId.node.destroy();
                    delete this._equipKV[key];
                }
            }
        }

        let hasLen = 0
        let maxLen = 0
        let hotIdx = 0
        let cardNodes: Node[] = [];
        for (const pveCard of pveList) {
            maxLen++
            let copyPrefab: Node = null;
            if (this._cardKV[pveCard.showCardId]) {
                copyPrefab = this._cardKV[pveCard.showCardId].node;
            } else {
                if (hotIdx % 1 == 0) await CommonUtil.waitCmpt(this, 0)
                if (currFlay != this.cflag) return
                hotIdx++
                copyPrefab = instantiate(cardCom);
                this.myCards.addChild(copyPrefab)
            }

            const cardPrefab = copyPrefab.getComponent(CardPrefab)
            cardPrefab?.init({
                id: pveCard.showCardId,
                cardPrefabType: CardPrefabType.NewPVEInfoPower,
                cb: () => this.cardCb(PVECardClickPop.KNAPSACK_CARD_INFO, cardPrefab),
            })
            this._cardKV[pveCard.showCardId] = cardPrefab

            cardPrefab.node.active = _cardGroupCards.findIndex(v => v.id == pveCard.showCardId) == -1;

            cardNodes.push(cardPrefab.node);
        }
        // _cardGroupCards.forEach((card) => {
        //     const cardId = card?.id ?? 0
        //     if (this._cardKV[cardId]) {
        //         hasLen++
        //         this._cardKV[cardId].node.active = false
        //     }
        // })
        // this.cardTypeTabBar.setNumStr(`${maxLen - hasLen}/${maxLen}`)
        // this.cardTypeTabBar.setNumStr(`${maxLen}`)

        let children = cardNodes;
        children.sort((a, b) => {
            let aIdx = pveList.findIndex(e => e.showCardId == a.getComponent(CardPrefab).param.id);
            let bIdx = pveList.findIndex(e => e.showCardId == b.getComponent(CardPrefab).param.id);
            return aIdx - bIdx;
        })
        for (let index = 0; index < children.length; index++) {
            children[index].setSiblingIndex(index);
        }

        tween(this.myCards)
            .by(0.001, { position: v3(0, 0.001, 0) })
            .call(() => {
                this.myCards.parent.getComponent(Layout).updateLayout(true);
            })
            .start();
    }

    onLoad() {
        this.addEvent();
    }

    onDestroy() {
        this.removeEvent();
    }

    private tabClick(event: EventTouch, tag: "CARD" | "EQUIP") {
        this.tabStatus = tag
        this.upNode()
    }

      
    private addEvent() {

        Message.on(GameEvent.PVECardGroupDataRefresh, this.upNode, this);
        Message.on(GameEvent.PVEEquipGroupDataRefresh, this.upNode, this);
    }

      
    private removeEvent() {

        Message.off(GameEvent.PVECardGroupDataRefresh, this.upNode, this);
        Message.off(GameEvent.PVEEquipGroupDataRefresh, this.upNode, this);
    }
}

