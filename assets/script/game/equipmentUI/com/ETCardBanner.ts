import { _decorator, Component } from 'cc';
import { Message } from '../../../core/common/event/MessageManager';
import { oops } from '../../../core/Oops';
import { GameEvent } from '../../common/config/GameEvent';
import { UIID } from '../../common/config/GameUIConfig';
import { EquipmentPrefab, EquipPrefabType, EquipPrefabParam } from '../../common/equipment/EquipmentPrefab';
import { PlayerManger } from '../../data/playerManager';
import { ResManger } from '../../data/resManger';
import { EEquipmentPop, IEquipGroupPopCfg } from '../utils/enum';
import { ETCardGroupClickItemListener } from '../utils/fun';
const { ccclass, property } = _decorator;

@ccclass('ETCardBanner')
export class ETCardBanner extends Component {
    @property([EquipmentPrefab])
    private equipCards: EquipmentPrefab[] = []

    private get equipManager() {
        return PlayerManger.getInstance().equipManager
    }

    private config: IInitETCardBannner
    private _equipKV: { [key: number]: EquipmentPrefab } = [];
    init(params: IInitETCardBannner) {
        this._equipKV = {}
        this.config = params
        const _equipGroup = this.equipManager.playEquipGroup.getCardGroupById(params.groupId)
        this.equipCards.forEach((equipCard, i) => {
            const equipId = _equipGroup.equipments[i]?.id ?? 0

            const equipParam: EquipPrefabParam = {
                id: equipId,
                equipPrefabType: EquipPrefabType.None,
            }
            if (equipId != 0) {
                equipParam.equipPrefabType = EquipPrefabType.NumInfoHasPowerAndBg
                if (params.fun?.itemClick) equipParam.cb = () => params.fun.itemClick(equipCard)
            }
            equipCard?.init(equipParam)
            if (equipId != 0) {
                const hasHot = this.equipManager.equipHots.has(equipId)
                if (hasHot) equipCard.openHot(true)
                if (hasHot) this._equipKV[equipId] = equipCard
            }
        })
    }

    openMuitRepair() {
        const args: IEquipGroupPopCfg = { id: this.config?.groupId }
        oops.gui.open(UIID.EquipmentMuitRepairPop, args)
    }

    private hotRefresh(event, cardId: number) {
        if (this._equipKV[cardId]) this._equipKV[cardId].openHot(false)
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

export interface IInitETCardBannner {
    groupId: number
    fun?: ETCardGroupClickItemListener
}


