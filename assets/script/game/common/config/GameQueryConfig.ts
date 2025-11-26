/*
 * @Author: dgflash
 * @Date: 2022-04-14 17:08:01
 * @LastEditors: dgflash
 * @LastEditTime: 2022-04-15 17:02:20
 */
import { warn } from "cc";
import { Logger } from "../../../core/common/log/Logger";
import { guid } from "../../../core/common/manager/TimerManager";
import { UrlParse } from "./UrlParse";

/*
   
 */
export class GameQueryConfig {
      
    public get username(): string {
        return this._data["username"];
    }

      
    public get lang(): string {
        return this._data["lang"] || "zh";
    }

      
    public get ip(): string {
        return this._data["ip"] || "";
    }

      
    public get port(): string {
        return this._data["port"];
    }

      
    public get debug(): string {
        return this._data["debug"];
    }

      
    public getConfigServerInfo(): { ips: Array<string>, ssl: boolean, port: number } {
        let ret = {
            ips: [],
            ssl: false,
            port: 0
        }

        if (this.port) {
            ret.port = parseInt(this.port)
        }
        if (ret.ips.length < 1) {
             
        }
        if (ret.port < 1) {
            warn("")
        }
        return ret;
    }

      
    private _data: any = null;
    public get data() {
        return this._data;
    }
    constructor() {
        let data: any = (new UrlParse()).query;
        if (!data) {
            return;
        }
        if (!data["username"]) {
            data["username"] = guid();
        }
        this._data = Object.freeze(data);

        Logger.logConfig(this._data, "");
    }
}