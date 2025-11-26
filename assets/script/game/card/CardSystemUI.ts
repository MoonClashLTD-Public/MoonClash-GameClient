import { _decorator, Component, ScrollView, Node, v2, UITransform, v3 } from 'cc';
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
import { EEquipmentPop, IEquipInfoPopCfg } from '../equipmentUI/utils/enum';
import { CSCardGroupBanner } from './com/CSCardGroupBanner';
import { CSUIBtmNode } from './com/CSUIBtmNode';
import { ICardSysInfoPopConfig } from './pop/CSCardInfoPop';
import { ECardSystemPop } from './utils/enum';
const { ccclass, property } = _decorator;
@ccclass('CardSystemUI')
export class CardSystemUI extends Component {
    @property(ScrollView)
    private mainScrollView: ScrollView
    @property(CSCardGroupBanner)
    private banners: CSCardGroupBanner
    @property(CSUIBtmNode)
    private btmCard: CSUIBtmNode

    private get cardManager() {
        return PlayerManger.getInstance().cardManager
    }

    private get equipManager() {
        return PlayerManger.getInstance().equipManager
    }

    private cardPop: CardInfoPrefab
    private equipPop: EquipmentInfoPrefab

    private equipSmallPop: EquipmentInfoPrefab

    async start() {
        this.banners.init({
            listener: {
                itemClick: (cardNode: CardPrefab) =>
                    this.itemCardClick(ECardSystemPop.POLL_CARD_INNFO, cardNode),
                removeClick: (cardNode: CardPrefab, idx: number) => this.removeBannerCard(cardNode),
                itemEquipClick: (cardNode: EquipmentPrefab) => this.itemEquipClick(EEquipmentPop.POLL_CARD_INNFO, cardNode),
                removeEquipClick: (cardNode: EquipmentPrefab, idx: number) => this.removeBannerEquip(cardNode),
            }
        })
        this.btmCard.init({
            cardCb: (n1, n2) => this.itemCardClick(n1, n2),
            equipCb: (n1, n2) => this.itemEquipClick(n1, n2),
        })
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
        this.banners.updateItems()
        // this.btmCard.upNode()
    }

      
    pageInit() {
        // this.mainScrollView.scrollToOffset(v2(this.mainScrollView.getScrollOffset().x, this.mainScrollView.getScrollOffset().y - Math.random() * 10), 0);
        this.mainScrollView.scrollToOffset(v2(this.mainScrollView.getScrollOffset().x, 0 + Math.random()), 0);
        // this.banners.updateItems()
        this.btmCard.upNode()
    }

      
    pageOuit() {
        this.mainScrollView.stopAutoScroll();
        this.mainScrollView.scrollToTop(0);
        this.cardPop?.hide()
        this.equipPop?.hide();
    }

    private itemCardClick(type: ECardSystemPop, card: CardPrefab) {
        if (card) {
            if (type == ECardSystemPop.POLL_CARD_INNFO) {
                this.cardPopCfg1.id = card.param.id
                this.cardPop?.show(this.cardPopCfg1, card.node, this.mainScrollView);
            } else if (type == ECardSystemPop.KNAPSACK_CARD_INFO) {
                this.cardManager.readHot(card.param.id)
                this.cardPopCfg2.id = card.param.id
                this.cardPopCfg2.userOtherGroup = card.param?.userOtherGroup ?? false
                this.cardPop?.show(this.cardPopCfg2, card.node, this.mainScrollView);
            } else if (type == ECardSystemPop.NO_CARD_INFO) {
                this.cardPopCfg3.cardId = card.param.cardId
                this.cardPop?.show(this.cardPopCfg3, card.node, this.mainScrollView);
            }
        } else {
            this.cardPop?.hide()
        }
    }

    private itemEquipClick(type: EEquipmentPop, card: EquipmentPrefab) {
        if (card) {
            this.equipManager.readHot(card.param.id)
            if (type == EEquipmentPop.POLL_CARD_INNFO) {
                this.equipPopCfg1.id = card.param.id
                this.equipPopCfg1.equipPrefabType = card.param.equipPrefabType
                this.equipSmallPop?.show(this.equipPopCfg1, card.node, this.mainScrollView);
            } else if (type == EEquipmentPop.KNAPSACK_CARD_INFO) {
                this.equipPopCfg2.id = card.param.id
                this.equipPopCfg2.equipPrefabType = card.param.equipPrefabType
                this.equipPopCfg2.userOtherGroup = card.param?.userOtherGroup ?? false
                this.equipPop?.show(this.equipPopCfg2, card.node, this.mainScrollView);
            }
        } else {
            this.equipPop?.hide()
            this.equipSmallPop?.hide()
        }
    }

    private cardPopCfg1: CardInfoPrefabParam = {
        cb: (event, cbFlag) => this.cb1(event, cbFlag),
        cardPrefabType: CardPrefabType.NewInfoNoPower,
        btns: [
            {
                i18nKey: "pop_btn_1",
                btnColor: CardInfoPrefabBtnColor.Blue,
                cbFlag: "banner_btn_info"
            },
            {
                i18nKey: "pop_btn_3",
                btnColor: CardInfoPrefabBtnColor.Red,
                cbFlag: "banner_btn_remove"
            },
        ]
    }

