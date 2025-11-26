import { _decorator, Component, Node, instantiate, ScrollView, v2 } from 'cc';
import { Message } from '../../core/common/event/MessageManager';
import { oops } from '../../core/Oops';
import { CommonUtil } from '../../core/utils/CommonUtil';
import { GameEvent } from '../common/config/GameEvent';
import { UIID } from '../common/config/GameUIConfig';
import { EquipInfoPrefabBtnColor, EquipInfoPrefabParam, EquipmentInfoPrefab } from '../common/equipment/EquipmentInfoPrefab';
import { EquipmentPrefab, EquipPrefabType } from '../common/equipment/EquipmentPrefab';
import TableEquip from '../common/table/TableEquip';
import { DataEvent } from '../data/dataEvent';
import { PlayerManger } from '../data/playerManager';
import { ResManger } from '../data/resManger';
import { EquipTabBar } from './com/EquipTabBar';
import { ETCardGroupBanner } from './com/ETCardGroupBanner';
import { EEquipmentPop, IEquipInfoPopCfg } from './utils/enum';
const { ccclass, property } = _decorator;
@ccclass('EquipmentUI')
export class EquipmentUI extends Component {
    @property(ScrollView)
    private mainScrollView: ScrollView = null
    @property(ETCardGroupBanner)
    private banners: ETCardGroupBanner = null
    @property(EquipTabBar)
    private mTabBar: EquipTabBar = null
    @property(Node)
    private cardLayout: Node = null
    private equipPop: EquipmentInfoPrefab

    private get equipManager() {
        return PlayerManger.getInstance().equipManager
    }

    private get equipPrefab() {
        return ResManger.getInstance().getEquipPrefab()
    }

      
    pageInit() {
        // this.mainScrollView.scrollToOffset(v2(this.mainScrollView.getScrollOffset().x, this.mainScrollView.getScrollOffset().y - Math.random() * 10), 0);
        this.mainScrollView.scrollToOffset(v2(this.mainScrollView.getScrollOffset().x, 0 + Math.random()), 0);
        this.banners.updateItems()
        this.initBtmCards()
    }

      
    pageOuit() {
        this.mainScrollView.stopAutoScroll();
        this.mainScrollView.scrollToTop(0);
        this.equipPop?.hide();
    }

    private changePopState(type: EEquipmentPop, card: EquipmentPrefab) {
        if (card) {
            this.equipManager.readHot(card.param.id)
            if (type == EEquipmentPop.POLL_CARD_INNFO) {
                this.d1.id = card.param.id
                this.d1.equipPrefabType = card.param.equipPrefabType
                this.equipPop?.show(this.d1, card.node, this.mainScrollView);
            } else if (type == EEquipmentPop.KNAPSACK_CARD_INFO) {
                this.d2.id = card.param.id
                this.d2.userOtherGroup = card.param?.userOtherGroup ?? false
                this.equipPop?.show(this.d2, card.node, this.mainScrollView);
            }
        } else {
            this.equipPop?.hide()
        }
    }

    private _cardKV: { [key: number]: EquipmentPrefab } = [];
    private flag = 1
    private async initBtmCards() {
        if (!this.cardLayout) return
        this.flag++
        const equipCom = await this.equipPrefab
        let currFlay = this.flag
        const _cardGroupKV = this.equipManager.playEquipGroup.getCurrCardGroupKV()
        const _cardIds = this.equipManager.playEquips.equipIds || []
        this.cardLayout?.destroyAllChildren()
        let hotEquips: Node[] = []
        let nomalEquips: Node[] = []
        this._cardKV = {}
        const currEquipType = this.mTabBar.equipType
        let count = 0
        for (const key in _cardIds) {
            if (currFlay != this.flag) break
            const equipId = _cardIds[key]
            const equipData = this.equipManager.playEquips.getEquipmentById(equipId)
            const _equipCfg = TableEquip.getInfoById(equipData?.protoId)
            if (currEquipType != core.EquipmentType.EquipmentTypeNone) {
                if (_equipCfg.equipment_type != currEquipType) continue
            }
            const copyPrefab = instantiate(equipCom);
            // this.cardLayout.addChild(copyPrefab)
            const hasHot = this.equipManager.equipHots.has(equipId)
            if (hasHot) {
                hotEquips.push(copyPrefab)
            } else {
                nomalEquips.push(copyPrefab)
            }
            const equipPrefab = copyPrefab.getComponent(EquipmentPrefab)
            equipPrefab?.init({
                id: equipId,
                equipPrefabType: EquipPrefabType.NumInfoHasPower,
                cb: () => this.changePopState(EEquipmentPop.KNAPSACK_CARD_INFO, equipPrefab),
                userOtherGroup: this.equipManager.playEquipGroup.hasOtherCardGroup(equipId)
            })
            if (hasHot) equipPrefab.openHot(true)
            if (_cardGroupKV[equipId]) copyPrefab.active = false
            this._cardKV[equipId] = equipPrefab
            count++
        }
        this.mTabBar.setShowNum(count)
        let hotIdx = 0
        for (const equipNode of hotEquips) {
            if (hotIdx % 50 == 0) await CommonUtil.waitCmpt(this, 0)
            if (currFlay != this.flag) break
            this.cardLayout.addChild(equipNode)
            hotIdx++
        }
        let nomalIdx = 0
        for (const equipNode of nomalEquips) {
            if (nomalIdx % 50 == 0) await CommonUtil.waitCmpt(this, 0)
            if (currFlay != this.flag) break
            this.cardLayout.addChild(equipNode)
            nomalIdx++
        }

        // hotEquips.concat(nomalEquips).forEach(equipNode => {
        //     this.cardLayout.addChild(equipNode)
        // })
    }

