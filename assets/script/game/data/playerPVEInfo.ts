import { Message } from "../../core/common/event/MessageManager";
import { tips } from "../../core/gui/prompt/TipsManager";
import { oops } from "../../core/Oops";
import { CardSystemUtils } from "../card/utils/cardSystemUtils";
import { GameEvent } from "../common/config/GameEvent";
import { UIID } from "../common/config/GameUIConfig";
import HttpHome from "../common/net/HttpHome";
import { netChannel } from "../common/net/NetChannelManager";
import TableEquip from "../common/table/TableEquip";
import { IPVEFullCardGroupConfig } from "../pve/PVEFightPop";
import { DataBase } from "./dataBase";
import { PlayerManger } from "./playerManager";
export interface IPVEAssistCard {
    friendCard?: wafriend.IFriend
    assistCardId?: number
    assistBy?: number
    assistByPct?: number
}
export class PlayerPVEInfo extends DataBase {

    private _equipGroupCards: core.IEquipment[]
    private _cardGroupCards: core.ICard[]
    private _assistCard?: IPVEAssistCard

    get equipGroupCards() {
        return this._equipGroupCards || []
    }

    get cardGroupCards() {
        return this._cardGroupCards || []
    }

    get assistCard() {
        return this._assistCard
    }

    private get equipManager() {
        return PlayerManger.getInstance().equipManager.playEquips
    }

    init() {
        this.addEvent();
    }

    async updData(): Promise<boolean> {
        await Promise.all<boolean>([this.getCards(), this.getEquips()])
        return true
    }

    private async getCards() {
        let d = await netChannel.home.reqUnique(opcode.OpCode.CsPVECardsQueryReq, opcode.OpCode.ScPVECardsQueryResp, pkgcs.CsPVECardsSaveReq.create());
        await this.initCards(d)
        return true;
    }

    private async getEquips() {
        let d = await netChannel.home.reqUnique(opcode.OpCode.CsPVEEquipsQueryReq, opcode.OpCode.ScPVEEquipsQueryResp, pkgcs.CsPVECardsQueryReq.create());
        this._equipGroupCards = d.equips || []
        return true;
    }

    private async initCards(d: pkgsc.ScPVECardsQueryResp) {
        const assistByCardId = d?.assistByCardId ?? 0
        let hasAssist = false
        const _cards = (d?.cards || []).map((card, idx) => {
            const cardId = card?.id ?? 0
            if (cardId != 0 && CardSystemUtils.isHiddenByCard(card)) card.id = 0
            if (card.id == 0 && idx == 5 && assistByCardId != 0) {
                hasAssist = true
            }
            return card
        })
        if (hasAssist) {
            const _friendCard = await this.findFriendCard({ cId: assistByCardId })
            if (_friendCard) {
                this._assistCard = {
                    friendCard: _friendCard,
                    assistBy: d?.assistBy,
                    assistByPct: d?.assistByPct,
                    assistCardId: d?.assistByCardId
                }
            } else {

            }
        } else {
            this._assistCard = null
        }
        this._cardGroupCards = _cards
    }

    private frinedAssistCardKV: { [num: number]: wafriend.IFriend } = {}

    async getFriendCards() {
        this.frinedAssistCardKV = {}
        let cards: wafriend.IFriend[] = []
          
        let friendData = await HttpHome.friendshipQuery(0, core.FriendshipState.FssAccept);
        for (const friend of friendData.friends) {
            const cardId = friend.assistedCard?.id ?? 0
            if (cardId != 0) {
                cards.push(friend)
                this.frinedAssistCardKV[cardId] = friend
            }
        }
        return cards
    }


