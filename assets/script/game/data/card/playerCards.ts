import { oops } from "../../../core/Oops";
import { CardSystemUtils } from "../../card/utils/cardSystemUtils";
import { netChannel } from "../../common/net/NetChannelManager";
import TableCards, { CardCfg } from "../../common/table/TableCards";

export interface ILCardData {
    groupTypeId: number,
    cost: number,
    showCardId: number
    level: number
    hasHot?: boolean
}
export interface ILCardTypeData {
    groupTypeId: number,
    cost: number,
    showCardId: number
    level: number
    hasHot?: boolean
}
export class PlayerCards {
      
    private _netCards: core.ICard[] = [];
      
    private _netCardKV: { [key: number]: core.ICard } = [];
      
    private _cardTypeGroupKV: { [key: number]: number[] } = {}
      
    private _cardTypeGroupList: ILCardTypeData[] = []
      
    private _pveCardTypeGroupKV: { [key: number]: number[] } = {}
      
    private _pveCardTypeGroupList: ILCardTypeData[] = []
      
    private _pvpShowNetCards: ILCardData[] = []
      
    private _pveShowNetCards: ILCardData[] = []
      
    private _noCardKV: { [key: number]: number[] } = {}
      
    private cardArgs: { [k: string]: core.ICardArgToClient } = {}
    private _timeUpdateUUID: string = '';   
    init() {
        // this._timeUpdateUUID = oops.timer.schedule(this.timeUpdate.bind(this), 1)
        this.add()
    }
    add() {
        if (this._timeUpdateUUID) oops.timer.unschedule(this._timeUpdateUUID);
        this._timeUpdateUUID = oops.timer.schedule(this.timeUpdate.bind(this), 1)
    }

    async updData(): Promise<boolean> {
        let d = await netChannel.home.reqUnique(opcode.OpCode.CsCardQueryReq, opcode.OpCode.ScCardQueryResp, pkgcs.CsCardQueryReq.create());
        this._initData(d?.cards)
        this.cardArgs = d.args
        return true;
    }


    private async _initData(cCards: core.ICard[]) {
        const icards = cCards || []
        this._netCardKV = {}
        this._cardTypeGroupKV = {}
        this._cardTypeGroupList = []
        this._pveCardTypeGroupKV = {}
        this._pveCardTypeGroupList = []
        this._noCardKV = {}
          
        let _maxLevelCardTypeKV: { [key: number]: { ncard: core.ICard, cfg: CardCfg } } = {};
        let _pveMaxLevelCardTypeKV: { [key: number]: { ncard: core.ICard, cfg: CardCfg } } = {};
          
        const cardTypeNum: { [key: number]: number } = {}
          
        const _pveNetCards: ILCardData[] = []
          
        const _pvpNetCards: ILCardData[] = []
        for (const card of icards) {
            const cardId = card?.id ?? 0
            const proto_id = card.protoId
            if (cardTypeNum[proto_id]) {
                cardTypeNum[proto_id] += 1
            } else {
                cardTypeNum[proto_id] = 1
            }

            const hasTableCfg = TableCards.getInfoByProtoIdAndLv(proto_id, card.level)
            if (hasTableCfg) {
                const _listGType = {
                    ncard: card,
                    cfg: hasTableCfg
                }
                if (!CardSystemUtils.isHiddenByCard(card)) {
                    const nums = this._cardTypeGroupKV[proto_id]
                    if (nums) {
                        nums.push(cardId)
                        const currMaxLevel = _maxLevelCardTypeKV[proto_id]?.ncard?.level || 0
                        const currLevel = card.level || 0
                        if (currLevel > currMaxLevel) _maxLevelCardTypeKV[proto_id] = _listGType
                    } else {
                        this._cardTypeGroupKV[proto_id] = [cardId]
                        _maxLevelCardTypeKV[proto_id] = _listGType
                        // this._cardTypeGroupList.push(_listGType)
                    }
                    _pvpNetCards.push({ groupTypeId: proto_id, cost: hasTableCfg.cost, showCardId: cardId, level: card.level })
                }
                if (!CardSystemUtils.isHiddenPVEByCard(card)) {
                    const nums = this._pveCardTypeGroupKV[proto_id]
                    if (nums) {
                        nums.push(cardId)
                        const currMaxLevel = _pveMaxLevelCardTypeKV[proto_id]?.ncard?.level || 0
                        const currLevel = card.level || 0
                        if (currLevel > currMaxLevel) _pveMaxLevelCardTypeKV[proto_id] = _listGType
                    } else {
                        this._pveCardTypeGroupKV[proto_id] = [cardId]
                        _pveMaxLevelCardTypeKV[proto_id] = _listGType
                        // this._pveCardTypeGroupList.push(_listGType)
                    }
                    _pveNetCards.push({ groupTypeId: proto_id, cost: hasTableCfg.cost, showCardId: cardId, level: card.level })
                }
            }
            this._netCardKV[cardId] = card
        }
        for (const key in _maxLevelCardTypeKV) {
            const _mctInfo = _maxLevelCardTypeKV[key]
            this._cardTypeGroupList.push({ groupTypeId: _mctInfo.ncard.protoId, cost: _mctInfo.cfg.cost, showCardId: _mctInfo.ncard.id, level: _mctInfo.ncard.level })
        }
        for (const key in _pveMaxLevelCardTypeKV) {
            const _mctInfo = _pveMaxLevelCardTypeKV[key]
            this._pveCardTypeGroupList.push({ groupTypeId: _mctInfo.ncard.protoId, cost: _mctInfo.cfg.cost, showCardId: _mctInfo.ncard.id, level: _mctInfo.ncard.level })
        }
        this._cardTypeGroupList.sort((a, b) => {
            if (a.cost == b.cost) return a.groupTypeId - b.groupTypeId
            return a.cost - b.cost
        })
        this._pveCardTypeGroupList.sort((a, b) => {
            if (a.cost == b.cost) return a.groupTypeId - b.groupTypeId
            return a.cost - b.cost
        })
          
        const _cards = icards.sort((a, b) => {
            const aCount = cardTypeNum[a.protoId]
            const bCount = cardTypeNum[b.protoId]
            if (aCount != bCount) return bCount - aCount
            if (b?.protoId != a?.protoId) return a.protoId - b.protoId
            return b?.id - a?.id
        })

          
        TableCards.cfg.forEach((v) => {
            const proto_id = v.proto_id
            const hasCardGroup = this._cardTypeGroupKV[proto_id]
            if (!hasCardGroup) {
                const cardId = v.Id
                const nums = this._noCardKV[proto_id]
                if (nums) {
                    nums.push(cardId)
                } else {
                    this._noCardKV[proto_id] = [cardId]
                }
            }
        })
        this._netCards = _cards;
        this._pveShowNetCards = _pveNetCards
        this._pvpShowNetCards = _pvpNetCards
    }

