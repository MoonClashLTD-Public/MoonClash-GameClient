import { Message } from "../../../core/common/event/MessageManager";
import { IResponseProtocol } from "../../../core/network/NetInterface";
import { NetNodeGame } from "./NetNodeGame";

export class NetGame extends NetNodeGame {
    constructor() {
        super();
        this.notifyEvent();
    }
      
    notifyEvent() {
        this.setResponeHandler(opcode.OpCode.BcBattleSettlePush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgbc.BcBattleSettlePush);
        });
        this.setResponeHandler(opcode.OpCode.BcBattlePush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgbc.BcBattlePush);
        });
        this.setResponeHandler(opcode.OpCode.BcSyncPush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgbc.BcSyncPush);
        });
        this.setResponeHandler(opcode.OpCode.BcChatPush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgbc.BcChatPush);
        });
        this.setResponeHandler(opcode.OpCode.BcPreAtkPush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgbc.BcPreAtkPush);
        });
        this.setResponeHandler(opcode.OpCode.BcAttackPush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgbc.BcAttackPush);
        });
        this.setResponeHandler(opcode.OpCode.BcBattleReadyPush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgbc.BcBattleReadyPush);
        });
        this.setResponeHandler(opcode.OpCode.BcBattlePlayerReadyPush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgbc.BcBattlePlayerReadyPush);
        });
        this.setResponeHandler(opcode.OpCode.BcPingResp.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgbc.BcPingResp);
        });
    }
      
    // public async reqUnique(csOpCode: opcode.OpCode.CbAttackReq, scOpCode: opcode.OpCode.BcAttackResp, data: pkgcb.CbAttackReq, showTips?: boolean, force?: boolean): Promise<pkgbc.BcAttackResp>

    public async reqUnique(csOpCode: opcode.OpCode.CbChatReq, scOpCode: opcode.OpCode.BcChatResp, data: pkgcb.CbChatReq, showTips?: boolean, force?: boolean): Promise<pkgbc.BcChatResp>
    public async reqUnique(csOpCode: opcode.OpCode.CbAttackReq, scOpCode: opcode.OpCode.BcAttackResp, data: pkgcb.CbAttackReq, showTips?: boolean, force?: boolean): Promise<pkgbc.BcAttackResp>
    public async reqUnique(csOpCode: opcode.OpCode.CbPreAtkReq, scOpCode: opcode.OpCode.BcPreAtkResp, data: pkgcb.CbPreAtkReq, showTips?: boolean, force?: boolean): Promise<pkgbc.BcPreAtkResp>
    public async reqUnique<T, U>(csOpCode: opcode.OpCode, scOpCode: opcode.OpCode, data: T, showTips: boolean = true, force: boolean = false): Promise<U> {
        return await super.reqUnique<T, U>(csOpCode, scOpCode, data, showTips, force);
    }
}