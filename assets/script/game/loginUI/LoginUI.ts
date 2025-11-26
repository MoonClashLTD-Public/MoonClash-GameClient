import { _decorator, Component, Node, EditBox, Event, Input, EventTouch, UITransform, v3, sys, Prefab, instantiate, Toggle, ToggleContainer, Button } from 'cc';
import { EngineMessage } from '../../core/common/event/EngineMessage';
import { Message } from '../../core/common/event/MessageManager';
import { resLoader } from '../../core/common/loader/ResLoader';
import { Logger } from '../../core/common/log/Logger';
import { LanguageManager } from '../../core/gui/language/Language';
import { Languages } from '../../core/gui/language/LanguageData';
import { LanguageLabel } from '../../core/gui/language/LanguageLabel';
import { tips } from '../../core/gui/prompt/TipsManager';
import { oops } from '../../core/Oops';
import { CommonUtil } from '../../core/utils/CommonUtil';
import { BattleManger } from '../battle/BattleManger';
import { config } from '../common/config/Config';
import { GameEvent } from '../common/config/GameEvent';
import { UIID } from '../common/config/GameUIConfig';
import { CCVMParentComp } from '../common/ecs/CCVMParentComp';
import HttpHome from '../common/net/HttpHome';
import { netChannel } from '../common/net/NetChannelManager';
import { netConfig } from '../common/net/NetConfig';
import TableUrls from '../common/table/TableUrls';
import { AwsManger } from '../data/awsManger';
import { PlayerManger } from '../data/playerManager';
import { STORAGE_ENUM } from '../homeUI/HomeEvent';
import { HotUpdate } from '../initialize/view/HotUpdate';
import TableGlobalConfig from '../common/table/TableGlobalConfig';

const { ccclass, property } = _decorator;

@ccclass('LoginUI')
export class LoginUI extends CCVMParentComp {
    @property(Node)
    testNode: Node
    @property(Node)
    testPwdNode: Node
    @property(Node)
    langNode: Node
    @property(Button)
    langBtn: Button
    @property(ToggleContainer)
    toggles: ToggleContainer
    @property(EditBox)
    httpServerEditBox: EditBox
    @property(EditBox)
    serverEditBox: EditBox
    @property(EditBox)
    playerIdEditBox: EditBox
    @property(EditBox)
    playerIdEditBox1: EditBox
    @property([Node])
    btnNodes: Node[] = []
      
    data = {
          
        ver: "",
    };
    serverConfigs: { server: string, plat: string }[] = [
        {
            server: oops.storage.get("serverEditBox"),
            plat: oops.storage.get("httpServerEditBox"),
        },
        {
            server: '',
            plat: '',
        },
        {
            server: '',
            plat: '',
        },
        {
            server: '',
            plat: '',
        },
    ]
    get isDev() {
        return config.game.isDev || sys.isBrowser;
    };
    start() {
        this.data.ver = config.game.ver;
        this.testNode.active = this.isDev;
        this.changeServer();
        this.setDebugTouch();

        // resLoader.load<Prefab>('common/prefab/datePicker/datePicker', (e, res: Prefab) => {
        //     this.node.addChild(instantiate(res));
        // })
    }

    reset() { }

    update(deltaTime: number) {

    }
    public onAdded(params: any = {}) {
        this.initLang();
        this.addEvent();
        this.upView()
    }
    private async upView() {
        const ok = await AwsManger.getInstance().checkTokenExpiration(false)
        const list = AwsManger.getInstance().getAutoLoginList()
        this.btnNodes[0].active = !ok
        this.btnNodes[1].active = true
        this.btnNodes[2].active = ok
        this.btnNodes[3].active = list.length > 0
    }
    public onRemoved() {
        this.removeEvent();
    }

    keyCont = 0;
    setDebugTouch() {
        enum dir {
            none,
            up,
            center,
            down
        }
        let key = [dir.up, dir.up, dir.down, dir.down, dir.center, dir.center];   
        this.node.on(Input.EventType.TOUCH_END, (event: EventTouch) => {
            this.unschedule(this.resetKey);
            this.scheduleOnce(this.resetKey, 1);

            event.preventSwallow = true;
            let _pos = event.getUILocation();
            let pos = this.node.getComponent(UITransform).convertToNodeSpaceAR(v3(_pos.x, _pos.y));
            // screen.height;
            // event.getUILocation().y;
            let _key = dir.none;
            if (pos.y > 200) {   
                _key = dir.up;
            } else if (pos.y < -200) {   
                _key = dir.down;
            } else {   
                _key = dir.center;
            }
            if (key[this.keyCont] == _key) {
                this.keyCont++;
                if (key.length == this.keyCont) {
                    this.showDevDebug();
                }
            } else {
                this.keyCont = 0;
            }
        }, this);
    }
    resetKey() {
        this.keyCont = 0;
    }
    showDevDebug() {
        // this.testNode.active = true;
        this.testPwdNode.active = true;
    }
    testPwdTextChanged(text: string, e: EditBox, customEventData: string) {
        if (text == "113322") {
            this.testNode.active = true;
            this.testPwdNode.active = false;
        }
    }

