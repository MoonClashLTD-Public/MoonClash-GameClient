import { Message } from "../../core/common/event/MessageManager";
import { Logger } from "../../core/common/log/Logger";
import { netChannel } from "../common/net/NetChannelManager";
import TableBlindBox from "../common/table/TableBlindBox";
import TableGoldBoxContent from "../common/table/TableGoldBoxContent";
import TableMaterialBoxContent from "../common/table/TableMaterialBoxContent";
import TableNfts from "../common/table/TableNfts";
import TableSpBoxContent from "../common/table/TableSpBoxContent";
import { DataBase } from "./dataBase";
import { DataEvent } from "./dataEvent";
import { PlayerManger } from "./playerManager";

export class BlindBoxData extends DataBase {
      
    data: core.IIdCount[] = [];
    init() {
        this.addEvent();
    }

    async updData(): Promise<boolean> {
        let d = await netChannel.home.reqUnique(opcode.OpCode.CsBlindBoxQueryReq, opcode.OpCode.ScBlindBoxQueryResp, pkgcs.CsBlindBoxQueryReq.create());
        if (d.code == errcode.ErrCode.Ok) {
            this.data = d.boxes;
        } else {
            Logger.erroring(`BlindBoxError ${d.code}`);
        }
        return d.code == errcode.ErrCode.Ok;
    }

    getBoxById(id: number) {
        let info = this.data.find(box => box.id == id);
        if (!info) {
            info = { id: id, cnt: 0 };
            this.data.push(info);
        }
        return info;
    }

    updCnt(boxId: number, cnt: number) {
        let info = this.getBoxById(boxId);
        if (info) {
            info.cnt += cnt;
        } else {
            this.data.push({ id: boxId, cnt: cnt });
        }
    }

    destory() {
        this.removeEvent();
    }

    addEvent() {
        Message.on(`${opcode.OpCode.ScMaterialBoxesOpenPush}`, this.ScMaterialBoxesOpenPush, this);
        Message.on(`${opcode.OpCode.BcBattleSettlePush}`, this.BcBattleSettlePush, this);
        Message.on(`${opcode.OpCode.ScBlindBoxBuyAndOpenPush}`, this.ScBlindBoxBuyAndOpenPush, this);
        // Message.on(`${opcode.OpCode.ScBlindBoxOpenPush}`, this.ScBlindBoxOpenPush, this);
        Message.on(`${opcode.OpCode.ScBlindBoxBuyPush}`, this.ScBlindBoxBuyPush, this);
        Message.on(`${opcode.OpCode.ScBuyBoundBoxPush}`, this.ScBuyBoundBoxPush, this);
    }
    removeEvent() {
        Message.off(`${opcode.OpCode.ScMaterialBoxesOpenPush}`, this.ScMaterialBoxesOpenPush, this);
        Message.off(`${opcode.OpCode.BcBattleSettlePush}`, this.BcBattleSettlePush, this);
        Message.off(`${opcode.OpCode.ScBlindBoxBuyAndOpenPush}`, this.ScBlindBoxBuyAndOpenPush, this);
        // Message.off(`${opcode.OpCode.ScBlindBoxOpenPush}`, this.ScBlindBoxOpenPush, this);
        Message.off(`${opcode.OpCode.ScBlindBoxBuyPush}`, this.ScBlindBoxBuyPush, this);
        Message.off(`${opcode.OpCode.ScBuyBoundBoxPush}`, this.ScBuyBoundBoxPush, this);
    }

      
    BcBattleSettlePush(event: string, data: pkgbc.BcBattleSettlePush) {
        let info = data?.result?.armyInfos?.find((v, k) => v.id == PlayerManger.getInstance().playerId);
        if (info && info.boxes > 0) {
            PlayerManger.getInstance().playerSelfInfo.offChainMaterialBoxes += info.boxes;
        }
    }
      
    ScMaterialBoxesOpenPush(event: string, data: pkgsc.ScMaterialBoxesOpenPush) {
        if (data.code == errcode.ErrCode.Ok) {
            let materials: { tokenType: core.NftMaterialType, cnt: number }[] = [];
            data.contents.forEach(e => {
                let box = TableMaterialBoxContent.getInfoById(e.id);
                if (data.version == "v2") {
                    box = TableSpBoxContent.getInfoById(e.id);
                }else if(data.version == "v3"){
                    box = TableGoldBoxContent.getInfoById(e.id);
                }
                let cfg = TableNfts.getInfoById(box.nft_id);
                materials.push({
                    tokenType: cfg.material_type,
                    cnt: e.cnt,
                });
            })
            PlayerManger.getInstance().playerSelfInfo.addMaterials(materials);
            // PlayerManger.getInstance().playerSelfInfo.offChainMaterialBoxes--;
        }
    }
      
    // ScBlindBoxOpenPush(event: string, data: pkgsc.ScBlindBoxOpenPush) {
    //     if (data.code == errcode.ErrCode.Ok) {
    //         this.updCnt(data.id, -data.cnt);
    //     }
    // }

      
    ScBlindBoxBuyPush(event: string, data: pkgsc.ScBlindBoxBuyPush) {
        if (data.code == errcode.ErrCode.Ok) {
            this.updCnt(data.id, data.cnt);
        }
    }

      
    ScBlindBoxBuyAndOpenPush(event: string, data: pkgsc.ScBlindBoxBuyAndOpenPush) {
        if (data.code == errcode.ErrCode.Ok) {
            this.updCnt(data.id, data.cnt);
            let blinkBox = TableBlindBox.getInfoById(data.id);
            if (blinkBox.type == core.NftSubType.NftSubBoxCard) {
                PlayerManger.getInstance().cardManager.addNetCard(data.cards);
            } else if (blinkBox.type == core.NftSubType.NftSubBoxEquipment) {
                PlayerManger.getInstance().equipManager.addNetEquipment(data.equips);
            }
        }
    }

    ScBuyBoundBoxPush(event: string, data: pkgsc.ScBuyBoundBoxPush) {
        if (data.code == errcode.ErrCode.Ok) {
            this.updCnt(data.id, data.cnt);
            let blinkBox = TableBlindBox.getInfoById(data.id);
            if (blinkBox.type == core.NftSubType.NftSubBoxCard) {
                PlayerManger.getInstance().cardManager.addNetCard(data.cards);
            } else if (blinkBox.type == core.NftSubType.NftSubBoxEquipment) {
                PlayerManger.getInstance().equipManager.addNetEquipment(data.equips);
            }
        }
    }
}