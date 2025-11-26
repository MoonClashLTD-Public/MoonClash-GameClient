/*
 * @Author: dgflash
 * @Date: 2022-04-21 13:48:44
 * @LastEditors: dgflash
 * @LastEditTime: 2022-04-21 14:11:25
 */
import { error } from "cc";
import { IProtocolHelper, IRequestProtocol, IResponseProtocol, NetData } from "./NetInterface";
let SEQ = 1;
  
export class NetProtocolProtobuf implements IProtocolHelper {
    getHeadlen(): number {
        return 0;
    }

    getHearbeat(): NetData {
        return "";
    }

    getPackageLen(msg: NetData): number {
        return msg.toString().length;
    }

    checkResponsePackage(respProtocol: IResponseProtocol): boolean {
        return true;
    }

    handlerResponsePackage(respProtocol: IResponseProtocol): boolean {
        if (respProtocol.data.code == null || respProtocol.data.code == errcode.ErrCode.Ok) {
            return true;
        } else {
            return false;
        }
        // return true;
    }

    handlerRequestPackage(reqProtocol: IRequestProtocol): string {
        let rspCmd = reqProtocol.scOpCode.toString();
        return rspCmd;
    }

    getPackageId(respProtocol: IResponseProtocol): string {
        return respProtocol.scOpCode.toString();
    }

      
    unPackage(msg: NetData) {
        let d = this.decode(msg as ArrayBuffer);
        let data: IResponseProtocol = {
            scOpCode: d.opCode,
            data: d.data,
        }
        return data;
    }

      
    package(resProtocol: IRequestProtocol): NetData {
        return this.encode(resProtocol.csOpCode, resProtocol.data);
    }

      
    private _concatenate(arrays: ArrayBuffer[]) {

        let totalLen = 0;

        for (let arr of arrays)

            totalLen += arr.byteLength;

        let res = new Uint8Array(totalLen)

        let offset = 0

        for (let arr of arrays) {

            let uint8Arr = new Uint8Array(arr)

            res.set(uint8Arr, offset)

            offset += arr.byteLength

        }

        return res.buffer

    }
      
    private encode<T>(opCode: opcode.OpCode, data: T) {
        let name = opcode.OpCode[opCode];
        // let d = pkgcs[name].create(data);
        // let buffer = pkgcs[name].encode(d).finish();
        let buffer = this.encodePb(opCode, data);

        let opCodeBuf = new ArrayBuffer(4);
        let opCodeView = new Uint32Array(opCodeBuf);
        opCodeView[0] = opCode;
        let seqBuf = new ArrayBuffer(4);
        let seqView = new Uint32Array(seqBuf);
        seqView[0] = SEQ;
        SEQ += 2;
        if (SEQ > 4294967295) SEQ = 0;

        let lenBuf = new ArrayBuffer(4);
        let lenView = new Uint32Array(lenBuf);
        lenView[0] = lenBuf.byteLength + opCodeBuf.byteLength + seqView.byteLength + buffer.byteLength;
        return this._concatenate([lenBuf, opCodeBuf, seqBuf, buffer]);
    }
    private getOpCode(buf: ArrayBuffer) {
        let view = new Uint8Array(buf);
        // let lenBuf = view.slice(0, 4).buffer;
        let opCodeBuf = view.slice(4, 8).buffer;
        let opCode = new Uint32Array(opCodeBuf)[0];
        return opCode;
    }
      
    private decode<T>(data: ArrayBuffer): { opCode: opcode.OpCode, data: T } {
        let view = new Uint8Array(data);
        let lenBuf = view.slice(0, 4).buffer;
        let opCodeBuf = view.slice(4, 8).buffer;
        let seqBuf = view.slice(8, 12).buffer;
        let dataView = view.slice(12, new Uint32Array(lenBuf)[0])
        let opCode = new Uint32Array(opCodeBuf)[0];
        // let seq = new Uint32Array(seqBuf)[0];

        return { opCode, data: this.decodePb(opCode, data, dataView) };
    }

    decodePb<T>(opCode: opcode.OpCode, data: T, dataView: Uint8Array) {
        let name = opcode.OpCode[opCode];
        let f = pkgsc[name] || pkgbc[name];
        if (!f) {
            error('pkg not have name:', name)
            return;
        }
        return f.decode(new Uint8Array(dataView.buffer))
    }
    encodePb<T>(opCode: opcode.OpCode, data: T) {
        let name = opcode.OpCode[opCode];
        let f = pkgcs[name] || pkgcb[name];
        if (!f) {
            error('pkg not have name:', name)
            return;
        }
        let d = f.create(data);
        let buffer = f.encode(d).finish();
        return buffer;
    }
}