    severIdx = 0;
    changeServer(force?: boolean) {
        let server = this.serverConfigs;
        force = !!force;
        if (force) {
            this.severIdx++;
            while (true) {
                if (!!server[this.severIdx]?.server) {
                    break;
                } else {
                    if (this.severIdx >= server.length) {
                        this.severIdx = 0;
                    } else {
                        this.severIdx++;
                    }
                }
            }
        }
        // if (this.isDev == false) this.severIdx = server.length - 1;
        if (this.testNode.active == false) this.severIdx = server.length - 1;
        this.serverEditBox.string = server[this.severIdx].server;
        this.httpServerEditBox.string = server[this.severIdx].plat;

        this.playerIdEditBox.string = oops.storage.get("playerIdEditBox") ?? '1234';
        this.playerIdEditBox1.string = oops.storage.get("playerIdEditBox1") ?? '1235';
    }

    async getMaxSpeedUrl() {
        if (this.testNode.active)
            netConfig.channelid = Number(this.toggles.toggleItems.find(v => v.isChecked).node.name);

        if (netConfig.channelid == -1) {   
            netConfig.urlPlatform = this.httpServerEditBox.string;
            oops.http.server = this.httpServerEditBox.string;

            netConfig.urlWorld = this.serverEditBox.string + "/game";
            TableUrls.upd(cfg.GetUrlConfigsResp.create());
            return true;
        }

        let bf = true;

        await tips.showLoadingMask();
        let urls = TableUrls.getUrlsByType(core.UrlType.UrlPlatform).map(e => { return e.url });
        let maxUrl = await CommonUtil.getMaxSpeedUrl(urls);
        if (!!!maxUrl) bf = false;
        netConfig.urlPlatform = maxUrl;
        oops.http.server = maxUrl;

        let wses = TableUrls.getUrlsByType(core.UrlType.UrlWorld).map(e => { return e.url });
        let maxWs = await CommonUtil.getMaxSpeedWs(wses);
        if (!!!maxWs) bf = false;
        netConfig.urlWorld = maxWs + "/game";

        tips.hideLoadingMask();
        if (bf) {
            let res = await HttpHome.getUrlConfigs();
            TableUrls.upd(res)
        } else {
            oops.gui.toast("login_err", true);
        }
        return bf;
    }

    async loginTestClick(event: Event, customEventData: string) {
        if (await this.getMaxSpeedUrl() == false) return;

        let playerid = Number(this.playerIdEditBox.string);
        if (customEventData) {
            playerid = Number(this.playerIdEditBox1.string);
        }
        // if (playerid >= 34500 && playerid <= 34599) {

        // } else if (sys.isNative) {
        //     oops.gui.toast(' 34500 ~ 34599 !!')
        //     return;
        // }

        await tips.showLoadingMask();

        oops.http.webJwt = '';
        let data = await HttpHome.authById(playerid).catch(() => { });
        tips.hideLoadingMask();
        if (!data) return oops.gui.toast('login_err', true);
        PlayerManger.getInstance().playerId = data.id;
        PlayerManger.getInstance().playerId = playerid;   
        oops.http.webJwt = data.webJwt;
        tips.showLoadingMask();
        netChannel.homeCreate();
        netChannel.homeConnect(data.gameJwt);
    }

      
    async loginClick() {
        if (await this.getMaxSpeedUrl() == false) return;
        oops.http.webJwt = '';
        oops.gui.open(UIID.LoginPopUp)
        // if (ok) {
        //     this.connectHome()
        // } else {
        // }
        // const ret = await AwsManger.getInstance().onLogin('ouyangtt1234@gmail.com', "Ouyangwork123!", true)
    }

    async autoLogin() {
        if (await this.getMaxSpeedUrl() == false) return;
        oops.http.webJwt = '';
        const ok = await AwsManger.getInstance().checkTokenExpiration()
        if (!ok) oops.gui.open(UIID.LoginPopUp)
    }