    async upNftStatus(nfts: { [k: string]: core.NftState }) {
        let hasChange = false
        if (nfts) {
            this._netCards = this._netCards.map((card) => {
                const nftState = nfts[card?.id]
                if (nftState != undefined) {
                    this._netCardKV[card.id].state = nftState
                    card.state = nftState
                    hasChange = true
                }
                return card
            })
        }
        return hasChange
    }

    async upNftPveStatus(cardIds: number[], ret: pkgsc.ScPveWeekPush) {
        let hasChange = false
        if (cardIds) {
            this._netCards = this._netCards.map((card) => {
                const idx = cardIds.findIndex(v => v == card?.id);
                if (idx != -1) {
                    card.pvePower = ret.pvePower;
                    card.pveWeek = ret.pveWeek;
                    hasChange = true
                }
                return card
            })
        }
        return hasChange
    }

    async upSingleCard(c: core.ICard) {
        if (c) {
            this._netCards = this._netCards.map((nCard) => {
                if (nCard?.id == c?.id) {
                    this._netCardKV[c.id] = c
                    return c
                } else {
                    return nCard
                }
            })
        }
    }

    async upMuitCards(parms: { upCards?: core.ICard[], upCardNftIds?: number[] }) {
        const upCards = parms?.upCards || []
        const upCardIds = parms?.upCardNftIds || []
        if (upCards.length != 0) {
            this._netCards = this._netCards.map((nCard) => {
                const upCard = upCards.find(card => card?.id == nCard?.id)
                if (upCard) {
                    if (this._netCardKV[upCard?.id]) this._netCardKV[upCard.id] = upCard
                    return upCard
                }
                return nCard
            })
        } else if (upCardIds.length != 0) {
            await this.updData();
            // const cards: core.ICard[] = []
            // let hasNewCard: boolean = false
            // for (const upCardId in upCardIds) {
            //     const netCard = this._netCardKV[upCardId]
            //     if (netCard) {
            //         cards.push(netCard)
            //     } else {
            //         hasNewCard = true
            //         break
            //     }
            // }
            // if (hasNewCard) {
            //     await this.updData()
            // } else {
            //     this._initData(cards);
            // }
        }
    }
    public refreshData(cards: core.ICard[]) {
        this._initData(cards);
    }
    public get netCards() {
        return this._netCards
    }

    public get pvpShowNetCards() {
        return this._pvpShowNetCards
    }
    public get pveShowNetCards() {
        return this._pveShowNetCards
    }

    public getNetCardById(netId: number) {
        return this._netCardKV[netId]
    }

