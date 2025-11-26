import { _decorator, Component, Node, instantiate, Prefab, ScrollView, Label, } from 'cc';
import { Message } from '../../../core/common/event/MessageManager';
import { GameEvent } from '../../common/config/GameEvent';
import { EquipmentPrefab, EquipPrefabType, EquipPrefabParam } from '../../common/equipment/EquipmentPrefab';
import { PlayerManger } from '../../data/playerManager';
import { PveEquipFunction } from '../utils/enum';
const { ccclass, property } = _decorator;
@ccclass('PVEEquipGroup')
export class PVEEquipGroup extends Component {
    @property([EquipmentPrefab])
    private equipPrefabs: EquipmentPrefab[] = []
    @property(Label)
    private combatLb: Label = null

    private cb: PveEquipFunction
    init(cb?: PveEquipFunction) {
        this.cb = cb
        this.updateView()
    }
    /*  
  
  
  
  
     */
    private updateView() {
        const _cardIds = PlayerManger.getInstance().pveInfo.equipGroupCards || []
        let combat = new BigNumber(0)
        this.equipPrefabs.forEach((cardPrefab, i) => {
            const _equipId = _cardIds[i]?.id ?? 0
            const equipParam: EquipPrefabParam = {
                id: _equipId,
                equipPrefabType: EquipPrefabType.None
            }
            if (_equipId != 0) {
                equipParam.equipPrefabType = EquipPrefabType.NumInfoNoPowerAndBg
                if (this.cb) equipParam.cb = () => this.cb(cardPrefab)
                const c = PlayerManger.getInstance().pveInfo.getEquipPower(_equipId)
                combat = combat.plus(c)
            }
            cardPrefab?.init(equipParam)
        })
        if (this.combatLb) this.combatLb.string = combat.toFixed(1, 1)
    }

    onLoad() {
        this.addEvent();
    }

    onDestroy() {
        this.removeEvent();
    }

    private addEvent() {
        Message.on(GameEvent.PVEEquipGroupDataRefresh, this.updateView, this);
    }

    private removeEvent() {
        Message.off(GameEvent.PVEEquipGroupDataRefresh, this.updateView, this);
    }
}

