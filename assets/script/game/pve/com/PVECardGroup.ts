import { _decorator, Component, Node, instantiate, Prefab, ScrollView, Label, } from 'cc';
import { Message } from '../../../core/common/event/MessageManager';
import { CardPrefab, CardPrefabParam, CardPrefabType } from '../../common/common/CardPrefab';
import { GameEvent } from '../../common/config/GameEvent';
import { EquipmentPrefab, EquipPrefabParam, EquipPrefabType } from '../../common/equipment/EquipmentPrefab';
import { PlayerManger } from '../../data/playerManager';
import { PveCardFunction, PveEquipFunction } from '../utils/enum';
const { ccclass, property } = _decorator;
@ccclass('PVECardGroup')
export class PVECardGroup extends Component {
    @property([CardPrefab])
    private cardPrefabs: CardPrefab[] = []
    @property([EquipmentPrefab])
    private equipCards: EquipmentPrefab[] = []
    @property(Label)
    private costLb: Label = null
    @property(Label)
    private combatLb: Label = null
    get cardNodes() {
        return this.cardPrefabs
    }
    /*  
      
    */
    private config: IInitPVECardGroupCfg
    private openAnim: boolean
    init(param?: IInitPVECardGroupCfg) {
        this.config = param
        this.openAnim = param.openAnim || false
        this.upViews()
    }

    combat = new BigNumber(0)
    async upViews() {
        this.combat = new BigNumber(0)
        this.upCards()
        this.upEquips()
        if (this.combatLb) this.combatLb.string = this.combat.toFixed(1, 1)
    }

    upCards() {
        const _cardIds = PlayerManger.getInstance().pveInfo.cardGroupCards || []
        const _assistCard = PlayerManger.getInstance().pveInfo.assistCard
        let totalFood = 0
        let len = 0
          
        const isAssist = this.config.isAssist ?? false
        this.cardPrefabs.forEach((cardPrefab, i) => {
            const _cardId = _cardIds[i]?.id ?? 0
            const cardParam: CardPrefabParam = {
                cardPrefabType: CardPrefabType.None
            }
            if (_cardId != 0 || (_assistCard && i == 5)) {
                cardParam.card = _cardId != 0 ? _cardIds[i] : _assistCard?.friendCard?.assistedCard
                cardParam.cardPrefabType = (isAssist && i != 5) ? CardPrefabType.NewPVEInfoBanner : CardPrefabType.NewPVEInfoBannerHasDelete
                const cardManager = PlayerManger.getInstance().cardManager.playCard
                const _cfg = cardManager.getTableCfgByNetId(_cardId)
                totalFood += _cfg?.cost || 0
                len += 1
                // this.combat = this.combat.plus(PlayerManger.getInstance().pveInfo.getCardPower(_cardId))
                if (i == 5) {
                    if (this.config && this.config?.cb2) cardParam.cb = () => this.config.cb2(cardPrefab, i)
                } else {
                    if (this.config && this.config?.cb1) cardParam.cb = () => this.config.cb1(cardPrefab, i)
                }
                if (this.config && this.config?.removeClick) cardParam.remove = () => this.config.removeClick(cardPrefab, i)
            } else {
                if (i == 5) {
                    cardParam.cardPrefabType = CardPrefabType.NoneAdd
                    if (this.config && this.config?.cb2) cardParam.cb = () => this.config.cb2(cardPrefab, i)
                }
            }
            cardPrefab?.init(cardParam)
            cardPrefab?.cardTopCom?.openAssist(_assistCard && i == 5)
            if (this.openAnim) cardPrefab?.rumAnim()
        })

        this.combat = this.combat.plus(PlayerManger.getInstance().pveInfo.getCardGroupPower());

        if (this.costLb) this.costLb.string = `${len > 0 ? (totalFood / len).toFixed(1) : '0'}`
    }

    /*  
  
  
  
  
         */
    private upEquips() {
        const _cardIds = PlayerManger.getInstance().pveInfo.equipGroupCards || []
        this.equipCards.forEach((cardPrefab, i) => {
            const _equipId = _cardIds[i]?.id ?? 0
            const equipParam: EquipPrefabParam = {
                id: _equipId,
                equipPrefabType: EquipPrefabType.None
            }
            if (_equipId != 0) {
                equipParam.equipPrefabType = EquipPrefabType.NewPveInfoBannerHasDelete
                if (this.config && this.config?.cb1) equipParam.cb = () => this.config.cb3(cardPrefab)
                if (this.config && this.config?.removeEquipClick) equipParam.remove = () => this.config.removeEquipClick(cardPrefab, i)
                const c = PlayerManger.getInstance().pveInfo.getEquipPower(_equipId)
                this.combat = this.combat.plus(c)
            }
            cardPrefab?.init(equipParam)
        })
    }

    onLoad() {
        this.addEvent();
    }

    onDestroy() {
        this.removeEvent();
    }

    private addEvent() {
        Message.on(GameEvent.PVECardGroupDataRefresh, this.upViews, this);
        Message.on(GameEvent.PVEEquipGroupDataRefresh, this.upViews, this);
    }

    private removeEvent() {
        Message.off(GameEvent.PVECardGroupDataRefresh, this.upViews, this);
        Message.off(GameEvent.PVEEquipGroupDataRefresh, this.upViews, this);
    }
}
export interface IInitPVECardGroupCfg {
      
    cb1?: PveCardFunction
      
    cb2?: PveCardFunction

      
    cb3?: PveEquipFunction

    removeClick?: (cardNode: CardPrefab, idx?: number) => void
    removeEquipClick?: (cardNode: EquipmentPrefab, idx?: number) => void
    openAnim?: boolean

    isAssist?: boolean
}