    public getTableCfgByNetId(cardId: number) {
        const _netCard = this._netCardKV[cardId]
        if (_netCard)
            return TableCards.getInfoByProtoIdAndLv(_netCard.protoId, _netCard.level)
    }

      
    public getNextTableCfgByNetId(cardId: number) {
        const _netCard = this._netCardKV[cardId]
        if (_netCard) {
            return TableCards.getInfoByProtoIdAndLv(_netCard.protoId, _netCard.level + 1)
        }
    }

      
    public getTableCfgByLIdMaxLevel(cardId: number) {
        const mTable = TableCards.getInfoById(cardId)
        if (mTable) return TableCards.getInfoByProtoIdAndLv(mTable.proto_id, TableCards.getMaxLvByProtoId(mTable.proto_id))
    }
    public getTableCfgByLIdMixLevel(cardId: number) {
        const mTable = TableCards.getInfoById(cardId)
        if (mTable) return TableCards.getInfoByProtoIdAndLv(mTable.proto_id, 1)
    }
      
    // public get cardTypeGroupKV() {
    //     return this._cardTypeGroupKV
    // }
      
    public get cardTypeGroupList() {
        return this._cardTypeGroupList || []
    }
      
    public getCardTypeGroupByGId(groupId: number) {
        return this._cardTypeGroupKV[groupId]
    }

      
    public isHasRentInCardType(groupId: number) {
        let hasRent = false
        const cardIds = this._cardTypeGroupKV[groupId] || []
        for (const key in cardIds) {
            const cardId = cardIds[key]
            if (CardSystemUtils.isRent(this._netCardKV[cardId])?.ok) {
                hasRent = true
                break
            }
        }
        return hasRent
    }

      
    public getCardTypeGroupSortByGId(groupId: number) {
        const cardIds = this._cardTypeGroupKV[groupId] || []
        return cardIds.sort((cardAId, cardBId) => {
            const cardA = this._netCardKV[cardAId]
            const cardB = this._netCardKV[cardBId]
            const levelA = cardA?.level || 0
            const levelB = cardB?.level || 0
            if (levelA != levelB) return levelB - levelA
            return (cardA?.id || 0) - (cardB?.id || 0)
        })
    }

    public get noCardKV() {
        return this._noCardKV
    }

    // public get pveCardTypeGroupKV() {
    //     return this._pveCardTypeGroupKV
    // }
      
    // public get pveCardTypeGroupList() {
    //     return this._pveCardTypeGroupList
    // }

      
    // public getPVECardTypeGroupByGId(groupId: number) {
    //     return this._pveCardTypeGroupKV[groupId]
    // }

      
    public getPVECardTypeGroupSortByGId(groupId: number) {
        const cardIds = this._pveCardTypeGroupKV[groupId] || []
        return cardIds.sort((cardAId, cardBId) => {
            const cardA = this._netCardKV[cardAId]
            const cardB = this._netCardKV[cardBId]
            const levelA = cardA?.level || 0
            const levelB = cardB?.level || 0
            if (levelA != levelB) return levelB - levelA
            return (cardA?.id || 0) - (cardB?.id || 0)
        })
    }

      
    public getPVETableCardByCardTypeGId(gId: number) {
        const _cardTGs = this._pveCardTypeGroupKV[gId] || []
        if (_cardTGs.length != 0)
            return this.getTableCfgByNetId(_cardTGs[0])
    }

      
    public async addNetCard(cards: core.ICard[]) {
        this._netCards = this._netCards.concat(cards);
        await this._initData(this._netCards);
    }


      
    private timeUpdate() {
        for (const key in this.cardArgs) {
            let cd = this.cardArgs[key]?.cardUpgradeCdSec || 0
            if (cd == 0) continue
            cd -= 1
            if (cd < 0) cd = 0
            this.cardArgs[key].cardUpgradeCdSec = cd
        }
    }

    getUpgradeCd(id: number) {
        return this.cardArgs[id]?.cardUpgradeCdSec || 0
    }

    destory() {
        oops.timer.unschedule(this._timeUpdateUUID);
    }

    public getUpgradeCards(cardId: number) {
          
        const cardTypeNum: { [key: number]: number } = {}
        const _nCards: core.ICard[] = []
        for (const card of this._netCards) {
            const _cardId = card?.id ?? 0
            if (_cardId == 0) continue
            if (CardSystemUtils.isHiddenUpGradeByCard(cardId, card)) continue
            const proto_id = card.protoId
            if (!CardSystemUtils.isHiddenByCard(card)) {
                _nCards.push(card)
                if (cardTypeNum[proto_id]) {
                    cardTypeNum[proto_id] += 1
                } else {
                    cardTypeNum[proto_id] = 1
                }
            }
        }
          
        const _cards = _nCards.sort((a, b) => {
            const aCount = cardTypeNum[a.protoId]
            const bCount = cardTypeNum[b.protoId]
            if (aCount != bCount) return bCount - aCount
            if (b?.protoId != a?.protoId) return a.protoId - b.protoId
            return b?.id - a?.id
        })
        return _cards
    }
}

