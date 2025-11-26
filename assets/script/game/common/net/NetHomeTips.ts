import { log } from "cc";
import { Message } from "../../../core/common/event/MessageManager";
import { Logger } from "../../../core/common/log/Logger";
import { tips } from "../../../core/gui/prompt/TipsManager";
import { INetworkTips } from "../../../core/network/NetInterface";
import { oops } from "../../../core/Oops";
import { BattleManger } from "../../battle/BattleManger";
import { PlayerManger } from "../../data/playerManager";
import { GameEvent } from "../config/GameEvent";
import { UIID } from "../config/GameUIConfig";
import { netChannel } from "./NetChannelManager";

  
export class NetHomeTips implements INetworkTips {
      
    connectTips(isShow: boolean): void {
        if (isShow) {
            Logger.logNet("");
            tips.netInstableOpen();
        }
        else {
            Logger.logNet("");
            tips.netInstableClose();
            Message.dispatchEvent(GameEvent.HomeServerConnected);
        }
    }

    disconnectTips(): void {
        Message.dispatchEvent(GameEvent.HomeServerDisconnect);
        tips.netInstableClose();

        if (oops.gui.has(UIID.LoginUI) == false)
            tips.alert("net_server_disconnected", () => {
                  
                PlayerManger.getInstance().returnToLogin();
                // netChannel.gameConnect();
            });
    }

      
    async reconnectTips(isShow: boolean): Promise<void> {
        if (isShow) {   

        }
        else {   
            Message.dispatchEvent(GameEvent.HomeServerReconnect);
        }
    }

      
    requestTips(isShow: boolean): void {
        if (isShow) {
            tips.netInstableOpen();
        }
        else {
            tips.netInstableClose();
        }
    }

      
    responseErrorCode(code: number): void {
        log("", code);
        let exclude = {
            [errcode.ErrCode.WaitComplete]: true
        }   
        if (exclude[code]) {
            return;
        }
        if (code < 0) {
            // tips.alert("netcode_" + code, () => {
            //     // SDKPlatform.restartGame(;)
            // });
            oops.gui.toast("_err_" + code, true);
        }
        else {
            // tips.alert("netcode_" + code);
            oops.gui.toast("_err_" + code, true);
        }
    }
}