    private d1: EquipInfoPrefabParam = {
        cb: (event, cbFlag) => this.cb(event, cbFlag),
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

    private d2: EquipInfoPrefabParam = {
        cb: (event, cbFlag) => this.cb(event, cbFlag),
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

    private cb(event, cbFlag: string) {
        if (cbFlag == "etpop_banner_btn_info") {
            const args: IEquipInfoPopCfg = { id: this.equipPop?.param?.id, isGroup: true }
            oops.gui.open(UIID.EquipmentCardInfoPop, args)
        } else if (cbFlag == "etpop_banner_btn_remove") {
            this.upCardGroup(false)
        } else if (cbFlag == "etpop_btn_info") {
            const args: IEquipInfoPopCfg = {
                id: this.equipPop?.param?.id,
                equipClick: (_) => this.upCardGroup(true)
            }
            oops.gui.open(UIID.EquipmentCardInfoPop, args)
        } else if (cbFlag == "etpop_btn_use") {
            this.upCardGroup(true)
        }
    }

    private async upCardGroup(isAdd: boolean) {
        const cardId = this.equipPop?.param?.id
        if (cardId) this.equipManager.playEquipGroup.upCardGroup(cardId, isAdd)
        this.equipPop?.hide()
    }

    // private refreshGroupData() {
    //     this.updateCard(-1)
    //     this.equipPop?.hide()
    // }

    private refreshData() {
        this.initBtmCards()
        this.equipPop?.hide()
    }

    private hotRefresh(event, cardId: number) {
        if (this._cardKV[cardId]) this._cardKV[cardId].openHot(false)
    }

    async onLoad() {
        this.addEvent();
        if (!this.equipPop) {
            this.equipPop = await ResManger.getInstance().getEquipInfoPrefab()
            if (this.equipPop) this.node.addChild(this.equipPop.node)
        }
        this.mTabBar.addListener(
            {
                init: (type) => this.initBtmCards(),
                itemClick: (type) => this.initBtmCards(),
            }
        )
        this.banners.init({
            listener: {
                itemClick: (cardNode: EquipmentPrefab) => this.changePopState(EEquipmentPop.POLL_CARD_INNFO, cardNode),
                onListPageChange: (pageNum) => {
                    // this.refreshData()
                }
            }
        })
    }

    onDestroy() {
        this.removeEvent();
    }

      
    private addEvent() {
        Message.on(GameEvent.EquipGroupDataRefresh, this.refreshData, this);
        Message.on(DataEvent.DATA_CURREQUIPGROUPID_CHANGE, this.refreshData, this);
        Message.on(GameEvent.EquipDataRefresh, this.refreshData, this);
        Message.on(GameEvent.EquipHotDeleteRefresh, this.hotRefresh, this);
    }

      
    private removeEvent() {
        Message.off(GameEvent.EquipGroupDataRefresh, this.refreshData, this);
        Message.off(DataEvent.DATA_CURREQUIPGROUPID_CHANGE, this.refreshData, this);
        Message.off(GameEvent.EquipDataRefresh, this.refreshData, this);
        Message.off(GameEvent.EquipHotDeleteRefresh, this.hotRefresh, this);
    }
}

