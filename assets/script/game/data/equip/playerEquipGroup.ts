import { log } from "cc";
import { Message } from "../../../core/common/event/MessageManager";
import { GameEvent } from "../../common/config/GameEvent";
import { netChannel } from "../../common/net/NetChannelManager";
import TableEquip from "../../common/table/TableEquip";
import { EquipSystemUtils } from "../../equipmentUI/utils/equipSystemUtils";
import { DataEvent } from "../dataEvent";
import { PlayerManger } from "../playerManager";

export class PlayerEquipGroup {
      
    private data: pkgsc.ScEquipGroupQueryResp.IGroup[] = [];
      
    private _dataKV: { [key: number]: { ind: number, cardGroup: pkgsc.ScEquipGroupQueryResp.IGroup } } = [];
      
    private _equipHasInfoKV: { [key: number]: Map<number, number> } = {};
    private _currEquipGroupId = 0
    get currEquipGroupId() {
        return this._currEquipGroupId
    }

    getCurrGroupIdByIdx(idx: number) {
        this._currEquipGroupId = this.data[idx]?.id ?? 0
        return this._currEquipGroupId
    }

    private get equipManager() {
        return PlayerManger.getInstance().equipManager.playEquips
    }

    init() {
        const curId = PlayerManger.getInstance().playerSelfInfo?.currEquipGroupId || 0
        this._currEquipGroupId = curId
    }

    async updData(): Promise<boolean> {
        let d = await netChannel.home.reqUnique(opcode.OpCode.CsEquipGroupQueryReq, opcode.OpCode.ScEquipGroupQueryResp, pkgcs.CsEquipGroupQueryReq.create());
        let groups = d.groups ?? [];
        this.initDatas(groups, true)
        return true;
    }

    private initDatas(list: pkgsc.ScEquipGroupQueryResp.IGroup[], sort = false) {
        let groups = sort ? list.sort((a, b) => a.id - b.id) : list;
        this.data = groups
        this._dataKV = {}
        this._equipHasInfoKV = {}
        let hasCurrGroupId = false
        for (const key in groups) {
            const group = groups[key]
            const groupId = group?.id
            if (groupId == this._currEquipGroupId) hasCurrGroupId = true
              
            group.equipments = (group?.equipments || []).map(card => {
                const cardId = card?.id
                if (cardId != 0) {
                    if (EquipSystemUtils.isHiddenByCard(card)) {
                        card.id = 0
                    } else {
                        if (!this._equipHasInfoKV[cardId])
                            this._equipHasInfoKV[cardId] = new Map()
                        this._equipHasInfoKV[cardId].set(groupId, groupId)
                    }
                }
                return card
            })
            this._dataKV[group.id] = { ind: Number(key), cardGroup: group }
        }
        if (!hasCurrGroupId && groups.length > 0) {
            this._currEquipGroupId = groups[0]?.id
        }
    }

    /**
       
  
  
  
     */
    async upCardGroup(netId: number, isAdd: boolean) {
        const _equip = this.equipManager.getEquipmentById(netId)
        const tableCfg = TableEquip.getInfoById(_equip?.protoId)
        if (!tableCfg) throw new Error("equip cfg not found");
        if (tableCfg.equipment_type != core.EquipmentType.EquipmentTypeNone) {
            const _groupInIdx = tableCfg.equipment_type.valueOf() - 1
            if (_groupInIdx < 0 || _groupInIdx > 2) throw new Error(`equip cfg equipment_type throw ${_groupInIdx}`);

            const _cardGroup = this._dataKV[this._currEquipGroupId]?.cardGroup
            const _cards = _cardGroup?.equipments || []
            const _groupId = _cardGroup?.id ?? -1
            if (_cards.length == 3 && _groupId != -1) {
                let upCards = _cards.map((card, idx) => {
                    let cardID = card?.id || 0
                    if (idx == _groupInIdx) {
                        cardID = isAdd ? netId : 0
                    }
                    return cardID
                })
                this._setEquipCardGroupNet(_groupId, upCards)
            }
        }


    }

    private async _setEquipCardGroupNet(_groupId: number, upCards: number[]) {
        let data = pkgcs.CsEquipGroupSaveReq.create();
        data.groupId = _groupId
        data.equips = upCards

        let d = await netChannel.home.reqUnique(opcode.OpCode.CsEquipGroupSaveReq, opcode.OpCode.ScEquipGroupSaveResp, data);
        if (d.code == errcode.ErrCode.Ok) {
            await this.updData()
            Message.dispatchEvent(GameEvent.EquipGroupDataRefresh)
        }
    }

    updNetEquips(equips: core.IEquipment[]) {
        let upData = false
        const list = this.data.map(group => {
            group.equipments = group.equipments.map(equip => {
                const equipId = equip?.id || 0
                if (equipId != 0) {
                    if (equips.find(e => e.id == equipId)) {
                        return equip
                    } else {
                        equip.id = 0
                        upData = true
                    }
                }
                return equip
            })
            return group
        })
        if (upData) this.initDatas(list)
    }

    get equipCardGroupLen() {
        return this.data.length || 0
    }

    setCurrCardGroupInd(pageNum: number) {
        const cardGroupId = this.data[pageNum]?.id ?? 0
        if (this._currEquipGroupId != cardGroupId) {
            this._currEquipGroupId = cardGroupId
            Message.dispatchEvent(DataEvent.DATA_CURREQUIPGROUPID_CHANGE, cardGroupId)
        }
    }

      
    async upCurrEquipCardId() {
        if (this._currEquipGroupId != 0) {
            let args = pkgcs.CsSelectEquipGroupReq.create();
            args.grpId = this._currEquipGroupId
            await netChannel.home.reqUnique(opcode.OpCode.CsSelectEquipGroupReq, opcode.OpCode.ScSelectEquipGroupResp, args);
        }
    }


    getCurrGroupIdx() {
        return this._dataKV[this._currEquipGroupId]?.ind ?? 0
    }

      
    getCurrCardGroup() {
        return this._dataKV[this._currEquipGroupId]?.cardGroup?.equipments || []
    }

    getCurrCardGroupKV() {
        const equips = this._dataKV[this._currEquipGroupId]?.cardGroup?.equipments || []
        const equipKV: { [key: number]: number } = {}
        for (const equip of equips) {
            const equipId = equip?.id || 0
            if (equipId != 0) equipKV[equipId] = equipId
        }
        return equipKV
    }

    getCardGroupById(id: number) {
        return this._dataKV[id]?.cardGroup
    }

    getCardGroupByIdx(idx: number) {
        const groupId = this.data[idx]?.id
        return this._dataKV[groupId]?.cardGroup
    }

    getCardGroupIdByIndx(idx: number) {
        return this.data[idx].id ?? -1
    }

      
    hasCard(netCardID: number) {
        return this._dataKV[this._currEquipGroupId]?.cardGroup?.equipments?.findIndex(card => card?.id == netCardID) != -1
    }

      
    hasOtherCardGroup(cardId: number) {
        const cardHasKV = this._equipHasInfoKV[cardId]
        const size = cardHasKV?.size || 0
          
        const currHas = (cardHasKV?.get(this._currEquipGroupId) || 0) != 0
        return currHas ? size > 1 : size > 0
    }
}