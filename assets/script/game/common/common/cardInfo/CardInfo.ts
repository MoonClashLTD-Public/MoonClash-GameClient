import { _decorator, Sprite, SpriteFrame, Node } from "cc";
import { CardSystemUtils } from "../../../card/utils/cardSystemUtils";
import { ResManger } from "../../../data/resManger";
import TableCards, { CardCfg } from "../../table/TableCards";
import { CardPrefabType, showclassifyInfoKv } from "../CardPrefab";
import { CardInfoBase } from "./CardInfoBase";

const { ccclass, property } = _decorator;

@ccclass('CardInfo')
export class CardInfo extends CardInfoBase {
    @property(Sprite)
    cardSprite: Sprite = null
    @property(Node)
    private cardGroupBg: Node = null
    @property(Node)
    private lockNode: Node = null
    @property(Node)
    private assistTag: Node = null
    @property(Node)
    private otherCardGroupNode: Node = null

    init() {
        this.upCardSF()
    }

    private cardData: core.ICard
    private cardCgf: CardCfg
    private isMaxLevel = true
    private isFullPower = true
    private async upCardSF() {
        const cardPrefab = this.cardInfoPrefab
        const _id = cardPrefab?.param?.id
        const _cardId = cardPrefab?.param?.cardId
        const _cardProtoId = cardPrefab?.param?.cardProtoId
        const _card = cardPrefab?.param?.card
        this.isMaxLevel = true
        let cardCgf: CardCfg
        let card: core.ICard
        if (_id || _card) {
            card = _card ? _card : this.playerManager.cardManager.playCard.getNetCardById(_id)
            cardCgf = TableCards.getInfoByProtoIdAndLv(card.protoId, card.level)
            this.isMaxLevel = TableCards.getMaxLvByProtoId(card.protoId) == card?.level
            this.isFullPower = card?.power == cardCgf?.max_power
        } else if (_cardId) {
            cardCgf = TableCards.getInfoById(_cardId)
        }

        const _hasGroupBg = (cardPrefab.cardPrefabType == CardPrefabType.NumInfoHasPowerAndBg ||
            cardPrefab.cardPrefabType == CardPrefabType.NumInfoNoPowerAndBg ||
            cardPrefab.cardPrefabType == CardPrefabType.NewInfoBannerHasDelete)
        if (this.cardGroupBg) this.cardGroupBg.active = _hasGroupBg

        const showState = cardPrefab.cardPrefabType != CardPrefabType.MarketInfo
            && !!!showclassifyInfoKv[cardPrefab.cardPrefabType];
        const isLock = card?.state == core.NftState.NftStateLock
            || card?.state == core.NftState.NftStateLockInGame
        if (this.lockNode) this.lockNode.active = isLock && showState
        if (cardPrefab.cardPrefabType != CardPrefabType.MarketInfo) {
            if (_cardProtoId) {
                this.assistTag.active =
                    this.playerManager.cardManager.playCard.isHasRentInCardType(_cardProtoId)
            } else {
                this.assistTag.active = CardSystemUtils.isRent(card)?.ok == true
            }
        } else {
            this.assistTag.active = false
        }
        this.cardData = card
        this.cardCgf = cardCgf
        this.cardSprite.spriteFrame = await ResManger.getInstance().getIconSpriteFrame(cardCgf?.proto_id)

        if (this.cardInfoPrefab.cardTopCom && _hasGroupBg) {
              
            const isAssist = !!!(this.playerManager.cardManager.playCard.getNetCardById(card?.id || 0))
            this.cardInfoPrefab.cardTopCom.openAssist(isAssist)
        }

          
        this.cardInfoPrefab.cardTopCom.openBinding(!!card?.localBound);
    }

    getCardCfg() {
        return this.cardCgf
    }

    getCardData() {
        return this.cardData
    }

      
    setGray(bf: boolean = true) {
        if (this.cardSprite) this.cardSprite.grayscale = bf
    }

      
    setOtherGroup(bf: boolean = true) {
        if (this.otherCardGroupNode) this.otherCardGroupNode.active = bf
    }

    get canUpgrade() {
        return !this.isMaxLevel
    }

    get canAddPower() {
        return !this.isFullPower
    }
}