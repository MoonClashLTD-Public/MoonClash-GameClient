import { _decorator, Component, Node, log, Label } from 'cc';
import { Message } from '../../../../core/common/event/MessageManager';
import { LanguageLabel } from '../../../../core/gui/language/LanguageLabel';
import { CardPrefab, CardPrefabParam, CardPrefabType } from '../../../common/common/CardPrefab';
import { GameEvent } from '../../../common/config/GameEvent';
import { CardCfg } from '../../../common/table/TableCards';
import TableHeroes from '../../../common/table/TableHeroes';
import { CardUtils } from '../../../common/utils/CardUtils';
import { CardSystemUtils } from '../../utils/cardSystemUtils';
import { ICSCardPopCfg } from '../../utils/enum';
const { ccclass, property } = _decorator;

@ccclass('CSNameLevelItem')
export class CSNameLevelItem extends Component {
    @property(CardPrefab)
    private cardPrefab: CardPrefab = null
    @property(LanguageLabel)
    private nameLb: LanguageLabel = null
    @property(LanguageLabel)
    private cardTypeLb: LanguageLabel = null
    @property(LanguageLabel)
    private levelLb: LanguageLabel = null
    @property(Label)
    private power: Label = null
    @property(Label)
    private isPlayPveLb: Label = null
    private _cardCfg: CardCfg

    private config: ICSCardPopCfg
    init(p: ICSCardPopCfg) {
        this.config = p
        const param: CardPrefabParam = {
            cardPrefabType: CardPrefabType.NumInfoNoPower,
        }
        if (p.netId) {
            param.id = p.netId
        } else if (p.lId) {
            param.cardId = p.lId
        } else {
            param.cardPrefabType = CardPrefabType.None
        }

        this.cardPrefab.init(param)
        const cardCom = this.cardPrefab.cardInfoCom
        if (cardCom) {
            const cardData = cardCom.getCardData()
            const cardCfg = cardCom.getCardCfg()
            if (this.nameLb) this.nameLb.dataID = cardCfg.name
            if (this.levelLb) this.levelLb.params[0].value = `${cardCfg?.level || 0}`
              
            if (p.lId) {
                this.power.string = `${cardCfg?.max_power}/${cardCfg.max_power}`
            } else {
                this.power.string = `${cardData?.power || 0}/${cardCfg.max_power}`
            }

            this.isPlayPveLb.string = `${CardSystemUtils.isPlayPve(cardData) ? 0 : 1}/1`

            const summons = cardCfg.summons || []
            if (summons.length > 0 && this.cardTypeLb) {
                this.cardTypeLb.node.active = true
                const heroInfo = TableHeroes.getInfoById(summons[0].id)
                const str = CardUtils.formatHeroesUnit(heroInfo?.type)
                this.cardTypeLb.dataID = str || ''
            } else {
                if (this.cardTypeLb) this.cardTypeLb.node.active = false
            }
            this._cardCfg = cardCfg
        }
    }

    get getCardName() {
        return this.nameLb.string
    }

    get cardCfg() {
        return this._cardCfg
    }


    get curCardPrefab() {
        return this.cardPrefab
    }

    private upViews() {
        if (this.config?.netId) {
            const param: CardPrefabParam = {
                cardPrefabType: CardPrefabType.NumInfoNoPower,
                id: this.config.netId,
            }
            this.cardPrefab.init(param)
            const cardCom = this.cardPrefab.cardInfoCom
            if (cardCom) {
                const cardData = cardCom.getCardData()
                const cardCfg = cardCom.getCardCfg()
                if (this.levelLb) {
                    this.levelLb.params[0].value = `${cardCfg?.level || 0}`
                    this.levelLb.forceUpdate()
                }
                if (this.power) this.power.string = `${cardData?.power || 0}/${cardCfg.max_power}`
                this._cardCfg = cardCfg
            }
        }
    }

    onLoad() {
        Message.on(GameEvent.CardDataRefresh, this.upViews, this);
    }

    onDestroy() {
        this.config = null
        Message.off(GameEvent.CardDataRefresh, this.upViews, this);
    }
}
