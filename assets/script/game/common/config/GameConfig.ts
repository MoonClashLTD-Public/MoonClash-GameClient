/*
 * @Author: dgflash
 * @Date: 2021-07-03 16:13:17
 * @LastEditors: dgflash
 * @LastEditTime: 2022-01-26 13:40:19
 */

import { Logger } from "../../../core/common/log/Logger";

/*
   
 */
export class GameConfig {
      
    getConfigPath(relative_path: string) {
        return "config/game/" + relative_path;
    }
    getConfigServerPath(relative_path: string) {
        return `${document.location.href}game_confs/` + relative_path + ".json" + "?" + Math.random();
    }
      
    getRolePath(name: string) {
        return `content/role/${name}`;
    }
      
    ver: string = '-';
      
    hotVer: string = '-';
      
    get isDev() {
        return this._data["config"]["isDev"];
    }
      
    get version(): string {
        return this._data["config"]["version"];
    }
      
    get package(): string {
        return this._data["config"]["package"];
    }
      
    get frameRate(): number {
        return this._data.config.frameRate;
    }
      
    get httpServer(): string {
        return this._data.config.httpServer;
    }
      
    get hotUpdateServer(): string {
        let url = this._data.config.hotUpdateServer;
        if (url.endsWith('/')) {
            url = url.slice(0, -1);
        }
        return url;
    }
      
    get httpTimeout(): number {
        return this._data.config.httpTimeout;
    }

      
    get language(): Array<string> {
        return this._data.language.type || ["zh"];
    }
    get languagePathJson(): string {
        return this._data.language.path.json || "language/json";
    }
    get languagePathTexture(): string {
        return this._data.language.path.texture || "language/texture";
    }


    private _data: any = null;
    constructor(config: any) {
        let data = config.json;
        this._data = Object.freeze(data);

        Logger.logConfig(this._data, "");
    }
}