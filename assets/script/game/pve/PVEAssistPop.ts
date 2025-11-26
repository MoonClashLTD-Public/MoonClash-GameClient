import { _decorator, Component, Node, instantiate, Prefab, ScrollView, Label, v3, } from 'cc';
import { Message } from '../../core/common/event/MessageManager';
import { oops } from '../../core/Oops';
import { CardInfoPrefab, CardInfoPrefabBtnColor, CardInfoPrefabParam } from '../common/common/CardInfoPrefab';
import { CardPrefab, CardPrefabType } from '../common/common/CardPrefab';
import { GameEvent } from '../common/config/GameEvent';
import { UIID } from '../common/config/GameUIConfig';
import { EquipInfoPrefabBtnColor, EquipInfoPrefabParam, EquipmentInfoPrefab } from '../common/equipment/EquipmentInfoPrefab';
import { EquipmentPrefab } from '../common/equipment/EquipmentPrefab';
import { PlayerManger } from '../data/playerManager';
import { ResManger } from '../data/resManger';
import { FriendUIParam, FriendType } from '../friendUI/FriendUI';
import { CardInfoPopUpParam } from '../infoPopUp/cardInfoPopUp/CardInfoPopUp';
import { EquipmentInfoPopUpParam } from '../infoPopUp/equipmentInfoPopUp/EquipmentInfoPopUp';
import { PVECardGroup } from './com/PVECardGroup';
import { PVECardClickPop, PVEEquipClickPop } from './utils/enum';

const { ccclass, property } = _decorator;
@ccclass('PVEAssistPop')
export class PVEAssistPop extends Component {
    @property(ScrollView)
    private mainScrollView: ScrollView = null
    @property(PVECardGroup)
    private cardGroup: PVECardGroup = null
    @property(Node)
    private cardLayout: Node = null
    @property(Label)
    private numLb: Label = null
    private cardPop: CardInfoPrefab
    private equipPop: EquipmentInfoPrefab
    private equipSmallPop: EquipmentInfoPrefab

    private get playerManager() {
        return PlayerManger.getInstance()
    }

    private get cardPrefab() {
        return ResManger.getInstance().getCardPrefab()
    }

    async onLoad() {
        this.addEvent();
        if (!this.cardPop) {
            this.cardPop = await ResManger.getInstance().getCardInfoPopPrefab()
            if (this.cardPop) this.node.addChild(this.cardPop.node)
        }
        if (!this.equipPop) {
            this.equipPop = await ResManger.getInstance().getEquipInfoPrefab()
            if (this.equipPop) this.node.addChild(this.equipPop.node)
        }
        if (!this.equipSmallPop) {
            this.equipSmallPop = await ResManger.getInstance().getEquipInfoPrefab()
            if (this.equipSmallPop) {
                this.equipSmallPop.offsetH = 37
                this.node.addChild(this.equipSmallPop.node)
                this.equipSmallPop.node.setScale(v3(0.5, 0.5, 0.5))
            }
        }
    }

    onAdded() {
        this.cardGroup.init({
            cb1: (card) =>
                this.itemCardClick(PVECardClickPop.POLL_CARD_INNFO, card),
            cb2: (card) =>
                this.itemCardClick(PVECardClickPop.POLL_CARD_ASSIST, card),
            cb3: (cardNode: EquipmentPrefab) => this.itemEquipClick(PVEEquipClickPop.POLL_CARD_INNFO, cardNode),
            removeClick: (cardNode: CardPrefab, idx: number) => this.removeBannerCard(cardNode),
            removeEquipClick: (cardNode: EquipmentPrefab, idx: number) => this.removeBannerEquip(cardNode),
            isAssist: true
        })
        this.initBtmCards()
    }

