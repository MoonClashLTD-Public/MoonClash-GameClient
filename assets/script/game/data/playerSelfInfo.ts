import { log } from "cc";
import { Message } from "../../core/common/event/MessageManager";
import { oops } from "../../core/Oops";
import { GameEvent } from "../common/config/GameEvent";
import { netChannel } from "../common/net/NetChannelManager";
import TableNfts from "../common/table/TableNfts";
import { DataBase } from "./dataBase";
import { DataEvent } from "./dataEvent";
import { PlayerManger } from "./playerManager";

export class PlayerSelfInfo extends DataBase {
      
    private _data: pkgsc.ScSelfInfoResp = null;
    private _nickname: string = '';
    private _dggv2: string;
    private _dgg: string;
    private _dna: string;
    private _onChainBnb: string;
    private _onChainDgg: string;
    private _onChainDna: string;
    private _pveBattleId: number = 0;
    private _pveScheme: pkgsc.ScQueryPveSchemeResp = pkgsc.ScQueryPveSchemeResp.create();
    private _assistPts: number = 0;
    private _boundBoxPts: number = 0;
    private _affBoxPts: number = 0;
    private _walletAddr: string = '';
    private _currCardGroupId: number = 0;
    private _currEquipGroupId: number = 0;
    private _materials: core.IMaterial[] = [];
      
    private _offChainMaterialBoxes: number = 0;
    private _timeUpdateUUID: string = '';   
    userName: string = '';
    inBattle: boolean = false;
      
    withdrawCdMs: number = 0;
      
    inviteTimesSinceLastWithdraw: number = 0;
      
    sysPveWeek: number = 0;
      
    isUmpire: boolean = false;
    get dggv2() {
        return this._dggv2;
    }
    set dggv2(val: string) {
        this._dggv2 = val;
        Message.dispatchEvent(DataEvent.DATA_DGGV2_CHANGE, this.dggv2);
    }
    get dgg() {
        return this._dgg;
    }
    set dgg(val: string) {
        this._dgg = val;
        Message.dispatchEvent(DataEvent.DATA_DGG_CHANGE, this.dgg);
    }
    get dna() {
        return this._dna;
    }
    set dna(val: string) {
        this._dna = val;
        Message.dispatchEvent(DataEvent.DATA_DNA_CHANGE, this.dna);
    }
    get onChainBnb() {
        return this._onChainBnb;
    }
    set onChainBnb(val: string) {
        this._onChainBnb = val;
        Message.dispatchEvent(DataEvent.DATA_ONCHAINBNB_CHANGE, this.onChainBnb);
    }
    get onChainDgg() {
        return this._onChainDgg;
    }
    set onChainDgg(val: string) {
        this._onChainDgg = val;
        Message.dispatchEvent(DataEvent.DATA_ONCHAINDGG_CHANGE, this.onChainDgg);
    }
    get onChainDna() {
        return this._onChainDna;
    }
    set onChainDna(val: string) {
        this._onChainDna = val;
        Message.dispatchEvent(DataEvent.DATA_ONCHAINDNA_CHANGE, this.onChainDna);
    }

