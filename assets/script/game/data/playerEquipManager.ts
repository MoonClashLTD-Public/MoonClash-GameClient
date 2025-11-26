import { Message } from "../../core/common/event/MessageManager";
import { GameEvent } from "../common/config/GameEvent";
import { DataBase } from "./dataBase";
import { PlayerEquips } from "./equip/playerEquips";
import { PlayerEquipGroup } from "./equip/playerEquipGroup";

export class PlayerEquipManager extends DataBase {
      
    private _playEquips: PlayerEquips = new PlayerEquips()
      
    private _playEquipGroup: PlayerEquipGroup = new PlayerEquipGroup()

    init() {
        this._playEquips.init()
        this._playEquipGroup.init()
        this.addEvent();
    }

    async updData(): Promise<boolean> {
        await Promise.all<boolean>([this._playEquips.updData(), this._playEquipGroup.updData()])
        return true
    }

    get playEquips() {
        return this._playEquips
    }

    get playEquipGroup() {
        return this._playEquipGroup
    }

      
    public addNetEquipment(equips: core.IEquipment[]) {
        equips.forEach(card => {
            if (card?.id) this._newEquipHots.set(card.id, card.id)
        })
        this._playEquips.addNetEquipment(equips)
        this.noticeData()
    }

    async refreshData() {
        await this._playEquips.updData()
        this.noticeData()
    }

    private async upSingleEquip(event: string, data:
        pkgsc.ScEquipResetAllPush | pkgsc.ScEquipResetAttrPush | pkgsc.ScEquipRepairEquipPush | pkgsc.ScEquipResetAttrValPush) {
        if (data.code == errcode.ErrCode.Ok) {
            const equip = data?.equipment
            if (equip) {
                await this._playEquips.upSingleEquip(equip)
                if (data instanceof pkgsc.ScEquipRepairEquipPush) {
                    this.noticeData()
                } else {
                    Message.dispatchEvent(GameEvent.EquipSingleRefresh, equip)
                }
            }
        }
    }

    private _newEquipHots: Map<number, number> = new Map()
    get equipHots() {
        return this._newEquipHots
    }
    private async upMultEquips(event: string, data:
        pkgsc.ScEquipComposePush | pkgsc.ScEquipBurnPush | pkgsc.ScEquipRepairEquipGroupPush) {
        if (data.code == errcode.ErrCode.Ok) {
            if (data instanceof pkgsc.ScEquipComposePush) {
                if (data.equip?.id) this._newEquipHots.set(data.equip.id, data.equip.id)
                await this._playEquipGroup.updData()
            }
            if (data instanceof pkgsc.ScEquipBurnPush) {
                await this._playEquipGroup.updData()
            }
            await this._playEquips.updData()
            this.noticeData()
        }
    }

    readHot(equipId: number) {
        const ok = this._newEquipHots.delete(equipId)
        if (ok) Message.dispatchEvent(GameEvent.EquipHotDeleteRefresh, equipId)
    }

    readAllHot() {
        // this._newCardHots.forEach(e=>{
        //     Message.dispatchEvent(GameEvent.CardHotDeleteRefresh, e);
        // })
        this._newEquipHots.clear();
    }

    destory() {
        this.removeEvent();
    }

    private async ScNftStatePush(event, ret: pkgsc.ScNftStatePush) {
        const ok = this.playEquips.upNftStatus(ret?.EquipState)
        if (ok) this.noticeData()
    }

    private ScPveWeekPush(event: string, ret: pkgsc.ScPveWeekPush) {
        const ok = this.playEquips.upNftPveStatus(ret?.cards, ret);
        if (ok) this.noticeData()
    }

    private noticeData() {
        Message.dispatchEvent(GameEvent.EquipDataRefresh)
    }

    addEvent() {
        Message.on(`${opcode.OpCode.ScEquipBurnPush}`, this.upMultEquips, this);
        Message.on(`${opcode.OpCode.ScPveWeekPush}`, this.ScPveWeekPush, this);
        Message.on(`${opcode.OpCode.ScEquipComposePush}`, this.upMultEquips, this);
        Message.on(`${opcode.OpCode.ScEquipResetAllPush}`, this.upSingleEquip, this);
        Message.on(`${opcode.OpCode.ScEquipResetAttrPush}`, this.upSingleEquip, this);
        Message.on(`${opcode.OpCode.ScEquipResetAttrValPush}`, this.upSingleEquip, this);
        Message.on(`${opcode.OpCode.ScEquipRepairEquipGroupPush}`, this.upMultEquips, this);
        Message.on(`${opcode.OpCode.ScEquipRepairEquipPush}`, this.upSingleEquip, this);
        Message.on(`${opcode.OpCode.ScNftStatePush}`, this.ScNftStatePush, this);
    }
    removeEvent() {
        Message.off(`${opcode.OpCode.ScEquipBurnPush}`, this.upMultEquips, this);
        Message.off(`${opcode.OpCode.ScPveWeekPush}`, this.ScPveWeekPush, this);
        Message.off(`${opcode.OpCode.ScEquipComposePush}`, this.upMultEquips, this);
        Message.off(`${opcode.OpCode.ScEquipResetAllPush}`, this.upSingleEquip, this);
        Message.off(`${opcode.OpCode.ScEquipResetAttrPush}`, this.upSingleEquip, this);
        Message.off(`${opcode.OpCode.ScEquipResetAttrValPush}`, this.upSingleEquip, this);
        Message.off(`${opcode.OpCode.ScEquipRepairEquipGroupPush}`, this.upMultEquips, this);
        Message.off(`${opcode.OpCode.ScEquipRepairEquipPush}`, this.upSingleEquip, this);
        Message.off(`${opcode.OpCode.ScNftStatePush}`, this.ScNftStatePush, this);
    }
}