    private _cardKV: { [key: number]: CardPrefab } = [];
    private maxCount = 0
    private async initBtmCards() {
        if (!this.cardLayout) return
        const cardCom = await this.cardPrefab
        const friendCards = await this.playerManager.pveInfo.getFriendCards() || []
        this.cardLayout?.destroyAllChildren()
        this._cardKV = {}
        let maxLen = 0
        let hasLen = 0
        for (const friendCard of friendCards) {
            const cardId = friendCard?.assistedCard?.id ?? 0
            if (cardId == 0) continue
            const copyPrefab = instantiate(cardCom);
            this.cardLayout.addChild(copyPrefab)
            const cardPrefab = copyPrefab.getComponent(CardPrefab)
            cardPrefab?.init({
                card: friendCard.assistedCard,
                friendCard: friendCard,
                cardPrefabType: CardPrefabType.NewInfoNoPower,
                cb: () => this.itemCardClick(PVECardClickPop.KNAPSACK_CARD_INFO, cardPrefab)
            })
            this._cardKV[cardId] = cardPrefab
            maxLen++
        }

          
        const nonePrefab = instantiate(cardCom);
        this.cardLayout.addChild(nonePrefab)
        const cardPrefab = nonePrefab.getComponent(CardPrefab)
        cardPrefab?.init({
            cardPrefabType: CardPrefabType.NoneMarketInfo,
            cb: () => oops.gui.open(UIID.FriendUI, { friendType: FriendType.Normal })
        })

        const _assistCard = this.playerManager.pveInfo?.assistCard
        if (_assistCard) {
            const cardId = _assistCard?.assistCardId ?? 0
            if (this._cardKV[cardId]) {
                hasLen++
                this._cardKV[cardId].node.active = false
            }
        }
        this.maxCount = maxLen
        this.numLb.string = `${maxLen - hasLen}/${maxLen}`
    }

      
    private updateSelectCard() {
        const maxLen = this.maxCount
        let hasLen = 0
        for (const card in this._cardKV) {
            this._cardKV[card].node.active = true
        }
        const _assistCard = this.playerManager.pveInfo?.assistCard
        if (_assistCard) {
            const cardId = _assistCard?.assistCardId ?? 0
            if (this._cardKV[cardId]) {
                hasLen++
                this._cardKV[cardId].node.active = false
            }
        }
        this.numLb.string = `${maxLen - hasLen}/${maxLen}`
    }

    private itemCardClick(type: PVECardClickPop, card: CardPrefab) {
        if (card) {
            let d: CardInfoPrefabParam
            if (type == PVECardClickPop.POLL_CARD_INNFO) {
                d = this.cardPopConfig1
            } else if (type == PVECardClickPop.POLL_CARD_ASSIST) {
                d = card.cardPrefabType == CardPrefabType.NoneAdd ? this.cardPopAssConfig11 : this.cardPopAssConfig12
            } else if (type == PVECardClickPop.KNAPSACK_CARD_INFO) {
                d = this.cardPopConfig2
            }
            if (d) {
                d.card = card.cardInfoCom?.getCardData()
                d.id = card.param.id
                d.cardPrefabType = card.param.cardPrefabType
                d.cardProtoId = card.param.cardProtoId
                this.cardPop?.show(d, card.node, this.mainScrollView);
            }
        } else {
            this.cardPop?.hide()
        }
    }

    private itemEquipClick(type: PVEEquipClickPop, card: EquipmentPrefab) {
        if (card) {
            if (type == PVEEquipClickPop.POLL_CARD_INNFO) {
                this.equipPopConfig1.id = card.param.id
                this.equipPopConfig1.equipPrefabType = card.param.equipPrefabType
                this.equipSmallPop?.show(this.equipPopConfig1, card.node, this.mainScrollView);
            } else if (type == PVEEquipClickPop.KNAPSACK_CARD_INFO) {
                this.equipPopConfig2.id = card.param.id
                this.equipPopConfig2.equipPrefabType = card.param.equipPrefabType
                this.equipPop?.show(this.equipPopConfig2, card.node, this.mainScrollView);
            }
        } else {
            this.equipPop?.hide()
            this.equipSmallPop?.hide()
        }
    }
    private equipPopConfig1: EquipInfoPrefabParam = {
        cb: (event, cbFlag) => this.cbEquip(event, cbFlag),
        btns: [
            {
                i18nKey: "pop_btn_1",
                btnColor: EquipInfoPrefabBtnColor.Blue,
                cbFlag: "pve_equip_banner_info"
            },
            {
                i18nKey: "pop_btn_3",
                btnColor: EquipInfoPrefabBtnColor.Red,
                cbFlag: "pve_equip_banner_remove"
            },
        ]
    }
    private equipPopConfig2: EquipInfoPrefabParam = {
        cb: (event, cbFlag) => this.cbEquip(event, cbFlag),
        btns: [
            {
                i18nKey: "pop_btn_1",
                btnColor: EquipInfoPrefabBtnColor.Blue,
                cbFlag: "pve_equip_info"
            },
            {
                i18nKey: "pop_btn_6",
                btnColor: EquipInfoPrefabBtnColor.Yellow,
                cbFlag: "pve_equip_use"
            }
        ]
    }