    get pveBattleId() {
        function padTo2Digits(num) {
            return num.toString().padStart(2, '0');
        }
        const date = new Date();
        // const gmtDateTime = date.toUTCString();
        let str = [
            padTo2Digits(date.getUTCFullYear()),
            padTo2Digits(date.getUTCMonth() + 1),
            padTo2Digits(date.getUTCDate()),
        ].join('');
        if (this._pveScheme.today.ymd == Number(str)) {
            this._pveBattleId = this._pveScheme.today.pve;   
        } else {
            this._pveBattleId = this._pveScheme.nextDay.pve;
        }

        return this._pveBattleId;
    }
    // set pveBattleId(val: number) {
    //     if (this._pveBattleId == val) return;
    //     this._pveBattleId = val;
    //     Message.dispatchEvent(DataEvent.DATA_PVEBATTLEID_CHANGE, val);
    // }
    get assistPts() {
        return this._assistPts;
    }
    set assistPts(val: number) {
        this._assistPts = val;
        Message.dispatchEvent(DataEvent.DATA_ASSISTPTS_CHANGE, this.assistPts);
    }
    get boundBoxPts() {
        return this._boundBoxPts;
    }
    set boundBoxPts(val: number) {
        this._boundBoxPts = val;
        Message.dispatchEvent(DataEvent.DATA_BOUNDBOXPTS_CHANGE, this.boundBoxPts);
    }
    get affBoxPts() {
        return this._affBoxPts;
    }
    set affBoxPts(val: number) {
        this._affBoxPts = val;
        Message.dispatchEvent(DataEvent.DATA_AFFBOXPTS_CHANGE, this.affBoxPts);
    }
    get nickname() {
        return this._nickname;
    }
    set nickname(val: string) {
        this._nickname = val;
        Message.dispatchEvent(DataEvent.DATA_NICKNAME_CHANGE, val);
    }
    get walletAddr() {
        return this._walletAddr;
    }
    set walletAddr(val: string) {
        this._walletAddr = val;
        Message.dispatchEvent(DataEvent.DATA_WALLETADDR_CHANGE, val);
    }
    get currCardGroupId() {
        return this._currCardGroupId;
    }
    set currCardGroupId(val: number) {
        this._currCardGroupId = val;
        Message.dispatchEvent(DataEvent.DATA_CURRCARDGROUPID_CHANGE, val);
    }

    get currEquipGroupId() {
        return this._currEquipGroupId;
    }
    set currEquipGroupId(val: number) {
        this._currEquipGroupId = val;
        Message.dispatchEvent(DataEvent.DATA_CURREQUIPGROUPID_CHANGE, val);
    }

    get offChainMaterialBoxes() {
        return this._offChainMaterialBoxes;
    }
    set offChainMaterialBoxes(val: number) {
        this._offChainMaterialBoxes = val;
        Message.dispatchEvent(DataEvent.DATA_MATERIALBOXES_CHANGE, val);
    }
    get materials() {
        return this._materials;
    }
    set materials(val: core.IMaterial[]) {
        this._materials = val;
        Message.dispatchEvent(DataEvent.DATA_MATERIALS_CHANGE, val);
    }
    init() {
        this.addEvent();

        this._timeUpdateUUID = oops.timer.schedule(this.timeUpdate.bind(this), 1)
    }

      
    private timeUpdate() {
        this.withdrawCdMs -= 1000;
        if (this.withdrawCdMs < 0) {
            this.withdrawCdMs = 0;
        }
    }

    async updData(): Promise<boolean> {
        let d = await netChannel.home.reqUnique(opcode.OpCode.CsSelfInfoReq, opcode.OpCode.ScSelfInfoResp, pkgcs.CsSelfInfoReq.create({ force: true }));
        this._data = d;
        this.dgg = d.dgg;
        this.dna = d.dna;
        this.dggv2 = d.dggv2;
        this.onChainBnb = d.onChainBnb;
        this.onChainDgg = d.onChainDgg;
        this.onChainDna = d.onChainDna;
        // this.pveBattleId = d.pveBattleId;
        this.assistPts = d.assistPts;
        this.boundBoxPts = d.boundBoxPts;
        this.affBoxPts = d.affBoxPts;
        this.nickname = d.nickname;
        this.walletAddr = d.walletAddr;
        this.currCardGroupId = d.currCardGroupId;
        this.currEquipGroupId = d.currEquipGroupId;
        this.offChainMaterialBoxes = d.offChainMaterialBoxes;
        this.setMaterials(d?.materials);
        this.withdrawCdMs = d.withdrawCdMs;
        this.inviteTimesSinceLastWithdraw = d.inviteTimesSinceLastWithdraw;
        this.inBattle = d.inBattle;
        this.userName = d.username;
        this.sysPveWeek = d.sysPveWeek;
        this.isUmpire = d.isUmpire;
        this.updPveData();
        return true;
    }

