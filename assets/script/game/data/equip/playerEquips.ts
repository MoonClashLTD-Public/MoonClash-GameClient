import { Color, log, warn } from "cc";
import { Message } from "../../../core/common/event/MessageManager";
import { LanguageData } from "../../../core/gui/language/LanguageData";
import { LangLabelParamsItem } from "../../../core/gui/language/LanguageLabel";
import { CommonUtil } from "../../../core/utils/CommonUtil";
import { GameEvent } from "../../common/config/GameEvent";
import { IEquipDispostionCfg, IEquipmentDisAndCombitCfg, IEquipmentDisAndCombitCfg2 } from "../../common/contants/EquipCost";
import { netChannel } from "../../common/net/NetChannelManager";
import TableEquip from "../../common/table/TableEquip";
import TableEquipAttr from "../../common/table/TableEquipAttr";
import { EquipSystemUtils } from "../../equipmentUI/utils/equipSystemUtils";

export class PlayerEquips {
      
    private _equips: core.IEquipment[] = [];
      
    private _equipDataKV: { [key: number]: core.IEquipment } = {};
      
    private _equipIdKV: { [key: number]: number } = {};
      
    private _equipPveIdKV: { [key: number]: number } = {};
      
    private _equipIds: number[] = [];
      
    private _equipPveIds: number[] = [];
    Message: any;

    get equips() {
        return this._equips;
    }
    get equipIds() {
        return this._equipIds
    }
    get equipPVEIds() {
        return this._equipPveIds.sort((a, b) => {
            const aEquip = this._equipDataKV[a]
            const bEquip = this._equipDataKV[b]
            const aPower = EquipSystemUtils.isPlayPve(aEquip) ? 0 : 1
            const bPower = EquipSystemUtils.isPlayPve(bEquip) ? 0 : 1
            if (aPower != bPower) return bPower - aPower
            const aE = aEquip?.equipRarity || 0
            const bE = bEquip?.equipRarity || 0
            if (aE != bE) return bE - aE
            const aType = TableEquip.getInfoById(aEquip.protoId)?.equipment_type || 0
            const bType = TableEquip.getInfoById(bEquip.protoId)?.equipment_type || 0
            return aType - bType
        })
    }

    init() {
    }

    async updData(): Promise<boolean> {
        let d = await netChannel.home.reqUnique(opcode.OpCode.CsEquipQueryReq, opcode.OpCode.ScEquipQueryResp, pkgcs.CsEquipQueryReq.create());
        this._initData(d.equipments);
        return true
    }

    private _initData(list: core.IEquipment[]) {
        let equips = list.sort((a, b) => {
            const aE = a?.equipRarity || 0
            const bE = b?.equipRarity || 0
            if (aE != bE) {
                return bE - aE
            } else {
                const aType = TableEquip.getInfoById(a.protoId)?.equipment_type || 0
                const bType = TableEquip.getInfoById(b.protoId)?.equipment_type || 0
                return aType - bType
            }
        })
        this._equipDataKV = {};
        this._equipIdKV = {};
        this._equipPveIdKV = {};
        this._equipIds = []
        this._equipPveIds = []
        for (const equip of equips) {
            this._equipDataKV[equip.id] = equip
            if (!EquipSystemUtils.isHiddenByCard(equip)) {
                this._equipIdKV[equip.id] = equip.id
                this._equipIds.push(equip.id)
            }
            if (!EquipSystemUtils.isHiddenPVEByCard(equip)) {
                this._equipPveIdKV[equip.id] = equip.id
                this._equipPveIds.push(equip.id)
            }
        }
        this._equips = equips
    }

    async upNftStatus(nfts: { [k: string]: core.NftState }) {
        let hasChange = false
        if (nfts) {
            this._equips = this._equips.map((equip) => {
                const nftState = nfts[equip?.id]
                if (nftState != undefined) {
                    this._equipDataKV[equip.id].state = nftState
                    equip.state = nftState
                    hasChange = true
                }
                return equip
            })
        }
        return hasChange
    }

