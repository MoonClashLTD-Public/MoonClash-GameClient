/*
 * @Author: dgflash
 * @Date: 2021-07-03 16:13:17
 * @LastEditors: dgflash
 * @LastEditTime: 2022-01-26 13:52:24
 */

import { game, JsonAsset } from "cc";
import { resLoader } from "../../../core/common/loader/ResLoader";
import { oops } from "../../../core/Oops";
import { BuildTimeConstants } from "./BuildTimeConstants";
import { GameConfig } from "./GameConfig";
import { GameQueryConfig } from "./GameQueryConfig";
import { UIConfigData } from "./GameUIConfig";

  
export class Config {
      
    public btc!: BuildTimeConstants;

      
    public game!: GameConfig;

      
    public query!: GameQueryConfig;

    public init(callback: Function) {
        let config_name = "config/config";
        resLoader.load(config_name, JsonAsset, () => {
            var config = resLoader.get(config_name);
            this.btc = new BuildTimeConstants();
            this.query = new GameQueryConfig();
            this.game = new GameConfig(config);

              
            game.frameRate = this.game.frameRate;
              
            oops.http.server = this.game.httpServer;
              
            oops.http.timeout = this.game.httpTimeout;
              
            oops.gui.init(UIConfigData);

            callback();
        })
    }
}

export const config = new Config()