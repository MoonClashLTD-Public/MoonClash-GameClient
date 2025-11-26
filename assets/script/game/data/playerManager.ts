import { Message } from "../../core/common/event/MessageManager";
import { tips } from "../../core/gui/prompt/TipsManager";
import { oops } from "../../core/Oops";
import { BattleManger } from "../battle/BattleManger";
import { BattleEvent } from "../battle/utils/BattleEnum";
import { GameEvent } from "../common/config/GameEvent";
import { UIID } from "../common/config/GameUIConfig";
import { netChannel } from "../common/net/NetChannelManager";
import { BlindBoxData } from "./blindBoxData";
import { DataBase } from "./dataBase";
import { PlayerPVEInfo } from "./playerPVEInfo";
import { PlayerCardManager } from "./playerCardManager";
import { PlayerSelfInfo } from "./playerSelfInfo";
import { PlayerEquipManager } from "./playerEquipManager";
import { AwsManger } from "./awsManger";
import { game } from "cc";
import { AlertParam } from "../../core/gui/prompt/Alert";

export class PlayerManger {
    static #instance: PlayerManger;
    public static getInstance(): PlayerManger {
        if (!PlayerManger.#instance) {
            PlayerManger.#instance = new PlayerManger();
        }
        return PlayerManger.#instance;
    }
    playerId: number = -1;

      
    playerSelfInfo: PlayerSelfInfo = new PlayerSelfInfo();
      
    blindBoxData: BlindBoxData = new BlindBoxData();

    pveInfo: PlayerPVEInfo = new PlayerPVEInfo()

    cardManager: PlayerCardManager = new PlayerCardManager()

    equipManager: PlayerEquipManager = new PlayerEquipManager()

    allDatas: DataBase[] = [];
      
    async init() {
        this.playerSelfInfo.init()
        await this.playerSelfInfo.updData()
        this.allDatas = [
            // this.playerSelfInfo,
            this.blindBoxData,
            this.pveInfo,
            this.cardManager,
            this.equipManager
        ];
        this.allDatas.forEach(e => e.init());
        let bf = await this.refreshData();
        this.addEvent();
        return bf;
    }

    async refreshData() {
        let res = await Promise.all(this.allDatas.map(e => e.updData()));
        return res.findIndex(r => r == false) == -1;
    }

    destory() {
        this.allDatas.forEach(e => e.destory());
        this.removeEvent();
    }

    addEvent() {
        Message.on(GameEvent.HomeServerReconnect, this.reconnect, this);   
        Message.on(BattleEvent.QUIT, this.BattleQuit, this);
        Message.on(`${opcode.OpCode.ScKickPush}`, this.ScKickPush, this);
    }
    removeEvent() {
        Message.off(GameEvent.HomeServerReconnect, this.reconnect, this);
        Message.off(BattleEvent.QUIT, this.BattleQuit, this);
        Message.off(`${opcode.OpCode.ScKickPush}`, this.ScKickPush, this);
    }

    async reconnect() {
        await PlayerManger.getInstance().refreshData();   
        Message.dispatchEvent(GameEvent.HomeServerDataRefresh);
    }

    loginOut() {
        AwsManger.getInstance().onLogout()
        netChannel.homeClose();
        netChannel.gameClose();
        PlayerManger.getInstance().destory();
        BattleManger.getInstance().destroy();
        tips.hideLoadingMask(true);
        tips.netInstableClose();
    }

      
    returnToLogin(isToLoginOut: boolean = true) {
        if (isToLoginOut)
            this.loginOut();
        oops.gui.clear(true);
        oops.gui.open(UIID.LoginUI);   
        oops.audio.stopAll();
        // game.restart();
    }

    private BattleQuit() {
        this.cardManager.refreshData()
        this.equipManager.refreshData()
    }

    ScKickPush(event: string, data: pkgsc.ScKickPush) {
        this.loginOut();
        oops.gui.open<AlertParam>(UIID.Alert, {
            content: data.reasonText,
            cancelCB: () => {
                this.returnToLogin(false);
            },
        })
    }
}