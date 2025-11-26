import { Message } from "../../../core/common/event/MessageManager";
import { Logger } from "../../../core/common/log/Logger";
import { CallbackObject, IRequestProtocol, IResponseProtocol } from "../../../core/network/NetInterface";
import { NetNode } from "../../../core/network/NetNode";
import { netConfig } from "./NetConfig";

  
export class NetNodeGame extends NetNode {
    constructor() {
        super();
        // this.notifyEvent();
    }

      
    public notify<T>(csOpCode: opcode.OpCode, scOpCode: opcode.OpCode, data: T) {
        let protocol: IRequestProtocol = {
            csOpCode: csOpCode,
            scOpCode: scOpCode,
            data: data,
        }
        let cb: CallbackObject = {
            target: this, callback: (data: IResponseProtocol) => {
                // Message.dispatchEvent(protocol.opCode.toString(), data);
            }
        }
        this.request(protocol, cb, false, false);
    }
      
    // notifyEvent() {
    //     this.setResponeHandler(opcode.OpCode.ScBattleEnterPush.toString(), (data: IResponseProtocol) => {
    //         Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgsc.ScBattleEnterPush);
    //     });
    //     this.setResponeHandler(opcode.OpCode.ScPingResp.toString(), (data: IResponseProtocol) => {
    //         Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgsc.ScPingResp);
    //     });
    // }

    // public req<T, U>(opCode: opcode.OpCode, data: T, rspObject: CallbackObject, showTips: boolean = true, force: boolean = false) {
    //     let protocol: IRequestProtocol = {
    //         opCode: opCode,
    //         data: data,
    //     }
    //     return this.request(protocol, rspObject, showTips, force);
    // }

      
    public reqUnique<T, U>(csOpCode: opcode.OpCode, scOpCode: opcode.OpCode, data: T, showTips: boolean = true, force: boolean = false): Promise<U> {
        let protocol: IRequestProtocol = {
            csOpCode: csOpCode,
            scOpCode: scOpCode,
            data: data,
        }
        return new Promise(resolve => {
            let cb: CallbackObject = {
                target: this, callback: (data: IResponseProtocol) => {
                    resolve(data.data as U);
                }
            }
            let bf = super.requestUnique(protocol, cb, showTips, force);
            // if (!bf) resolve({ errCode: errcode.ErrCode.Failed, data: null });
            if (bf === false) {
                Logger.logNet("NetNodeGame.reqUnique", "" + csOpCode);
            }
        })
    }
}