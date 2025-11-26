import { _decorator, Component, Node, Label } from 'cc';
import { LanguageLabel } from '../../../../core/gui/language/LanguageLabel';
import { ILCardTypeData } from '../../../data/card/playerCards';
import { PlayerManger } from '../../../data/playerManager';
import { CardSystemUtils } from '../../utils/cardSystemUtils';
const { ccclass, property } = _decorator;
enum ICardTypeState {
    NOMAIL,
    SORT_BY_LEVEL,
    PVE_POWER
}
export interface ILCardData {
    groupTypeId: number,
    cost: number,
    showCardId: number
    level: number
    hasHot?: boolean
}
@ccclass('CardTypeTabBar')
export class CardTypeTabBar extends Component {
    @property(LanguageLabel)
    private btnLb: LanguageLabel = null
    @property(Label)
    private numLb: Label = null
    private tabBarState = ICardTypeState.NOMAIL
    private get cardManager() {
        return PlayerManger.getInstance().cardManager
    }
    cb: ICardTypeTabBarLisetener
    init(listener: ICardTypeTabBarLisetener) {
        this.cb = listener
        // this.cb && this.cb.onChoose && this.cb.onChoose()
        if (listener?.isPVE) this.tabBarState = ICardTypeState.PVE_POWER
        this.upBtnLb()

    }

    getNewPVPCards() {
        const cardList = this.cardManager.playCard.pvpShowNetCards || []
        let hotCards: ILCardData[] = []
        let nomalCards: ILCardData[] = []
        for (const mCard of cardList) {
            const hasHot = this.cardManager.cardHots.has(mCard.showCardId)
            if (hasHot) {
                mCard.hasHot = true
                hotCards.push(mCard)
            } else {
                mCard.hasHot = false
                nomalCards.push(mCard)
            }
        }
        nomalCards.sort((a, b) => {
            if (a.level != b.level && this.tabBarState == ICardTypeState.SORT_BY_LEVEL) return b.level - a.level
            if (a.cost == b.cost) return a.groupTypeId - b.groupTypeId
            return a.cost - b.cost
        })
        return hotCards.concat(nomalCards)
    }

    getPVECardTypes() {
        const cardList = this.cardManager.playCard.pveShowNetCards || []
        let nomalCards: ILCardTypeData[] = cardList
        nomalCards.sort((a, b) => {
            const aPower = CardSystemUtils.isPlayPveByCardId(a.showCardId) ? 0 : 1
            const bPower = CardSystemUtils.isPlayPveByCardId(b.showCardId) ? 0 : 1
            if (aPower != bPower && this.tabBarState == ICardTypeState.PVE_POWER) return bPower - aPower
            if (a.level != b.level && this.tabBarState == ICardTypeState.SORT_BY_LEVEL) return b.level - a.level
            if (a.cost == b.cost) return a.groupTypeId - b.groupTypeId
            return a.cost - b.cost
        })
        return nomalCards
    }

    setNumStr(str: string) {
        this.numLb.string = str
    }

    private tabClick() {
          
        PlayerManger.getInstance().cardManager.readAllHot();
        
        const pveB = this.cb.isPVE ?? false
        if (pveB) {
            switch (this.tabBarState) {
                case ICardTypeState.PVE_POWER:
                    this.tabBarState = ICardTypeState.NOMAIL
                    break;
                case ICardTypeState.NOMAIL:
                    this.tabBarState = ICardTypeState.SORT_BY_LEVEL
                    break;
                case ICardTypeState.SORT_BY_LEVEL:
                    this.tabBarState = ICardTypeState.PVE_POWER
                    break;
                default:
                    break;
            }
        } else {
            this.tabBarState = ICardTypeState.NOMAIL == this.tabBarState ?
                ICardTypeState.SORT_BY_LEVEL : ICardTypeState.NOMAIL
        }
        this.cb && this.cb.onChoose && this.cb.onChoose()
        this.upBtnLb()
    }

    private upBtnLb() {
        if (this.tabBarState == ICardTypeState.NOMAIL) {
            this.btnLb.dataID = 'card_type_nomal'
        } else if (this.tabBarState == ICardTypeState.SORT_BY_LEVEL) {
            this.btnLb.dataID = 'card_type_by_level'
        } else if (this.tabBarState == ICardTypeState.PVE_POWER) {
            this.btnLb.dataID = 'card_type_by_pve_power'
        }
        this.btnLb.forceUpdate()
    }
}

export interface ICardTypeTabBarLisetener {
    onChoose: Function,
    isPVE?: boolean
}