    private async findFriendCard(param: { fId?: number, cId: number }) {
        // const fId = param?.fId ?? 0
        const cId = param?.cId ?? 0
        if (cId == 0) return
        this.frinedAssistCardKV = {}
        let friendData = await HttpHome.friendshipQuery(0, core.FriendshipState.FssAccept);
        let _friendData: wafriend.IFriend
        for (const friend of friendData.friends) {
            const cardId = friend.assistedCard?.id ?? 0
            if (cardId != 0) this.frinedAssistCardKV[cardId] = friend
            if (cardId == cId) _friendData = friend
        }
        return _friendData
    }

    isPVEAssist(cardId: number) {
        return !!this.frinedAssistCardKV[cardId]
    }

    /**
      
  
  
  
    */
    async upCardGroup(param: { netId?: number; isAdd?: boolean; isAssist?: boolean, card: core.ICard }) {
        const card = param.card
        const netId = param.card?.id ?? 0
        const isAdd = param.isAdd ?? false
        const isAssist = param.isAssist ?? false
        if (this._cardGroupCards.length == 6) {
            let isFull = true
            let upCards = this._cardGroupCards.map((card, idx) => {
                let cardID = card?.id ?? 0
                if (this._assistCard && idx == 5 && cardID == 0)
                    cardID = this._assistCard.assistCardId
                if (isAdd) {
                    const canUpCard = isAssist ? idx == 5 : cardID == 0
                    if (canUpCard && isFull) {
                        cardID = netId
                        isFull = false
                    }
                } else {
                    if (cardID == netId) cardID = 0
                }
                return cardID
            })
            if (!isFull || !isAdd || isAssist) {
                this._setCardGroupNet(upCards)
            } else {
                  
                const param: IPVEFullCardGroupConfig = {
                    cb: async (cardId, cardGroupIdx) => {
                        const _friendCard = await this.findFriendCard({ cId: cardId })
                        if (_friendCard && cardGroupIdx != 5) {
                            tips.errorTip('pve_card_assits_err', true)
                            Message.dispatchEvent(GameEvent.PVECardGroupSaveRefresh, false)
                            return
                        }
                        let upCards = this._cardGroupCards.map((card, idx) => {
                            let _nCardId = card?.id || 0
                            if (this._assistCard && idx == 5 && _nCardId == 0) _nCardId = this._assistCard.assistCardId
                            if (idx == cardGroupIdx) _nCardId = cardId
                            return _nCardId
                        })
                        const ok = await this._setCardGroupNet(upCards)
                        Message.dispatchEvent(GameEvent.PVECardGroupSaveRefresh, ok)
                    },
                    card: card
                }
                oops.gui.open(UIID.PVECardSysFightPop, param)
            }
        }
    }

    private async _setCardGroupNet(upCards: number[]) {
        return new Promise<boolean>(async (resolve, reject) => {
            let data = pkgcs.CsPVECardsSaveReq.create();
            data.cardIds = upCards
            let d = await netChannel.home.reqUnique(opcode.OpCode.CsPVECardsSaveReq, opcode.OpCode.ScPVECardsSaveResp, data);
            if (d.code == errcode.ErrCode.Ok) {
                this.refreshCardData()
            }
            resolve(d?.code == errcode.ErrCode.Ok)
        })
    }

    /**
      
  
  
    */
    async upEquipGroup(netId: number, isAdd: boolean) {
        const _equip = this.equipManager.getEquipmentById(netId)
        const tableCfg = TableEquip.getInfoById(_equip?.protoId)
        if (!tableCfg) throw new Error("equip cfg not found");
        if (tableCfg.equipment_type != core.EquipmentType.EquipmentTypeNone) {
            const _groupInIdx = tableCfg.equipment_type.valueOf() - 1
            if (_groupInIdx < 0 || _groupInIdx > 2) throw new Error(`equip cfg equipment_type throw ${_groupInIdx}`);
            const _cards = this._equipGroupCards
            if (_cards.length == 3) {
                let upCards = _cards.map((card, idx) => {
                    let cardID = card?.id || 0
                    if (idx == _groupInIdx) {
                        cardID = isAdd ? netId : 0
                    }
                    return cardID
                })
                this._setEquipCardGroupNet(upCards)
            }
        }
    }

