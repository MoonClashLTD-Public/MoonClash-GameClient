import { CardUtils } from "../../common/utils/CardUtils"
import { PlayerManger } from "../../data/playerManager"
import WalletUtil, { TradeFlagState } from "../../walletUI/WalletUtil"

export class EquipSystemUtils {

    /**
       
     */
    public static isPlayPve(equip: core.IEquipment) {
        if (!equip) return false
        return CardUtils.isToDay(equip?.pvePower)
    }

    /**
       
     */
    public static isPlayPveByEquipId(equipId: number) {
        const equip = PlayerManger.getInstance().equipManager.playEquips.getEquipmentById(equipId)
        if (!equip) return false
        return CardUtils.isToDay(equip?.pvePower)
    }

    /**
       
     */
    public static isHiddenByCard(card: core.IEquipment) {
        if (!card) return true
        const state = card?.state ?? 0

        const canShow = card?.state == core.NftState.NftStateLock
            || card?.state == core.NftState.NftStateLockInGame
            || state == core.NftState.NftStateBlank
        return !canShow
    }
    /**
       
     */
    public static isHiddenByCardId(cardId: number) {
        const card = PlayerManger.getInstance().equipManager.playEquips.getEquipmentById(cardId)
        return this.isHiddenByCard(card)
    }

    /**
  
    */
    public static isHiddenPVEByCard(card: core.IEquipment) {
        if (!card) return true
        const state = card?.state ?? 0
        const canShow = card?.state == core.NftState.NftStateLock
            || card?.state == core.NftState.NftStateLockInGame
            || state == core.NftState.NftStateBlank
            || state == core.NftState.NftStateAssist
        return !canShow
    }

    /**
  
    */
    public static isHiddenPVEByEquipId(cardId: number) {
        const card = PlayerManger.getInstance().equipManager.playEquips.getEquipmentById(cardId)
        return this.isHiddenPVEByCard(card)
    }

    /**
      
      
      
    */
    public static canClickBtn(param: { cardId?: number, equip?: core.IEquipment }) {
        let _card: core.IEquipment
        if (param?.cardId) {
            _card = PlayerManger.getInstance().equipManager.playEquips.getEquipmentById(param.cardId)
        } else if (param?.equip) {
            _card = param.equip
        }
        if (!_card) return false
        return _card?.state == core.NftState.NftStateBlank
    }


    /**
     
     
     
   */
    public static canGoGame(param: { cardId?: number, equip?: core.IEquipment }) {
        let _card: core.IEquipment
        if (param?.cardId) {
            _card = PlayerManger.getInstance().equipManager.playEquips.getEquipmentById(param.cardId)
        } else if (param?.equip) {
            _card = param.equip
        }
        if (!_card) return false
        return _card?.state == core.NftState.NftStateBlank
    }
}