/*
 * @Date: 2021-08-12 09:33:37
 * @LastEditors: dgflash
 * @LastEditTime: 2022-04-21 14:08:46
 */
import { log } from "cc";
import { tips } from "../../../core/gui/prompt/TipsManager";
import { NetData } from "../../../core/network/NetInterface";
import { NetManager } from "../../../core/network/NetManager";
import { NetProtocolProtobuf } from "../../../core/network/NetProtocolProtobuf";
import { WebSock } from "../../../core/network/WebSock";
import { oops } from "../../../core/Oops";
import { BattleManger } from "../../battle/BattleManger";
import { PlayerManger } from "../../data/playerManager";
import { UIID } from "../config/GameUIConfig";
import { netConfig } from "./NetConfig";
import { NetGame } from "./NetGame";
import { NetGameTips } from "./NetGameTips";
import { NetHome } from "./NetHome";
import { NetHomeTips } from "./NetHomeTips";

export enum NetChannelType {
      
    Home = 0,
      
    Game = 0,
}

  
class HomeProtocol extends NetProtocolProtobuf {
      
    getHearbeat(): NetData {
        return this.package({
            csOpCode: opcode.OpCode.CsPingReq,
            scOpCode: opcode.OpCode.ScPingResp,
            data: pkgcs.CsPingReq.create()
        });
    }
}
  
class GameProtocol extends NetProtocolProtobuf {
      
    getHearbeat(): NetData {
        return this.package({
            csOpCode: opcode.OpCode.CbPingReq,
            scOpCode: opcode.OpCode.BcPingResp,
            data: pkgcb.CbPingReq.create()
        });
    }
}

export class NetChannelManager {
    public home!: NetHome;
    public game!: NetGame;

      
    homeCreate() {
        this.home = new NetHome();
          
        this.home.init(new WebSock(), new HomeProtocol(), new NetHomeTips());
        NetManager.getInstance().setNetNode(this.home, NetChannelType.Home);
    }

      
    homeConnect(jwt: string) {
        NetManager.getInstance().connect({
            // url: `ws://${netConfig.gameIp}:${netConfig.gamePort}`,
            // url: `ws://jwt:${jwt}@${netConfig.gameServer}`,
            url: `${netConfig.urlWorld}?jwt=${jwt}`,
            autoReconnect: 3,
        }, NetChannelType.Home);
    }

      
    homeClose() {
        if (this.home)
            NetManager.getInstance().close(1000, "homeClose", NetChannelType.Home);
        this.home = null;
    }
      
    gameCreate() {
        this.game = new NetGame();
          
        this.game.init(new WebSock(), new GameProtocol(), new NetGameTips());
        NetManager.getInstance().setNetNode(this.game, NetChannelType.Game);
    }

      
    gameConnect(jwt: string) {
        NetManager.getInstance().connect({
            // url: `ws://${netConfig.gameIp}:${netConfig.gamePort}`,
            // url: `ws://jwt:${jwt}@${netConfig.gameServer}`,
            url: `${netConfig.urlBattle}?jwt=${jwt}`,
            autoReconnect: 3,
        }, NetChannelType.Game);
    }

      
    gameClose() {
        if (this.game)
            NetManager.getInstance().close(1000, "gameClose", NetChannelType.Game);
        this.game = null;
    }
}

export var netChannel = new NetChannelManager();