    async upNftPveStatus(cardIds: number[], ret: pkgsc.ScPveWeekPush) {
        let hasChange = false
        if (cardIds) {
            this._equips = this._equips.map((equip) => {
                const idx = cardIds.findIndex(v => v == equip?.id);
                if (idx != -1) {
                    equip.pvePower = ret.pvePower;
                    equip.pveWeek = ret.pveWeek;
                    hasChange = true
                }
                return equip
            })
        }
        return hasChange
    }

      
    public addNetEquipment(equipments: core.IEquipment[]) {
        this._equips = this._equips.concat(equipments);
        this._initData(this._equips);
    }

    async upSingleEquip(c: core.IEquipment) {
        if (!c || !c?.id) return
        this._equips = this._equips.map((nCard) => {
            if (nCard?.id == c?.id) return c;
            else return nCard;
        })
        if (this._equipDataKV[c?.id]) this._equipDataKV[c.id] = c
    }

    upMuitEquips(c: core.IEquipment[]) {
        c.forEach(e => this.upSingleEquip(e));
    }

    public refreshData(equips: core.IEquipment[]) {
        this._initData(equips);
    }

    getEquipmentById(id: number) {
        return this._equipDataKV[id]
    }

      
    getDispostionCfgById(param: { netId?: number, netEquipment?: core.IEquipment }): IEquipmentDisAndCombitCfg {
        let cfg: IEquipmentDisAndCombitCfg = { tCombit: 0, list: {} }
        if (!param.netId && !param.netEquipment) return cfg;
        let equip = param.netId ? this._equipDataKV[param.netId] : param.netEquipment;
        if (!equip) return cfg;
        let mCombit = new BigNumber(0)
        const attrs = equip.attrs || []
        const list: { [key: number]: IEquipDispostionCfg } = {}
        for (const attr of attrs) {
            const attrId = attr.attrId
            const attrCfg = TableEquipAttr.getInfoByQualityAndAttrId(attr.quality, attrId)
            list[attrId] = { name: attrCfg.name, desc: "", attrId: attr.attrId, showColor: attrCfg.qualityColor, icon: attrCfg?.icon_res }
            let str = LanguageData.getLangByID(attrCfg.description || '')
            const num = attr.percentage / 100
            const params: LangLabelParamsItem[] = [{ key: 'key', value: `${num}%` }, { key: 'negateKey', value: `${-num}%` }]
            str += "\n" + LanguageData.getLangByIDAndParams(attrCfg.desc, params);
            list[attrId].desc = str;
            list[attrId].num = num.toString();
            // mCombit += attrCfg?.cCombat || 0s
            mCombit = mCombit.plus(attrCfg?.cCombat || 0)
        }
        cfg.list = list
        cfg.tCombit = Number(mCombit.toFixed(2, 1))
        return cfg
    }

    getDispostionCfgById2(param: { netId?: number, netEquipment?: core.IEquipment }): IEquipmentDisAndCombitCfg2 {
        let cfg: IEquipmentDisAndCombitCfg2 = { tCombit: 0, list: [] }
        if (!param.netId && !param.netEquipment) return cfg;
        let equip = param.netId ? this._equipDataKV[param.netId] : param.netEquipment;
        if (!equip) return cfg;
        let mCombit = new BigNumber(0)
        const attrs = equip.attrs || []
        const list: IEquipDispostionCfg[] = []
        for (const attr of attrs) {
            const attrId = attr.attrId
            const attrCfg = TableEquipAttr.getInfoByQualityAndAttrId(attr.quality, attrId)
            const disConfig: IEquipDispostionCfg = { name: attrCfg.name, desc: "", attrId: attr.attrId, showColor: attrCfg.qualityColor, icon: attrCfg?.icon_res }
            let str = LanguageData.getLangByID(attrCfg.description || '')
            const num = attr.percentage / 100
            const params: LangLabelParamsItem[] = [{ key: 'key', value: `${num}%` }, { key: 'negateKey', value: `${-num}%` }]
            str += "\n" + LanguageData.getLangByIDAndParams(attrCfg.desc, params);
            disConfig.desc = str;
            disConfig.num = num.toString();
            // mCombit += attrCfg?.cCombat || 0s
            mCombit = mCombit.plus(attrCfg?.cCombat || 0)
            const iconStr = disConfig?.icon ?? ''
            if (iconStr.trim().length != 0) {
                list.push(disConfig)
            }
        }
        cfg.list = list
        cfg.tCombit = Number(mCombit.toFixed(2, 1))
        return cfg
    }
}