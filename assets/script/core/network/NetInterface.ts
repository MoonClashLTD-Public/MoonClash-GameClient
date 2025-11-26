/*
   
 */
export type NetData = (string | ArrayBufferLike | Blob | ArrayBufferView);
export type NetCallFunc = (data: any) => void;

  
export interface IRequestProtocol {
      
    csOpCode: number
      
    scOpCode: number
      
    data: unknown
}

  
export interface IResponseProtocol {
      
    scOpCode: number
      
    data: any
}

  
export interface CallbackObject {
    target: any,                  
    callback: NetCallFunc,        
}

  
export interface RequestObject {
    buffer: NetData,                     
    rspCmd: string,                      
    rspObject: CallbackObject | null,    
}

  
export interface IProtocolHelper {
      
    getHeadlen(): number;
      
    getHearbeat(): NetData;
      
    getPackageLen(msg: NetData): number;
      
    checkResponsePackage(msg: IResponseProtocol): boolean;
      
    handlerRequestPackage(reqProtocol: IRequestProtocol): string;
      
    handlerResponsePackage(respProtocol: IResponseProtocol): boolean;
      
    getPackageId(msg: IResponseProtocol): string;
      
    unPackage(msg: NetData): IResponseProtocol;
      
    package(reqProtocol: IRequestProtocol): NetData;
}

export type SocketFunc = (event: any) => void;
export type MessageFunc = (msg: NetData) => void;

  
export interface ISocket {
    onConnected: SocketFunc | null;           
    onMessage: MessageFunc | null;            
    onError: SocketFunc | null;               
    onClosed: SocketFunc | null;              

    connect(options: any): any;                       
    send(buffer: NetData): number;                    
    close(code?: number, reason?: string): void;      
}

  
export interface INetworkTips {
    connectTips(isShow: boolean): void;
    reconnectTips(isShow: boolean): void;
    disconnectTips(isShow: boolean): void;
    requestTips(isShow: boolean): void;
    responseErrorCode(code: number): void;
}