    private async _setEquipCardGroupNet(upCards: number[]) {
        let data = pkgcs.CsPVEEquipsSaveReq.create();
        data.equipIds = upCards
        let d = await netChannel.home.reqUnique(opcode.OpCode.CsPVEEquipsSaveReq, opcode.OpCode.ScPVEEquipsSaveResp, data);
        if (d.code == errcode.ErrCode.Ok) {
            this.refreshEquipData()
        }
    }


    getCardGroupPower() {
        let combat = new BigNumber(0)
        this._cardGroupCards.forEach((card, idx) => {
            const _cardId = card?.id ?? 0
            if (_cardId == 0 && idx == 5 && this._assistCard) {
                combat = combat.plus(this.getCardPower(this._assistCard?.friendCard?.assistedCard));
            } else if (_cardId != 0) {
                const cardData = PlayerManger.getInstance().cardManager.playCard.getNetCardById(_cardId);
                combat = combat.plus(this.getCardPower(cardData))
            }
        });
        return Number(combat.toFixed(2, 1))
    }

      
    get getPveCardGroup() {
        let nCardGroup: core.ICard[] = []
        this._cardGroupCards.forEach((card, idx) => {
            const _cardId = card?.id ?? 0
            if (_cardId == 0 && idx == 5 && this._assistCard) {
                nCardGroup.push(this._assistCard?.friendCard?.assistedCard)
            } else {
                nCardGroup.push(card)
            }
        });
        return nCardGroup
    }

    private getCardPower(cardData: core.ICard) {
        let power = 0;
        if (!!cardData) {
            if (cardData.fromGold) {   
                power += 4;
                power += cardData.level;

                if (cardData.attrs.length == 2) {
                    power += 5;
                } else if (cardData.attrs.length == 3) {
                    power += 13;
                }
            } else if (cardData.localBound) {   
            } else {   
                power += cardData.level;

                if (cardData.attrs.length == 2) {
                    power += 5;
                } else if (cardData.attrs.length == 3) {
                    power += 13;
                }
            }
        }
        return power;
    }

    getEquipGroupPower() {
        let combat = new BigNumber(0)
        this._equipGroupCards.forEach(card => {
            combat = combat.plus(this.getEquipPower(card.id))
        });
        return Number(combat.toFixed(2, 1))
    }

    getEquipPower(id: number) {
        const equipDisCfg = PlayerManger.getInstance().equipManager.playEquips.getDispostionCfgById({ netId: id })
        return equipDisCfg?.tCombit || 0
    }


      
    async refreshCardData() {
        await this.getCards()
        Message.dispatchEvent(GameEvent.PVECardGroupDataRefresh)
    }
      
    private async refreshEquipData() {
        await this.getEquips()
        Message.dispatchEvent(GameEvent.PVEEquipGroupDataRefresh)
    }


    destory() {
        this.removeEvent();
    }

    addEvent() {
        // Message.on(`${opcode.OpCode.ScBlindBoxOpenPush}`, this.ScBlindBoxOpenPush, this);
    }
    removeEvent() {
        // Message.off(`${opcode.OpCode.ScBlindBoxOpenPush}`, this.ScBlindBoxOpenPush, this);
    }

    getCardNumsByProtoId(protoId: number) {
        let _num = 0
        this._cardGroupCards?.forEach(card => {
            if (card?.protoId == protoId) _num++
        })
        return _num
    }

    get canBattle() {
        let canBattle = true
        let i = 0
        for (const cardgroup of this._cardGroupCards) {
            const cardId = cardgroup?.id ?? 0
            if (i == 5 && this._assistCard && cardId == 0) {
            } else if (cardId == 0) {
                canBattle = false
                break;
            }
            i++
        }
        return canBattle
    }
}