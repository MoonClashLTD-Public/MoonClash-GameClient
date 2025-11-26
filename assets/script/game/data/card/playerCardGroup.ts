import { Message } from "../../../core/common/event/MessageManager";
import { oops } from "../../../core/Oops";
import { IFullCardGroupConfig } from "../../card/pop/CSFightPop";
import { CardSystemUtils } from "../../card/utils/cardSystemUtils";
import { GameEvent } from "../../common/config/GameEvent";
import { UIID } from "../../common/config/GameUIConfig";
import { netChannel } from "../../common/net/NetChannelManager";
import { DataEvent } from "../dataEvent";
import { PlayerManger } from "../playerManager";

export class PlayerCardGroup {
      
    private data: pkgsc.ScCardGroupQueryResp.ICardGroup[] = [];
      
    private _dataKV: { [key: number]: { ind: number, cardGroup: pkgsc.ScCardGroupQueryResp.ICardGroup } } = [];
      
    private _cardHasInfoKV: { [key: number]: Map<number, number> } = {};
    private _currCardGroupId = 0

    get currCardGroupId() {
        return this._currCardGroupId
    }

    get currGroupIdx() {
        return this._dataKV[this._currCardGroupId]?.ind ?? 0
    }

    init() {
        const curId = PlayerManger.getInstance().playerSelfInfo?.currCardGroupId || 0
        this._currCardGroupId = curId
    }

    async updData(): Promise<boolean> {
        let d = await netChannel.home.reqUnique(opcode.OpCode.CsCardGroupQueryReq, opcode.OpCode.ScCardGroupQueryResp, pkgcs.CsCardGroupQueryReq.create());
        this.initDatas(d.groups ?? [], true)
        return true;
    }

    private initDatas(list: pkgsc.ScCardGroupQueryResp.ICardGroup[], sort: boolean = false) {
        const groups = sort ? list.sort((a, b) => a.id - b.id) : list;
        this.data = groups
        this._dataKV = {}
        this._cardHasInfoKV = {}
        let has_currCardGroupId = false
        for (const key in groups) {
            const group = groups[key]
            const groupId = group?.id || 0
            if (groupId == this._currCardGroupId) has_currCardGroupId = true
              
            group.cards = (group?.cards || []).map(card => {
                const cardId = card?.id
                if (cardId != 0) {
                    if (CardSystemUtils.isHiddenByCard(card)) {
                        card.id = 0
                    } else {
                        if (!this._cardHasInfoKV[cardId])
                            this._cardHasInfoKV[cardId] = new Map()
                        this._cardHasInfoKV[cardId].set(groupId, groupId)
                    }
                }
                return card
            })
            this._dataKV[groups[key].id] = { ind: Number(key), cardGroup: group }
        }
        if (!has_currCardGroupId && groups.length > 0) {
            this._currCardGroupId = groups[0]?.id
        }
    }

    /**
       
  
  
  
     */
    async upCardGroup(netId: number, isAdd: boolean) {
        const upInfo = this.getCurrCardGroupUpInfo()
        if (upInfo.cards.length == 6 && upInfo.groupId != -1) {
            let isFull = true
            let _upCards1 = upInfo.cards.map((card, idx) => {
                let cardID = card?.id || 0
                if (isAdd) {
                      
                    if (cardID == 0 && isFull) {
                        cardID = netId
                        isFull = false
                    }
                } else {
                    if (cardID == netId) cardID = 0
                }
                return cardID
            })
            // upCards = [72, 83, 96, 80, 94, 69]
              
            if (!isFull || !isAdd) {
                this._setCardGroupNet(upInfo.groupId, _upCards1)
            } else {
                  
                const param: IFullCardGroupConfig = {
                    cb: async (cardId, cardGroupIdx) => {
                        const upInfo2 = this.getCurrCardGroupUpInfo()
                        let _upCards2 = upInfo2.cards.map((card, idx) => {
                            return idx == cardGroupIdx ? cardId : card?.id || 0
                        })
                        const ok = await this._setCardGroupNet(upInfo2.groupId, _upCards2)
                        Message.dispatchEvent(GameEvent.CSCardGroupSaveRefresh, ok)
                    },
                    id: netId
                }
                oops.gui.open(UIID.CardSysFightPop, param)
            }
        }
    }

    async upMultiGroup(groupId: number, upCards: number[]) {
        return await this._setCardGroupNet(groupId, upCards);
    }

