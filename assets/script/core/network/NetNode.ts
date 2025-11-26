import { error, warn } from "cc";
import { Logger } from "../common/log/Logger";
import { CallbackObject, INetworkTips, IProtocolHelper, IRequestProtocol, IResponseProtocol, ISocket, NetCallFunc, NetData, RequestObject } from "./NetInterface";

/*
  
  
  
  
  
*/

type ExecuterFunc = (callback: CallbackObject, data: IResponseProtocol) => void;
type CheckFunc = (checkedFunc: VoidFunc) => void;
type VoidFunc = () => void;
type BoolFunc = () => boolean;

var NetNodeStateStrs = ["", "", "", ""];

export enum NetTipsType {
    Connecting,   
    ReConnecting,   
    Disconnect,   
    Requesting,   
}

export enum NetNodeState {
    Closed,                       
    Connecting,                   
    Checking,                     
    Working,                      
}

export interface NetConnectOptions {
    host?: string,                
    port?: number,                
    url?: string,                 
    autoReconnect?: number,       
    connectedCallback?: CheckFunc,   
    disconnectCallback?: BoolFunc,   
}

export class NetNode {
    protected _connectOptions: NetConnectOptions | null = null;
    protected _autoReconnect: number = 0;
    protected _isSocketInit: boolean = false;                                 
    protected _isSocketOpen: boolean = false;                                 
    protected _state: NetNodeState = NetNodeState.Closed;                     
    protected _socket: ISocket | null = null;                                 

    protected _networkTips: INetworkTips | null = null;                       
    protected _protocolHelper: IProtocolHelper | null = null;                 
    protected _connectedCallback: CheckFunc | null = null;                    
    protected _disconnectCallback: BoolFunc | null = null;                    
    protected _callbackExecuter: ExecuterFunc | null = null;                  

    protected _keepAliveTimer: any = null;                                    
    protected _receiveMsgTimer: any = null;                                   
    protected _reconnectTimer: any = null;                                    
    protected _heartTime: number = 15000;                                     
    protected _receiveTime: number = 30000;                                   
    protected _reconnetTimeOut: number = 1000;                                
    protected _requests: RequestObject[] = Array<RequestObject>();            
    protected _listener: { [key: string]: CallbackObject[] | null } = {}      

      
    public init(socket: ISocket, protocol: IProtocolHelper, networkTips: INetworkTips | null = null, execFunc: ExecuterFunc | null = null) {
        Logger.logNet(``);
        this._socket = socket;
        this._protocolHelper = protocol;
        this._networkTips = networkTips;
        this._callbackExecuter = execFunc ? execFunc : (callback: CallbackObject, data: IResponseProtocol) => {
            callback.callback.call(callback.target, data);
        }
    }

    public connect(options: NetConnectOptions): boolean {
        this._connectedCallback = options.connectedCallback   
        this._disconnectCallback = options.disconnectCallback   

        if (this._socket && this._state == NetNodeState.Closed) {
            if (!this._isSocketInit) {
                this.initSocket();
            }
            this._state = NetNodeState.Connecting;
            if (!this._socket.connect(options)) {
                this.updateNetTips(NetTipsType.Connecting, false);
                return false;
            }
            if (this._connectOptions == null && typeof options.autoReconnect == "number") {
                this._autoReconnect = options.autoReconnect;
            }
            this._connectOptions = options;
            this.updateNetTips(NetTipsType.Connecting, true);
            return true;
        }
        return false;
    }

    protected initSocket() {
        if (this._socket) {
            this._socket.onConnected = (event) => { this.onConnected(event) };
            this._socket.onMessage = (msg) => { this.onMessage(msg) };
            this._socket.onError = (event) => { this.onError(event) };
            this._socket.onClosed = (event) => { this.onClosed(event) };
            this._isSocketInit = true;
        }
    }

