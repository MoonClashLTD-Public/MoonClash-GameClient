/*
 * @Date: 2021-08-12 09:33:37
 * @LastEditors: dgflash
 * @LastEditTime: 2022-01-26 14:07:18
 */
import { log } from "cc";
import { Message } from "../../../core/common/event/MessageManager";
import { Logger } from "../../../core/common/log/Logger";
import { tips } from "../../../core/gui/prompt/TipsManager";
import { INetworkTips } from "../../../core/network/NetInterface";
import { oops } from "../../../core/Oops";
import { GameEvent } from "../config/GameEvent";
import { UIID } from "../config/GameUIConfig";

  
export class NetGameTips implements INetworkTips {
      
    connectTips(isShow: boolean): void {
        if (isShow) {
            Logger.logNet("");
            tips.netInstableOpen();
        }
        else {
            Logger.logNet("");
            tips.netInstableClose();
            Message.dispatchEvent(GameEvent.GameServerConnected);
        }
    }

    disconnectTips(): void {
        Message.dispatchEvent(GameEvent.GameServerDisconnect);
        tips.netInstableClose();

        if (oops.gui.has(UIID.BattleUI)) {
            tips.alert("net_server_disconnected", () => {
                oops.gui.remove(UIID.BattleUI, true);   
                // netChannel.gameConnect();
            })
        }
    }

      
    reconnectTips(isShow: boolean): void {
        if (isShow) {   

        }
        else {   
            Message.dispatchEvent(GameEvent.GameServerReconnect);
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
            [errcode.ErrCode.BattleAttackInvalidPos]: true
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
            oops.gui.toast("_err_" + code, true);
            // tips.alert("netcode_" + code);
        }
    }
}