    private getCurrCardGroupUpInfo() {
        const _cardGroup = this._dataKV[this._currCardGroupId]?.cardGroup
        const _cards = _cardGroup?.cards || []
        const _groupId = _cardGroup?.id ?? -1
        return { groupId: _groupId, cards: _cards }
    }

    private async _setCardGroupNet(_groupId: number, upCards: number[]) {
        return new Promise<boolean>(async (resolve, reject) => {
            let data = pkgcs.CsCardGroupSaveReq.create();
            data.groupId = _groupId
            data.cards = upCards

            let d = await netChannel.home.reqUnique(opcode.OpCode.CsCardGroupSaveReq, opcode.OpCode.ScCardGroupSaveResp, data);
            if (d?.code == errcode.ErrCode.Ok) {
                await this.updData()
                Message.dispatchEvent(GameEvent.CardGroupDataRefresh)
            }
            resolve(d?.code == errcode.ErrCode.Ok)
        })
    }
      
    async cardUpgradePush(cardNftIds: number[]) {
        let upData = false
        const cardGroups = this.data.map((_data) => {
            _data.cards = _data.cards.map((card) => {
                const nftId = card?.nftId || 0
                if (nftId != 0) {
                    if (cardNftIds.indexOf(nftId) != -1) {
                        return card
                    } else {
                        card.id = 0
                        card.nftId = 0
                        upData = true
                    }
                }
                return card
            })
            return _data
        }) || []
        if (upData) this.initDatas(cardGroups)
    }

    get cardGroupLen() {
        return this.data.length
    }

    setCurrCardGroupInd(pageNum: number) {
        PlayerManger.getInstance().equipManager.playEquipGroup.setCurrCardGroupInd(pageNum)
        const cardGroupId = this.data[pageNum]?.id ?? 0
        if (this._currCardGroupId != cardGroupId) {
            this._currCardGroupId = cardGroupId
            Message.dispatchEvent(DataEvent.DATA_CURRCARDGROUPID_CHANGE, cardGroupId);
        }
    }

    async upCurrCardId() {
        if (this._currCardGroupId != 0) {
            let args = pkgcs.CsSelectCardGroupReq.create();
            args.grpId = this._currCardGroupId
            await netChannel.home.reqUnique(opcode.OpCode.CsSelectCardGroupReq, opcode.OpCode.ScSelectCardGroupResp, args);
        }
    }

    getCurrCardGroupInd() {
        return this._dataKV[this._currCardGroupId]?.ind ?? 0
    }

      
    getCurrCardGroupCards() {
        return this._dataKV[this._currCardGroupId]?.cardGroup?.cards || []
    }

    getCardGroupById(id: number) {
        return this._dataKV[id]?.cardGroup
    }

    getCardGroupByIdx(idx: number) {
        const groupId = this.data[idx].id
        return this._dataKV[groupId]?.cardGroup
    }

    isEmptyCardGroupByIndx(idx: number): { ok: boolean, groupId: number, hasLease: boolean } {
        let hasCard = false
        let hasLease = false
        const cardGroup = this.data[idx]
        const cards = cardGroup?.cards || []
        for (const card of cards) {
            const _cardId = card?.id || 0
            if (!hasCard && _cardId != 0) hasCard = true
              
            const isRent = CardSystemUtils.isRent(card)
            if (isRent?.ok) {
                hasLease = true
                break
            }
        }
        return { ok: hasCard, groupId: cardGroup?.id, hasLease: hasLease }
    }

    getCardGroupIdByIndx(idx: number) {
        return this.data[idx]?.id ?? -1
    }

      
    hasCard(netCardID: number) {
        return this._dataKV[this._currCardGroupId]?.cardGroup?.cards?.findIndex(card => card?.id == netCardID) != -1
    }

      
    getCardNumsByProtoId(protoId: number) {
        let _num = 0
        this._dataKV[this._currCardGroupId]?.cardGroup?.cards?.forEach(card => {
            if (card?.protoId == protoId) _num++
        })
        return _num
    }

      
    hasOtherCardGroup(groupId: number, cardId: number) {
        const cardHasKV = this._cardHasInfoKV[cardId]
        const size = cardHasKV?.size || 0
          
        const currHas = (cardHasKV?.get(groupId) || 0) != 0
        return currHas ? size > 1 : size > 0
    }

      
    hasCardGroup(netCardID: number) {
        for (const key in this._dataKV) {
            let group = this._dataKV[key];
            let bf = group?.cardGroup?.cards?.findIndex(card => card?.id == netCardID) != -1;
            if (bf) return true;
        }
        return false;
    }
}