    protected updateNetTips(tipsType: NetTipsType, isShow: boolean) {
        if (this._networkTips) {
            if (tipsType == NetTipsType.Requesting) {
                this._networkTips.requestTips(isShow);
            }
            else if (tipsType == NetTipsType.Connecting) {
                this._networkTips.connectTips(isShow);
            }
            else if (tipsType == NetTipsType.ReConnecting) {
                this._networkTips.reconnectTips(isShow);
            } else if (tipsType == NetTipsType.Disconnect) {
                this._networkTips.disconnectTips(isShow);
            }
        }
    }

      
    protected onConnected(event: any) {
        Logger.logNet("")
        this._isSocketOpen = true;
          
        if (this._connectedCallback) {
            this._state = NetNodeState.Checking;
            this._connectedCallback(() => { this.onChecked() });
        }
        else {
            this.onChecked();
        }
        Logger.logNet(`${NetNodeStateStrs[this._state]}`);
    }

      
    protected onChecked() {
        Logger.logNet("");
        this._state = NetNodeState.Working;
          
        this.updateNetTips(NetTipsType.Connecting, false);
        this.updateNetTips(NetTipsType.ReConnecting, false);

          
        var requests = this._requests.concat();
        if (requests.length > 0) {
            Logger.logNet(`${this._requests.length}`);

            for (var i = 0; i < requests.length;) {
                let req = requests[i];
                this.socket_send(req.buffer);
                if (req.rspObject == null || req.rspCmd != "") {
                    requests.splice(i, 1);
                }
                else {
                    ++i;
                }
            }
              
            this.updateNetTips(NetTipsType.Requesting, this._requests.length > 0);
        } else {
              
            this.resetReceiveMsgTimer();
              
            this.resetHearbeatTimer();
        }
    }

      
    protected onMessage(msg: NetData): void {
          


          
        let data = this._protocolHelper!.unPackage(msg);
        if (!this._protocolHelper!.handlerResponsePackage(data)) {
            if (this._networkTips)
                this._networkTips.responseErrorCode(data.data.code);
        }

          
        this.resetReceiveMsgTimer();
          
        // this.resetHearbeatTimer();
          
        let rspCmd = this._protocolHelper!.getPackageId(data);

        let blackLogList = { [opcode.OpCode.BcBattlePush.toString()]: true }
        if (!blackLogList[rspCmd])
            Logger.logNet(`${rspCmd}`);
          
        if (this._requests.length > 0) {
            for (let reqIdx in this._requests) {
                let req = this._requests[reqIdx];
                if (req.rspCmd == rspCmd && req.rspObject) {
                    if (!blackLogList[rspCmd])
                        Logger.logNet(`${rspCmd}`);
                    this._callbackExecuter!(req.rspObject, data);
                    this._requests.splice(parseInt(reqIdx), 1);
                    break;
                }
            }

            if (this._requests.length == 0) {
                this.updateNetTips(NetTipsType.Requesting, false);
            }
            else {
                Logger.logNet(`${this._requests.length}`);
            }
        }

        let listeners = this._listener[rspCmd];
        if (null != listeners) {
            for (const rsp of listeners) {
                if (!blackLogList[rspCmd])
                    Logger.logNet(`${rspCmd}`);
                this._callbackExecuter!(rsp, data);
            }
        }
    }

    protected onError(event: any) {
        error(event);
    }

    protected onClosed(event: any) {
        if (this._state == NetNodeState.Closed) return;

        this.clearTimer();

          
        if (this._disconnectCallback && !this._disconnectCallback()) {
            Logger.logNet(``);
            this._state = NetNodeState.Closed;
            this.updateNetTips(NetTipsType.Disconnect, false);
            return;
        }

          
        if (this.isAutoReconnect()) {
            this.updateNetTips(NetTipsType.ReConnecting, true);
            this._reconnectTimer = setTimeout(() => {
                this._socket!.close();
                this._state = NetNodeState.Closed;
                this.connect(this._connectOptions!);
                if (this._autoReconnect > 0) {
                    this._autoReconnect -= 1;
                }
                this._reconnetTimeOut += 3000;   
            }, this._reconnetTimeOut);
        }
        else {
            this._state = NetNodeState.Closed;
            this.updateNetTips(NetTipsType.Disconnect, false);
        }
    }

    public close(code?: number, reason?: string) {
        this.clearTimer();
        this._listener = {};
        this._requests.length = 0;
        // if (this._networkTips) {
        //     this._networkTips.connectTips(false);
        //     this._networkTips.reconnectTips(false);
        //     this._networkTips.requestTips(false);
        // }
        if (this._socket) {
            this._socket.close(code, reason);
        }
        this._state = NetNodeState.Closed;
        Logger.logNet(``);
    }

      
    public closeSocket(code?: number, reason?: string) {
        if (this._socket) {
            this._socket.close(code, reason);
        }
    }

      
    public send(buf: NetData, force: boolean = false): number {
        if (this._state == NetNodeState.Working || force) {
            return this.socket_send(buf);
        }
        else if (this._state == NetNodeState.Checking ||
            this._state == NetNodeState.Connecting) {
            this._requests.push({
                buffer: buf,
                rspCmd: "",
                rspObject: null
            });
            Logger.logNet(`${NetNodeStateStrs[this._state]}`);
            return 0;
        }
        else {
            error(`${NetNodeStateStrs[this._state]}`);
            return -1;
        }
    }

      
    public request(reqProtocol: IRequestProtocol, rspObject: CallbackObject, showTips: boolean = true, force: boolean = false) {
        var rspCmd = this._protocolHelper!.handlerRequestPackage(reqProtocol);
        this.base_request(reqProtocol, rspCmd, rspObject, showTips, force);
    }

      
    public requestUnique(reqProtocol: IRequestProtocol, rspObject: CallbackObject, showTips: boolean = true, force: boolean = false): boolean {
        var rspCmd = this._protocolHelper!.handlerRequestPackage(reqProtocol);

        for (let i = 0; i < this._requests.length; ++i) {
            if (this._requests[i].rspCmd == rspCmd) {
                Logger.logNet(`${rspCmd}`);
                return false;
            }
        }

        this.base_request(reqProtocol, rspCmd, rspObject, showTips, force);
        return true;
    }

