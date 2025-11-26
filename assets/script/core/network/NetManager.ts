import { CallbackObject, IRequestProtocol, NetData } from "./NetInterface";
import { NetConnectOptions, NetNode } from "./NetNode";

/*
   
 */
export class NetManager {
    private static _instance: NetManager;
    protected _channels: { [key: number]: NetNode } = {};

    public static getInstance(): NetManager {
        if (!this._instance) {
            this._instance = new NetManager();
        }
        return this._instance;
    }

      
    public setNetNode(newNode: NetNode, channelId: number = 0) {
        this._channels[channelId] = newNode;
    }

      
    public removeNetNode(channelId: number) {
        delete this._channels[channelId];
    }

      
    public connect(options: NetConnectOptions, channelId: number = 0): boolean {
        if (this._channels[channelId]) {
            return this._channels[channelId].connect(options);
        }
        return false;
    }

      
    public send(buf: NetData, force: boolean = false, channelId: number = 0): number {
        let node = this._channels[channelId];
        if (node) {
            return node!.send(buf, force);
        }
        return -1;
    }

      
    public request(reqProtocol: IRequestProtocol, rspObject: CallbackObject, showTips: boolean = true, force: boolean = false, channelId: number = 0) {
        let node = this._channels[channelId];
        if (node) {
            node.request(reqProtocol, rspObject, showTips, force);
        }
    }

      
    public requestUnique(reqProtocol: IRequestProtocol, rspObject: CallbackObject, showTips: boolean = true, force: boolean = false, channelId: number = 0): boolean {
        let node = this._channels[channelId];
        if (node) {
            return node.requestUnique(reqProtocol, rspObject, showTips, force);
        }
        return false;
    }

      
    public close(code?: number, reason?: string, channelId: number = 0) {
        if (this._channels[channelId]) {
            return this._channels[channelId].close(code, reason);
        }
    }
}