    async updPveData() {
        let d = await netChannel.home.reqUnique(opcode.OpCode.CsQueryPveSchemeReq, opcode.OpCode.ScQueryPveSchemeResp, pkgsc.ScQueryPveSchemeResp.create());
        this._pveScheme = d;
        Message.dispatchEvent(DataEvent.DATA_PVEBATTLEID_CHANGE, this.pveBattleId);
    }

    async refreshData() {
        await this.updData()
    }

    destory() {
        oops.timer.unschedule(this._timeUpdateUUID);
        this.removeEvent();
    }

    addEvent() {
        Message.on(`${opcode.OpCode.ScSelfInfoPush}`, this.ScSelfInfoPush, this);
        Message.on(`${opcode.OpCode.ScTokenInfoPush}`, this.ScTokenInfoPush, this);
        Message.on(`${opcode.OpCode.ScNftTransferPush}`, this.ScNftTransferPush, this);
        Message.on(`${opcode.OpCode.ScUpdateAssistInfoPush}`, this.ScUpdateAssistInfoPush, this);
        Message.on(`${opcode.OpCode.ScBuyErc20TokenPush}`, this.updateWallet, this);
        Message.on(`${opcode.OpCode.ScWithdrawPush}`, this.updateWallet, this);
        Message.on(`${opcode.OpCode.ScTransferPush}`, this.updateWallet, this);
        Message.on(`${opcode.OpCode.ScCardResetAttrPush}`, this.upMaterials, this);
        Message.on(`${opcode.OpCode.ScCardResetAttrValPush}`, this.upMaterials, this);
        Message.on(`${opcode.OpCode.ScCardResetAllPush}`, this.upMaterials, this);
        Message.on(`${opcode.OpCode.ScCardResetPowerPush}`, this.upMaterials, this);
        Message.on(`${opcode.OpCode.ScCardUpgradePush}`, this.upMaterials, this);
        Message.on(`${opcode.OpCode.ScEquipResetAttrValPush}`, this.upMaterials, this);
        Message.on(`${opcode.OpCode.ScEquipResetAllPush}`, this.upMaterials, this);
        Message.on(`${opcode.OpCode.ScEquipResetAttrPush}`, this.upMaterials, this);
        Message.on(`${opcode.OpCode.ScEquipBurnPush}`, this.upMaterials, this);
        Message.on(`${opcode.OpCode.ScEquipComposePush}`, this.upMaterials, this);
        Message.on(`${opcode.OpCode.ScEquipRepairEquipGroupPush}`, this.upMaterials, this);
        Message.on(`${opcode.OpCode.ScEquipRepairEquipPush}`, this.upMaterials, this);
    }
    removeEvent() {
        Message.off(`${opcode.OpCode.ScSelfInfoPush}`, this.ScSelfInfoPush, this);
        Message.off(`${opcode.OpCode.ScTokenInfoPush}`, this.ScTokenInfoPush, this);
        Message.off(`${opcode.OpCode.ScNftTransferPush}`, this.ScNftTransferPush, this);
        Message.off(`${opcode.OpCode.ScUpdateAssistInfoPush}`, this.ScUpdateAssistInfoPush, this);
        Message.off(`${opcode.OpCode.ScBuyErc20TokenPush}`, this.updateWallet, this);
        Message.off(`${opcode.OpCode.ScWithdrawPush}`, this.updateWallet, this);
        Message.off(`${opcode.OpCode.ScTransferPush}`, this.updateWallet, this);
        Message.off(`${opcode.OpCode.ScCardResetAttrPush}`, this.upMaterials, this);
        Message.off(`${opcode.OpCode.ScCardResetAllPush}`, this.upMaterials, this);
        Message.off(`${opcode.OpCode.ScCardResetPowerPush}`, this.upMaterials, this);
        Message.off(`${opcode.OpCode.ScCardUpgradePush}`, this.upMaterials, this);
        Message.off(`${opcode.OpCode.ScEquipResetAllPush}`, this.upMaterials, this);
        Message.off(`${opcode.OpCode.ScEquipResetAttrPush}`, this.upMaterials, this);
        Message.off(`${opcode.OpCode.ScEquipResetAttrValPush}`, this.upMaterials, this);
        Message.off(`${opcode.OpCode.ScEquipBurnPush}`, this.upMaterials, this);
        Message.off(`${opcode.OpCode.ScEquipComposePush}`, this.upMaterials, this);
        Message.off(`${opcode.OpCode.ScEquipRepairEquipGroupPush}`, this.upMaterials, this);
        Message.off(`${opcode.OpCode.ScEquipRepairEquipPush}`, this.upMaterials, this);
    }


