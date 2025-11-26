/*
 * @Date: 2021-08-12 09:33:37
 * @LastEditors: dgflash
 * @LastEditTime: 2022-01-24 15:15:30
 */

import { NativeUtil } from "../../../core/utils/NativeUtil"

  
class NetConfig {
    // public gameIp: string = "";
    // public gamePort: string = "9587";
    // public gameServer: string = ""
    _channelid = -1;
    public get channelid() {
        if (this._channelid == -1) {
              
            let cid = NativeUtil.getChannelId();
            this._channelid = cid == -1 ? 1 : cid;
        }
        return this._channelid;
    }
    public set channelid(val: number) {
        this._channelid = val;
    }

    public urlWorld: string = ""
    public urlBattle: string = ""
    public urlRes: string = ""
    public urlPlatform: string = ""
    public dbid!: number;
    public sdkUid!: string;
    public serverId!: number;
    public sessionKey!: string;
}

export var netConfig = new NetConfig();