    private cardPopConfig1: CardInfoPrefabParam = {
        cb: (event, cbFlag) => this.cbCard(event, cbFlag),
        btns: [
            {
                i18nKey: "pop_btn_1",
                btnColor: CardInfoPrefabBtnColor.Blue,
                cbFlag: "pve_pop_info"
            },
            {
                i18nKey: "pop_btn_3",
                btnColor: CardInfoPrefabBtnColor.Red,
                cbFlag: "pve_pop1_1_remove"
            },
        ]
    }
    private cardPopConfig2: CardInfoPrefabParam = {
        cb: (event, cbFlag) => this.cbCard(event, cbFlag),
        btns: [
            {
                i18nKey: "pop_btn_1",
                btnColor: CardInfoPrefabBtnColor.Blue,
                cbFlag: "pve_pop2_2_info"
            },
            // {
            //     i18nKey: "pop_btn_5",
            //     btnColor: CardInfoPrefabBtnColor.Green,
            //     cbFlag: "pve_pop_set_mycard_assist"
            // },
            {
                i18nKey: "pop_btn_6",
                btnColor: CardInfoPrefabBtnColor.Yellow,
                cbFlag: "pve_pop2_2_use"
            }
        ]
    }

    private cardPopAssConfig11: CardInfoPrefabParam = {
        cb: (event, cbFlag) => this.cbCard(event, cbFlag),
        btns: [
            {
                i18nKey: "pop_btn_5",
                btnColor: CardInfoPrefabBtnColor.Yellow,
                cbFlag: "pve_pop1_11_assist"
            }
        ]
    }
    private cardPopAssConfig12: CardInfoPrefabParam = {
        cb: (event, cbFlag) => this.cbCard(event, cbFlag),
        btns: [
            {
                i18nKey: "pop_btn_1",
                btnColor: CardInfoPrefabBtnColor.Blue,
                cbFlag: "pve_pop_info"
            },
            {
                i18nKey: "pop_btn_2",
                btnColor: CardInfoPrefabBtnColor.Yellow,
                cbFlag: "pve_pop1_12_played"
            },
            {
                i18nKey: "pop_btn_3",
                btnColor: CardInfoPrefabBtnColor.Red,
                cbFlag: "pve_pop1_1_remove"
            }
        ]
    }

    private cb(event, cbFlag: string) {
        if (cbFlag == "pve_pop2_1_info") {
            this.openCardInfo(true)
        } else if (cbFlag == "pve_pop2_1_remove") {
            this.upCardGroup(false)
        } else if (cbFlag == "pve_pop2_2_info") {
            this.openCardInfo(false)
        } else if (cbFlag == "pve_pop2_2_use") {
            this.upCardGroup(true)
        } else if (cbFlag == "pve_pop_assist") {
            this.openAssist()
        }
    }

    private openAssist() {
        oops.gui.open<FriendUIParam>(UIID.FriendUI, { friendType: FriendType.Choose })
    }
    private cbCard(event, cbFlag: string) {
        this.cardPop?.hide()
        switch (cbFlag) {
            case "pve_pop_info":
                this.openCardInfo(true)
                break;
            case "pve_pop1_1_remove":
                this.removeCard()
                break;
            case "pve_pop_set_mycard_assist":
                this.openAssist()
                break;
            case "pve_pop2_2_use":
                this.upCardGroup(true)
                break;
            case "pve_pop1_11_assist":
            case "pve_pop1_12_played":
                oops.gui.open(UIID.PVECardAssistPop)
                break;
            case "pve_pop2_1_info":
                this.openCardInfo(true)
                break;
            case "pve_pop2_1_remove":
                this.upCardGroup(false)
                break;
            case "pve_pop2_2_info":
                this.openCardInfo(false)
                break;
            default:
                break;
        }
    }

    private openCardInfo(isGroup = true) {
        // const id = this.cardPop.param?.id
        // const cfg: ICardSysInfoPopConfig = { netCardId: id, isGroup: isGroup, useCb: () => this.upCardGroup(true) }
        // if (id) oops.gui.open(UIID.CardSystemInfoPop, cfg)
        const card = this.cardPop.cardInfo.cardInfoCom.getCardData()
        if (card) this.cardInfoPopUpCB(card, isGroup)
        this.cardPop?.hide()
    }

