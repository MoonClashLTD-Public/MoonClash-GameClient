import { tips } from "../../../core/gui/prompt/TipsManager"
import { CardUtils } from "../../common/utils/CardUtils"
import { PlayerManger } from "../../data/playerManager"
import WalletUtil, { TradeFlagState } from "../../walletUI/WalletUtil"

export class CardSystemUtils {
    /**
    * pve
    */
    public static isPlayPve(card: core.ICard) {
        if (!card) return false
        return CardUtils.isToDay(card?.pvePower)
    }

     /**
    * pve
    */
     public static isPlayPveByCardId(cardId: number) {
        const card = PlayerManger.getInstance().cardManager.playCard.getNetCardById(cardId)
        if (!card) return false
        return CardUtils.isToDay(card?.pvePower)
    }

    /**
    * 、
    */
    public static isRent(card: core.ICard) {
        if (!card) return { ok: false }
        const rentState = WalletUtil.getRentState(card)
        const walletState = rentState?.state
        const _rent = walletState == TradeFlagState.RENT_TIME || walletState == TradeFlagState.RENT;
        return { ok: _rent, rentState: rentState }
    }

    /**
     * ，
     * ，，，
     */
    private static isBlankCard(card: core.ICard) {
        return card?.state == core.NftState.NftStateRenting && !this.isRent(card)?.ok;
    }

    /**
     * 、
     * 
     */
    public static isHiddenByCard(card: core.ICard) {
        if (!card) return true
        const state = card?.state ?? 0
        let canShow = this.isRent(card)?.ok

        if (!canShow && this.isBlankCard(card)) return false

        if (!canShow) {
            canShow = (state == core.NftState.NftStateBlank
                || state == core.NftState.NftStateLock
                || state == core.NftState.NftStateLockInGame)
        }
        return !canShow
    }
    /**
     * 
     */
    public static isHiddenByCardId(cardId: number) {
        const card = PlayerManger.getInstance().cardManager.playCard.getNetCardById(cardId)
        return this.isHiddenByCard(card)
    }

    /**
    * PVE、、
    */
    public static isHiddenPVEByCard(card: core.ICard) {
        if (!card) return true
        const state = card?.state

        if (this.isBlankCard(card)) return false

        return (state != core.NftState.NftStateBlank
            && state != core.NftState.NftStateLock
            && state != core.NftState.NftStateLockInGame
            && state != core.NftState.NftStateAssist
        )
    }

    /**
    * PVE
    */
    public static isHiddenPVEByCardId(cardId: number) {
        const card = PlayerManger.getInstance().cardManager.playCard.getNetCardById(cardId)
        return this.isHiddenPVEByCard(card)
    }

    /**
    * 
    * mainCardId id
    * 
    */
    public static isHiddenUpGradeByCard(cardId: number, card: core.ICard) {
        if (!card) return true
        const id = card?.id ?? 0
        if (id == cardId || card?.level != 1 || id == 0) return true

        if (this.isBlankCard(card)) return false

        const state = card?.state ?? 0
        return state != core.NftState.NftStateBlank
    }

    /**
     *  
     * 
     *        
     */
    public static canClickBtn(param: { cardId?: number, card?: core.ICard }) {
        let _card: core.ICard
        if (param?.cardId) {
            _card = PlayerManger.getInstance().cardManager.playCard.getNetCardById(param.cardId)
        } else if (param?.card) {
            _card = param.card
        }
        if (!_card) return false

        if (this.isBlankCard(_card)) return true

        let canClick = !this.isRent(_card)?.ok
        if (canClick) canClick = _card?.state == core.NftState.NftStateBlank
        return canClick
    }

    /**
    *  
    * 
    *        
    */
    public static canGoGame(param: { cardId?: number, card?: core.ICard }) {
        let _card: core.ICard
        if (param?.cardId) {
            _card = PlayerManger.getInstance().cardManager.playCard.getNetCardById(param.cardId)
        } else if (param?.card) {
            _card = param.card
        }
        if (!_card) return false

        if (this.isBlankCard(_card)) return true

        let canClick = this.isRent(_card)?.ok
        if (!canClick) canClick = _card?.state == core.NftState.NftStateBlank
        return canClick
    }

}