    private base_request(reqProtocol: IRequestProtocol, rspCmd: string, rspObject: CallbackObject, showTips: boolean = true, force: boolean = false) {
        let buf = this._protocolHelper!.package(reqProtocol);
        if (this._state == NetNodeState.Working || force) {
            this.socket_send(buf);
        } else if (this._state == NetNodeState.Checking ||
            this._state == NetNodeState.Connecting) {
        } else {
            error(`${NetNodeStateStrs[this._state]}`);
            this.updateNetTips(NetTipsType.Disconnect, false);
            return
        }

        Logger.logNet(`${rspCmd}`);

          
        this._requests.push({
            buffer: buf, rspCmd, rspObject
        });
          
        if (showTips) {
            this.updateNetTips(NetTipsType.Requesting, true);
        }
    }

    private socket_send(buf: NetData) {
          
        // this.resetReceiveMsgTimer();
          
        this.resetHearbeatTimer();
        return this._socket!.send(buf);
    }

      
    public setResponeHandler(cmd: string, callback: NetCallFunc, target?: any): boolean {
        if (callback == null) {
            error(`${cmd}`);
            return false;
        }
        this._listener[cmd] = [{ target, callback }];
        return true;
    }

      
    public addResponeHandler(cmd: string, callback: NetCallFunc, target?: any): boolean {
        if (callback == null) {
            error(`${cmd}`);
            return false;
        }
        let rspObject = { target, callback };
        if (null == this._listener[cmd]) {
            this._listener[cmd] = [rspObject];
        }
        else {
            let index = this.getNetListenersIndex(cmd, rspObject);
            if (-1 == index) {
                this._listener[cmd]!.push(rspObject);
            }
        }
        return true;
    }

      
    public removeResponeHandler(cmd: string, callback: NetCallFunc, target?: any) {
        if (null != this._listener[cmd] && callback != null) {
            let index = this.getNetListenersIndex(cmd, { target, callback });
            if (-1 != index) {
                this._listener[cmd]!.splice(index, 1);
            }
        }
    }

    public cleanListeners(cmd: string = "") {
        if (cmd == "") {
            this._listener = {}
        }
        else {
            delete this._listener[cmd];
        }
    }

    protected getNetListenersIndex(cmd: string, rspObject: CallbackObject): number {
        let index = -1;
        for (let i = 0; i < this._listener[cmd]!.length; i++) {
            let iterator = this._listener[cmd]![i];
            if (iterator.callback == rspObject.callback
                && iterator.target == rspObject.target) {
                index = i;
                break;
            }
        }
        return index;
    }

      
    protected resetReceiveMsgTimer() {
        if (this._receiveMsgTimer !== null) {
            clearTimeout(this._receiveMsgTimer);
        }

        this._receiveMsgTimer = setTimeout(() => {

            this._socket!.close();
        }, this._receiveTime);
    }

    protected resetHearbeatTimer() {
        if (this._keepAliveTimer !== null) {
            clearTimeout(this._keepAliveTimer);
        }

        this._keepAliveTimer = setTimeout(() => {
            Logger.logNet("");
            this.send(this._protocolHelper!.getHearbeat());
        }, this._heartTime);
    }

    protected clearTimer() {
        if (this._receiveMsgTimer !== null) {
            clearTimeout(this._receiveMsgTimer);
        }
        if (this._keepAliveTimer !== null) {
            clearTimeout(this._keepAliveTimer);
        }
        if (this._reconnectTimer !== null) {
            clearTimeout(this._reconnectTimer);
        }
    }

    public isAutoReconnect() {
        return this._autoReconnect != 0;
    }

    public rejectReconnect() {
        this._autoReconnect = 0;
        this.clearTimer();
    }
}