    private cardPopCfg2: CardInfoPrefabParam = {
        cb: (event, cbFlag) => this.cb1(event, cbFlag),
        cardPrefabType: CardPrefabType.NewInfoNoPower,
        btns: [
            {
                i18nKey: "pop_btn_1",
                btnColor: CardInfoPrefabBtnColor.Blue,
                cbFlag: "cs_btn_info"
            },
            {
                i18nKey: "pop_btn_6",
                btnColor: CardInfoPrefabBtnColor.Yellow,
                cbFlag: "cs_btn_use"
            }
        ]
    }
    private cardPopCfg3: CardInfoPrefabParam = {
        cb: (event, cbFlag) => this.cb1(event, cbFlag),
        btns: [
            {
                i18nKey: "pop_btn_1",
                btnColor: CardInfoPrefabBtnColor.Blue,
                cbFlag: "cs_btn_info_2"
            }
        ]
    }

    private cb1(event, cbFlag: string) {
        if (cbFlag == "banner_btn_info") {
            this.openCardInfo()
        } else if (cbFlag == "banner_btn_remove") {
            this.upCardGroup(false)
        } else if (cbFlag == "cs_btn_info") {
            this.openCardInfo(false)
        } else if (cbFlag == "cs_btn_use") {
            this.upCardGroup(true)
        } else if (cbFlag == "cs_btn_info_2") {
            this.openNoCardInfo()
        }
        // this.cardPop?.hide()
    }


    private equipPopCfg1: EquipInfoPrefabParam = {
        cb: (event, cbFlag) => this.cb2(event, cbFlag),
        btns: [
            {
                i18nKey: "pop_btn_1",
                btnColor: EquipInfoPrefabBtnColor.Blue,
                cbFlag: "etpop_banner_btn_info"
            },
            {
                i18nKey: "pop_btn_3",
                btnColor: EquipInfoPrefabBtnColor.Red,
                cbFlag: "etpop_banner_btn_remove"
            },
        ]
    }

    private equipPopCfg2: EquipInfoPrefabParam = {
        cb: (event, cbFlag) => this.cb2(event, cbFlag),
        btns: [
            {
                i18nKey: "pop_btn_1",
                btnColor: EquipInfoPrefabBtnColor.Blue,
                cbFlag: "etpop_btn_info"
            },
            {
                i18nKey: "pop_btn_6",
                btnColor: EquipInfoPrefabBtnColor.Yellow,
                cbFlag: "etpop_btn_use"
            }
        ]
    }

    private cb2(event, cbFlag: string) {
        if (cbFlag == "etpop_banner_btn_info") {
            const args: IEquipInfoPopCfg = { id: this.equipSmallPop?.param?.id, isGroup: true }
            oops.gui.open(UIID.EquipmentCardInfoPop, args)
        } else if (cbFlag == "etpop_banner_btn_remove") {
            this.upEquipGroup(false, true)
        } else if (cbFlag == "etpop_btn_info") {
            const args: IEquipInfoPopCfg = {
                id: this.equipPop?.param?.id,
                equipClick: (_) => this.upEquipGroup(true)
            }
            oops.gui.open(UIID.EquipmentCardInfoPop, args)
        } else if (cbFlag == "etpop_btn_use") {
            this.upEquipGroup(true)
        }
    }

    private async upEquipGroup(isAdd: boolean, isBanner = false) {
        const cardId = isBanner ? this.equipSmallPop?.param?.id : this.equipPop?.param?.id
        if (cardId) this.equipManager.playEquipGroup.upCardGroup(cardId, isAdd)
        this.equipPop?.hide()
        this.equipSmallPop?.hide()
    }

    private openCardInfo(isGroup = true) {
        const id = this.cardPop.param?.id
        const cfg: ICardSysInfoPopConfig = { netCardId: id, isGroup: isGroup, useCb: () => this.upCardGroup(true) }
        if (id) oops.gui.open(UIID.CardSystemInfoPop, cfg)
    }

    private async upCardGroup(isAdd: boolean) {
        const netCardId = this.cardPop?.param?.id
        if (netCardId) this.cardManager.playCardGroup.upCardGroup(netCardId, isAdd)
        this.cardPop?.hide()
    }

    private removeBannerCard(cardNode: CardPrefab) {
        const netCardId = cardNode.param.id
        if (netCardId) this.cardManager.playCardGroup.upCardGroup(netCardId, false)
        this.cardPop?.hide()
    }

    private removeBannerEquip(cardNode: EquipmentPrefab) {
        const netCardId = cardNode.param.id
        if (netCardId) this.equipManager.playEquipGroup.upCardGroup(netCardId, false)
        this.equipPop?.hide()
        this.equipSmallPop?.hide()
    }

    private openNoCardInfo() {
        const cardId = this.cardPop.param?.cardId
        const cfg: ICardSysInfoPopConfig = { lCardId: cardId }
        if (cardId) oops.gui.open(UIID.CardSystemInfoPop, cfg)
    }

    onLoad() {
        this.addEvent();
    }

    onDestroy() {
        this.removeEvent();
    }

      
    private addEvent() {
        Message.on(GameEvent.CardDataRefresh, this.onCloseCardPop, this);
    }

    private removeEvent() {
        Message.off(GameEvent.CardDataRefresh, this.onCloseCardPop, this);
    }

    private onCloseCardPop() {
        this.cardPop?.hide()
    }
}

