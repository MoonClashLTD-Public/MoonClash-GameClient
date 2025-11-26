import { _decorator, Component, Node, instantiate, Prefab, ScrollView, } from 'cc';
import { Message } from '../../core/common/event/MessageManager';
import { oops } from '../../core/Oops';
import { CardInfoPrefabBtnColor } from '../common/common/CardInfoPrefab';
import { GameEvent } from '../common/config/GameEvent';
import { UIID } from '../common/config/GameUIConfig';
import { EquipInfoPrefabBtnColor, EquipInfoPrefabParam, EquipmentInfoPrefab } from '../common/equipment/EquipmentInfoPrefab';
import { EquipmentPrefab, EquipPrefabType } from '../common/equipment/EquipmentPrefab';
import TableEquip from '../common/table/TableEquip';
import { PlayerManger } from '../data/playerManager';
import { ResManger } from '../data/resManger';
import { EquipTabBar } from '../equipmentUI/com/EquipTabBar';
import { IEquipInfoPopCfg } from '../equipmentUI/utils/enum';
import { EquipmentInfoPopUpParam } from '../infoPopUp/equipmentInfoPopUp/EquipmentInfoPopUp';
import { PVEEquipGroup } from './com/PVEEquipGroup';
import { PVEEquipClickPop } from './utils/enum';
const { ccclass, property } = _decorator;
@ccclass('PVEEquipmentPop')
export class PVEEquipmentPop extends Component {
    @property(ScrollView)
    private mainScrollView: ScrollView = null
    @property(PVEEquipGroup)
    private equipGroup: PVEEquipGroup = null
    @property(EquipTabBar)
    private mTabBar: EquipTabBar = null
    @property(Node)
    private cardLayout: Node = null
    private equipPop: EquipmentInfoPrefab

    private get playerManager() {
        return PlayerManger.getInstance()
    }

    private get equipPrefab() {
        return ResManger.getInstance().getEquipPrefab()
    }

    async onLoad() {
        this.mTabBar.addListener(
            {
                init: (type) => this.initBtmCards(),
                itemClick: (type) => this.initBtmCards(),
            }
        )
        this.addEvent();
        if (!this.equipPop) {
            this.equipPop = await ResManger.getInstance().getEquipInfoPrefab()
            if (this.equipPop) this.node.addChild(this.equipPop.node)
        }
    }

    onAdded() {
        this.equipGroup.init((card) =>
            this.changePopState(PVEEquipClickPop.POLL_CARD_INNFO, card))
        this.initBtmCards()
    }

    private changePopState(type: PVEEquipClickPop, card: EquipmentPrefab) {
        if (card) {
            if (type == PVEEquipClickPop.POLL_CARD_INNFO) {
                this.d1.id = card.param.id
                this.d1.equipPrefabType = card.param.equipPrefabType
                this.equipPop?.show(this.d1, card.node, this.mainScrollView);
            } else if (type == PVEEquipClickPop.KNAPSACK_CARD_INFO) {
                this.d2.id = card.param.id
                this.equipPop?.show(this.d2, card.node, this.mainScrollView);
            }
        } else {
            this.equipPop?.hide()
        }
    }

    private _cardGroup: core.IEquipment[] = []
    private _cardKV: { [key: number]: EquipmentPrefab } = [];
    private async initBtmCards() {
        if (!this.cardLayout) return
        const equipCom = await this.equipPrefab
        this._cardGroup = this.playerManager.pveInfo.equipGroupCards
        const _equipIds = this.playerManager.equipManager.playEquips.equipPVEIds || []
        this.cardLayout?.destroyAllChildren()
        this._cardKV = {}
        const currEquipType = this.mTabBar.equipType
        let count = 0
        for (const key in _equipIds) {
            const equipId = _equipIds[key]
            const equipData = this.playerManager.equipManager.playEquips.getEquipmentById(equipId)
            const _equipCfg = TableEquip.getInfoById(equipData?.protoId)
            if (currEquipType != core.EquipmentType.EquipmentTypeNone) {
                if (_equipCfg.equipment_type != currEquipType) continue
            }
            const copyPrefab = instantiate(equipCom);
            this.cardLayout.addChild(copyPrefab)
            const equipPrefab = copyPrefab.getComponent(EquipmentPrefab)
            equipPrefab?.init({
                id: equipId,
                equipPrefabType: EquipPrefabType.Info,
                cb: () => this.changePopState(PVEEquipClickPop.KNAPSACK_CARD_INFO, equipPrefab)
            })
            this._cardKV[equipId] = equipPrefab
            count++
        }
        this.mTabBar.setShowNum(count)
        this._cardGroup.forEach((card) => {
            const cardId = card?.id ?? 0
            if (this._cardKV[cardId]) this._cardKV[cardId].node.active = false
        })
    }

      
    private updateCard() {
        const newCardGroup = this.playerManager.pveInfo.equipGroupCards
        if (newCardGroup.length != this._cardGroup.length) return
        for (const key in newCardGroup) {
            const newId = newCardGroup[key]?.id || 0
            const oldId = this._cardGroup[key]?.id || 0
            if (newId != oldId) {
                if (oldId == 0) {
                    if (this._cardKV[newId]) this._cardKV[newId].node.active = false
                } else if (newId == 0) {
                    if (this._cardKV[oldId]) this._cardKV[oldId].node.active = true
                } else {
                    if (this._cardKV[oldId]) this._cardKV[oldId].node.active = true
                    if (this._cardKV[newId]) this._cardKV[newId].node.active = false
                }
            }
        }
        this._cardGroup = newCardGroup
    }

    private d1: EquipInfoPrefabParam = {
        cb: (event, cbFlag) => this.cb(event, cbFlag),
        btns: [
            {
                i18nKey: "pop_btn_1",
                btnColor: EquipInfoPrefabBtnColor.Blue,
                cbFlag: "pve_equip_banner_info"
            },
            {
                i18nKey: "pop_btn_3",
                btnColor: EquipInfoPrefabBtnColor.Red,
                cbFlag: "pve_equip_remove"
            },
        ]
    }

    private d2: EquipInfoPrefabParam = {
        cb: (event, cbFlag) => this.cb(event, cbFlag),
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

    private cb(event, cbFlag: string) {
        if (cbFlag == "pve_equip_banner_info") {
            this.openEquipInfo(true)
        } else if (cbFlag == "pve_equip_remove") {
            this.upCardGroup(false)
        } else if (cbFlag == "pve_equip_info") {
            this.openEquipInfo(false)
        } else if (cbFlag == "pve_equip_use") {
            this.upCardGroup(true)
        }
    }

    private openEquipInfo(isGroup = true) {
        const equipData = this.equipPop.cardInfo?.equipInfoCom?.equipData
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
                    this.upCardGroup(true)
                } else if (cbFlag == "pop_btn_remove") {
                    this.upCardGroup(false)
                }
                oops.gui.remove(UIID.EquipmentInfoPopUp);
            },
        }
        oops.gui.open(UIID.EquipmentInfoPopUp, param);
    }

    private async upCardGroup(isAdd: boolean) {
        const cardId = this.equipPop?.param?.id
        if (cardId) this.playerManager.pveInfo.upEquipGroup(cardId, isAdd)
        this.equipPop?.hide()
    }


    private closeAction() {
        oops.gui.removeByNode(this.node, true)
    }

    onDestroy() {
        this.removeEvent();
    }

    private addEvent() {
        Message.on(GameEvent.PVEEquipGroupDataRefresh, this.updateCard, this);
    }

    private removeEvent() {
        Message.off(GameEvent.PVEEquipGroupDataRefresh, this.updateCard, this);
    }
}