    private async connectHome() {
        let playerid = Number(this.playerIdEditBox.string);
        tips.showLoadingMask();
        let data = await HttpHome.authById(playerid);
        tips.hideLoadingMask();
        if (!data) return;
        PlayerManger.getInstance().playerId = data.id;
        PlayerManger.getInstance().playerId = playerid;   
        oops.http.webJwt = data.webJwt;
        tips.showLoadingMask();
        netChannel.homeCreate();
        netChannel.homeConnect(data.gameJwt);
    }

      
    async AWTLoginAuthSuccess(c, data: auth.AuthResp) {
          
        let isTest = false
        if (isTest) {
            let playerid = Number(this.playerIdEditBox.string);
            await tips.showLoadingMask();
            let data = await HttpHome.authById(playerid).catch(() => { });
            tips.hideLoadingMask();
            if (!data) return oops.gui.toast('login_err', true);
            PlayerManger.getInstance().playerId = data.id;
            PlayerManger.getInstance().playerId = playerid;   
            oops.http.webJwt = data.webJwt;
            tips.showLoadingMask();
            netChannel.homeCreate();
            netChannel.homeConnect(data.gameJwt);
        } else {
            PlayerManger.getInstance().playerId = data.id;
            oops.http.webJwt = data.webJwt;
            tips.showLoadingMask();
            netChannel.homeCreate();
            netChannel.homeConnect(data.gameJwt);
        }
    }

      
    async registerClick() {
        if (await this.getMaxSpeedUrl() == false) return;
        oops.http.webJwt = '';
        oops.gui.open(UIID.RegisterPopUp1)
    }

    initLang() {
        let lang = oops.storage.get(STORAGE_ENUM.language, Languages.EN);
        this.langBtn.getComponentInChildren(LanguageLabel).dataID = `setting_${lang}`;
    }

    langClick() {
        this.langNode.active = !this.langNode.active;
        let labs = this.langNode.getComponentsInChildren(LanguageLabel);
        for (let index = 0; index < labs.length; index++) {
            const lang = config.game.language[index];
            if (lang) {
                labs[index].dataID = `setting_${lang}`;
                labs[index].node.parent.getComponent(Button).clickEvents[0].customEventData = `${index}`;
            }
            labs[index].node.parent.active = !!lang;
        }
    }

      
    setLangClick(event: Event, customEventData: string) {
        this.langNode.active = false;
        let lang = config.game.language[Number(customEventData)];
        oops.storage.set(STORAGE_ENUM.language, lang);
        LanguageManager.instance.setLanguage(lang, () => { });
        this.initLang();
    }

    customerServiceClick() {
        let str = TableGlobalConfig.cfg.customer_service;
        sys.openURL(str);
    }

    addEvent() {
        Message.on(EngineMessage.GAME_ENTER, this.GAME_ENTER, this);
        Message.on(GameEvent.HomeServerConnected, this.HomeServerConnected, this);
        Message.on(GameEvent.HomeServerDisconnect, this.HomeServerDisconnect, this);
        Message.on(GameEvent.AWTLoginAuthSuccess, this.AWTLoginAuthSuccess, this);
    }

    removeEvent() {
        Message.off(EngineMessage.GAME_ENTER, this.GAME_ENTER, this);
        Message.off(GameEvent.HomeServerConnected, this.HomeServerConnected, this);
        Message.off(GameEvent.HomeServerDisconnect, this.HomeServerDisconnect, this);
        Message.off(GameEvent.AWTLoginAuthSuccess, this.AWTLoginAuthSuccess, this);
    }

      
    async HomeServerConnected() {
        oops.storage.set("serverEditBox", this.serverEditBox.string);
        oops.storage.set("playerIdEditBox", this.playerIdEditBox.string);
        oops.storage.set("playerIdEditBox1", this.playerIdEditBox1.string);
        oops.storage.set("httpServerEditBox", this.httpServerEditBox.string);

          
        let bf = await PlayerManger.getInstance().init();
        if (bf) {
            BattleManger.getInstance().init();

              
            if (PlayerManger.getInstance().playerSelfInfo.inBattle) {
                netChannel.home.reqUnique(opcode.OpCode.CsMatchReq, opcode.OpCode.ScMatchResp, pkgcs.CsMatchReq.create())
                PlayerManger.getInstance().playerSelfInfo.inBattle = false;
            } else {
                  
                await oops.gui.openAsync(UIID.HomeUI);
            }
              
            oops.gui.remove(UIID.LoginUI);
        } else {
            oops.gui.toast("!");
            Logger.erroring("!");
            netChannel.homeClose();
        }
        tips.hideLoadingMask();
    }

      
    HomeServerDisconnect() {
        tips.hideLoadingMask();
        tips.alert("");
    }

    GAME_ENTER() {
        HotUpdate.checkUpdate();
    }
}