    ScSelfInfoPush(event: string, data: pkgsc.ScSelfInfoPush) {
        // this.updCnt(data.id, -data.cnt);
        // log('ScSelfInfoPush', data);
        if (data.code == errcode.ErrCode.Ok) {
            this.offChainMaterialBoxes = data.offChainMaterialBoxes;
            // this.pveBattleId = data.pveBattleId;
            this.assistPts = data.assistPts;
            this.updFull(data.full);
        }
    }

    ScUpdateAssistInfoPush(event: string, data: pkgsc.ScUpdateAssistInfoPush) {
        this.assistPts = data.assistPts;
    }

    upMaterials(event: string, data: UpMaterials) {
        if (data?.code == errcode.ErrCode.Ok) {
            if (data instanceof pkgsc.ScEquipBurnPush
                || data instanceof pkgsc.ScEquipComposePush) {
                if (data.dgg)
                    this.dgg = data.dgg;
                if (data.dna)
                    this.dna = data.dna;
            }
            if (data.syncData) {
                if (data.syncData.materials)
                    this.setMaterials(data.syncData.materials);
                if (data.syncData.onChainBnb)
                    this.onChainBnb = data.syncData.onChainBnb;
                if (data.syncData.onChainDgg)
                    this.onChainDgg = data.syncData.onChainDgg;
                if (data.syncData.onChainDna)
                    this.onChainDna = data.syncData.onChainDna;
            }
            Message.dispatchEvent(DataEvent.DATA_CURRENCY_CHANGE);
        }
    }

    ScNftTransferPush(event: string, data: pkgsc.ScNftTransferPush) {
        if (data?.code == errcode.ErrCode.Ok) {
            this.updFull(data.syncFull);
        }
    }

    ScTokenInfoPush(event: string, data: pkgsc.ScTokenInfoPush) {
        this.offChainMaterialBoxes = data.offChainMaterialBoxes;
        this.assistPts = data.assistPts;
        this.boundBoxPts = data.boundBoxPts;
        this.affBoxPts = data.affBoxPts;
        if (data.dggv2)
            this.dggv2 = data.dggv2;
        if (data.dgg)
            this.dgg = data.dgg;
        if (data.dna)
            this.dna = data.dna;
        if (data.syncWallet) {
            if (data.syncWallet.onChainBnb)
                this.onChainBnb = data.syncWallet.onChainBnb;
            if (data.syncWallet.onChainDgg)
                this.onChainDgg = data.syncWallet.onChainDgg;
            if (data.syncWallet.onChainDna)
                this.onChainDna = data.syncWallet.onChainDna;
        }
        Message.dispatchEvent(DataEvent.DATA_CURRENCY_CHANGE);
    }

