import { _decorator, Component, Node, instantiate, Prefab, ScrollView, v3, } from 'cc';
import { oops } from '../../core/Oops';
import { CardInfoPrefab, CardInfoPrefabBtnColor, CardInfoPrefabParam } from '../common/common/CardInfoPrefab';
import { CardPrefab, CardPrefabType } from '../common/common/CardPrefab';
import { UIID } from '../common/config/GameUIConfig';
import { PlayerManger } from '../data/playerManager';
import { ResManger } from '../data/resManger';
import { PVECardGroup } from './com/PVECardGroup';
import { PVECardClickPop, PVEEquipClickPop } from './utils/enum';
import { CardInfoPopUpParam } from '../infoPopUp/cardInfoPopUp/CardInfoPopUp';
import { CSPVEUIBtmNode } from './com/CSPVEUIBtmNode';
import { EquipmentPrefab } from '../common/equipment/EquipmentPrefab';
import { EquipInfoPrefabBtnColor, EquipInfoPrefabParam, EquipmentInfoPrefab } from '../common/equipment/EquipmentInfoPrefab';
import { EquipmentInfoPopUpParam } from '../infoPopUp/equipmentInfoPopUp/EquipmentInfoPopUp';
import { FriendType, FriendUIParam } from '../friendUI/FriendUI';
const { ccclass, property } = _decorator;
@ccclass('PVECardPop1')
export class PVECardPop1 extends Component {
    @property(ScrollView)
    private mainScrollView: ScrollView = null
    @property(PVECardGroup)
    private cardGroup: PVECardGroup = null
    @property(CSPVEUIBtmNode)
    private pveBtmNode: CSPVEUIBtmNode = null
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

    async onAdded() {
        this.cardGroup.init({
            cb1: (card) =>
                this.itemCardClick(PVECardClickPop.POLL_CARD_INNFO, card),
            cb2: (card) =>
                this.itemCardClick(PVECardClickPop.POLL_CARD_ASSIST, card),
            cb3: (cardNode: EquipmentPrefab) => this.itemEquipClick(PVEEquipClickPop.POLL_CARD_INNFO, cardNode),
            removeClick: (cardNode: CardPrefab, idx: number) => this.removeBannerCard(cardNode),
            removeEquipClick: (cardNode: EquipmentPrefab, idx: number) => this.removeBannerEquip(cardNode),
        })
        this.pveBtmNode.init({
            cardCb: (n1, n2) => this.itemCardClick(n1, n2),
            equipCb: (n1, n2) => this.itemEquipClick(n1, n2),
        })
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
        const card = this.cardPop.cardInfo.cardInfoCom?.getCardData()
        if (card) this.cardInfoPopUpCB(card, isGroup)
    }
    private openAssist() {
        oops.gui.open<FriendUIParam>(UIID.FriendUI, { friendType: FriendType.Choose })
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
    private async upCardGroup(isAdd: boolean) {
        const _card = this.cardPop?.cardInfo.cardInfoCom?.getCardData()
        if (_card) this.playerManager.pveInfo.upCardGroup({ card: _card, isAdd: isAdd })
        this.cardPop?.hide()
    }
    private async upEquipGroup(isAdd: boolean) {
        const cardId = this.equipPop?.param?.id
        if (cardId) this.playerManager.pveInfo.upEquipGroup(cardId, isAdd)
        this.equipPop?.hide()
    }

    closeAction() {
        oops.gui.removeByNode(this.node, true)
    }

    private cardInfoPopUpCB(cardInfo: core.ICard, isGroup: boolean) {
        let param: CardInfoPopUpParam = {
            card: cardInfo,
            btns: [
                {
                    i18nKey: "pop_btn_5",
                    btnColor: CardInfoPrefabBtnColor.Blue,
                    cbFlag: "pve_btn_assist"
                },
                {
                    i18nKey: isGroup ? "pop_btn_3" : "pop_btn_6",
                    btnColor: isGroup ? CardInfoPrefabBtnColor.Red :
                        CardInfoPrefabBtnColor.Yellow,
                    cbFlag: isGroup ? 'pop_btn_remove' : "pve_btn_use"
                }
            ],
            cb: (event, cbFlag) => {
                if (cbFlag == 'pve_btn_assist') {
                    this.openAssist()
                } else if (cbFlag == "pve_btn_use") {
                    this.upCardGroup(true)
                } else if (cbFlag == "pop_btn_remove") {
                    this.upCardGroup(false)
                }
                oops.gui.remove(UIID.CardInfoPopUp);
            },
        }
        oops.gui.open(UIID.CardInfoPopUp, param);
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

    onDestroy() {
        this.removeEvent();
    }

    private addEvent() {
        // Message.on(GameEvent.PVECardGroupDataRefresh, this.refreshData, this);
    }

    private removeEvent() {
        // Message.off(GameEvent.PVECardGroupDataRefresh, this.refreshData, this);
    }
}