    private async upCardGroup(isAdd: boolean) {
        const card = this.cardPop?.cardInfo.cardInfoCom.getCardData()
        if (card) this.playerManager.pveInfo.upCardGroup({ card: card, isAdd: isAdd, isAssist: true })
        this.cardPop?.hide()
    }

    private cbEquip(event, cbFlag: string) {
        if (cbFlag == "pve_equip_banner_info") {
            this.openEquipInfo(true)
        } else if (cbFlag == "pve_equip_remove") {
            this.upEquipGroup(false)
        } else if (cbFlag == "pve_equip_info") {
            this.openEquipInfo(false)
        } else if (cbFlag == "pve_equip_use") {
            this.upEquipGroup(true)
        } else if (cbFlag == "pve_equip_banner_remove") {
            this.removeBannerEquip(this.equipSmallPop.cardInfo)
        }
    }
    private async upEquipGroup(isAdd: boolean) {
        const cardId = this.equipPop?.param?.id
        if (cardId) this.playerManager.pveInfo.upEquipGroup(cardId, isAdd)
        this.equipPop?.hide()
    }
    private openEquipInfo(isGroup: boolean) {
        const equipData = isGroup ? this.equipSmallPop.cardInfo?.equipInfoCom?.equipData
            : this.equipPop.cardInfo?.equipInfoCom?.equipData
        if (equipData) this.equipInfoPopUpCB(equipData, isGroup)
    }
    private equipInfoPopUpCB(equip: core.IEquipment, isGroup: boolean) {
        let param: EquipmentInfoPopUpParam = {
            equipment: equip,
            btns: [
                {
                    i18nKey: isGroup ? "pop_btn_3" : "pop_btn_6",
                    btnColor: isGroup ? CardInfoPrefabBtnColor.Red :
                        CardInfoPrefabBtnColor.Yellow,
                    cbFlag: isGroup ? 'pop_btn_remove' : "pve_btn_use"
                }
            ],
            cb: (event, cbFlag) => {
                if (cbFlag == "pve_btn_use") {
                    this.upEquipGroup(true)
                } else if (cbFlag == "pop_btn_remove") {
                    this.upEquipGroup(false)
                }
                oops.gui.remove(UIID.EquipmentInfoPopUp);
            },
        }
        oops.gui.open(UIID.EquipmentInfoPopUp, param);
    }
    private removeBannerCard(cardNode: CardPrefab) {
        const _card = cardNode.cardInfoCom.getCardData()
        if (_card) this.playerManager.pveInfo.upCardGroup({ card: _card, isAdd: false })
    }

    private removeBannerEquip(cardNode: EquipmentPrefab) {
        const equipId = cardNode.param.id
        if (equipId) this.playerManager.pveInfo.upEquipGroup(equipId, false)
        this.equipPop?.hide()
        this.equipSmallPop?.hide()
    }
    private removeCard() {
        const _card = this.cardPop?.cardInfo.cardInfoCom?.getCardData()
        if (_card) this.playerManager.pveInfo.upCardGroup({ card: _card, isAdd: false })
    }

    private closeAction() {
        oops.gui.removeByNode(this.node, true)
    }

    onDestroy() {
        this.removeEvent();
    }

    private addEvent() {
        Message.on(GameEvent.PVECardGroupDataRefresh, this.updateSelectCard, this);
    }

    private removeEvent() {
        Message.off(GameEvent.PVECardGroupDataRefresh, this.updateSelectCard, this);
    }

    private cardInfoPopUpCB(cardInfo: core.ICard, isGroup: boolean) {
        let param: CardInfoPopUpParam = {
            card: cardInfo,
            btns: [
                {
                    i18nKey: isGroup ? "pop_btn_3" : "pop_btn_6",
                    btnColor: isGroup ? CardInfoPrefabBtnColor.Red :
                        CardInfoPrefabBtnColor.Yellow,
                    cbFlag: isGroup ? 'pop_btn_remove' : "pve_btn_use"
                }
            ],
            cb: (event, cbFlag) => {
                if (cbFlag == "pve_btn_use") {
                    this.upCardGroup(true)
                } else if (cbFlag == "pop_btn_remove") {
                    this.upCardGroup(false)
                }
                oops.gui.remove(UIID.CardInfoPopUp);
            },
        }
        oops.gui.open(UIID.CardInfoPopUp, param);
    }
}

export interface IPveCard2PopConfig {
    cardTypeId: number
}