    updateWallet(event: string, data: pkgsc.ScBuyErc20TokenPush | pkgsc.ScWithdrawPush | pkgsc.ScTransferPush) {
        log(opcode.OpCode[event], data);
        if (data.code == errcode.ErrCode.Ok) {
            if (event == `${opcode.OpCode.ScBuyErc20TokenPush}`) {
                if (data instanceof pkgsc.ScBuyErc20TokenPush) {
                    if (data.dgg)
                        this.dgg = data.dgg;
                    if (data.dna)
                        this.dna = data.dna;
                }
            } else if (event == `${opcode.OpCode.ScWithdrawPush}`) {
                if (data instanceof pkgsc.ScWithdrawPush) {
                    this.inviteTimesSinceLastWithdraw = data.inviteTimesSinceLastWithdraw;
                    this.withdrawCdMs = data.withdrawCdMs;
                    if (data.dgg)
                        this.dgg = data.dgg;
                    if (data.dna)
                        this.dna = data.dna;
                }

            }

            if (data.syncWallet) {
                if (data.syncWallet.onChainBnb)
                    this.onChainBnb = data.syncWallet.onChainBnb;
                if (data.syncWallet.onChainDgg)
                    this.onChainDgg = data.syncWallet.onChainDgg;
                if (data.syncWallet.onChainDna)
                    this.onChainDna = data.syncWallet.onChainDna;
            }
            Message.dispatchEvent(DataEvent.DATA_CURRENCY_CHANGE);
        }
    }

    private setMaterials(materials: core.IMaterial[]) {
        let _materials: core.IMaterial[] = [];
        for (const material of materials) {
            let idx = _materials.findIndex(v => v.tokenType == material.tokenType);
            if (idx == -1) {
                _materials.push(material);
            } else {
                _materials[idx] = material;
            }
        }
        this.materials = _materials;
    }

    async updFull(full: core.ISyncOnChainInfoFull) {
        if (full) {
            if (full.cards) {
                await PlayerManger.getInstance().cardManager.playCardGroup.updData()
                PlayerManger.getInstance().cardManager.playCard.refreshData(full.cards.concat(full.rentalCards));
                Message.dispatchEvent(GameEvent.CardDataRefresh)
            }
            if (full.equips) {
                await PlayerManger.getInstance().equipManager.playEquipGroup.updData()
                PlayerManger.getInstance().equipManager.playEquips.refreshData(full.equips);
                Message.dispatchEvent(GameEvent.EquipDataRefresh)
            }
            if (full.materials) {
                this.setMaterials(full.materials);
            }

            if (full.onChainBnb)
                this.onChainBnb = full.onChainBnb;
            if (full.onChainDgg)
                this.onChainDgg = full.onChainDgg;
            if (full.onChainDna)
                this.onChainDna = full.onChainDna;
        }
        Message.dispatchEvent(DataEvent.DATA_CURRENCY_CHANGE);
    }

    addMaterials(materials: { tokenType: core.NftMaterialType, cnt: number }[]) {
        PlayerManger.getInstance().playerSelfInfo.refreshData();
        // let _materials = this.materials;
        // for (const material of materials) {
        //     let idx = _materials.findIndex(v => v.tokenType == material.tokenType);
        //     if (idx == -1) {
        //         _materials.push(core.Material.create({
        //             tokenType: material.tokenType,
        //             total: material.cnt,
        //         }));
        //     } else {
        //         _materials[idx].total += material.cnt;
        //     }
        // }
        // this.materials = _materials;
    }
    getMaterialByType(type: core.NftMaterialType) {
        return this.materials.find((v) => type == v.tokenType);
    }

      
    getMaterialCount(type: core.NftMaterialType) {
        let n = 0;
        let info = this.materials.find((v) => type == v.tokenType);
        if (info) {
            n = info.total - info.locking;
        }
        return n;
    }
}

type UpMaterials = pkgsc.ScCardUpgradePush | pkgsc.ScCardResetAttrPush | pkgsc.ScCardResetAllPush | pkgsc.ScCardResetPowerPush
    | pkgsc.ScEquipResetAllPush | pkgsc.ScEquipResetAttrPush | pkgsc.ScEquipBurnPush | pkgsc.ScEquipComposePush | pkgsc.ScEquipRepairEquipPush | pkgsc.ScEquipRepairEquipGroupPush

