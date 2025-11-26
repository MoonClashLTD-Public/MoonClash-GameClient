import { AudioClip, easing, error, instantiate, log, Node, NodePool, ParticleSystem, Prefab, sys, tween, v2, v3, Vec2 } from "cc";
import { DEBUG, DEV, NATIVE } from "cc/env";
import { Message } from "../../core/common/event/MessageManager";
import { resLoader } from "../../core/common/loader/ResLoader";
import { Logger } from "../../core/common/log/Logger";
import { LanguageData } from "../../core/gui/language/LanguageData";
import { PopViewParams } from "../../core/gui/layer/Defines";
import { tips } from "../../core/gui/prompt/TipsManager";
import { oops } from "../../core/Oops";
import { CommonUtil } from "../../core/utils/CommonUtil";
import ObjectUtil from "../../core/utils/ObjectUtil";
import { GameEvent } from "../common/config/GameEvent";
import { UIID } from "../common/config/GameUIConfig";
import { netChannel } from "../common/net/NetChannelManager";
import { netConfig } from "../common/net/NetConfig";
import TableCards from "../common/table/TableCards";
import TableGlobalConfig from "../common/table/TableGlobalConfig";
import TableHeroes, { HeroCfg } from "../common/table/TableHeroes";
import TableMaps from "../common/table/TableMaps";
import TablePve from "../common/table/TablePve";
import TableSkill, { SkillCfg } from "../common/table/TableSkill";
import TableSkillEffect from "../common/table/TableSkillEffect";
import TableSkillEffectCall from "../common/table/TableSkillEffectCall";
import TableTower from "../common/table/TableTower";
import TableUrls from "../common/table/TableUrls";
import { PlayerManger } from "../data/playerManager";
import { AudioMusicRes } from "../data/resManger";
import { Battle } from "./Battle";
import { BattleMap } from "./BattleMap";
import { BattleTouch } from "./BattleTouch";
import { BattleZIndexManager } from "./BattleZIndexManager";
import { FighterManager } from "./flighter/FighterManager";
import { BattleSkillManager } from "./skill/BattleSkillManager";
import { BattleEvent, BattlePowerType, BattlePrefabs, BattleTimeType, BattleTowerType } from "./utils/BattleEnum";
import { FlighterGameObjcet } from "./utils/FlighterGameObject";

enum PoolEnum {
    Role,
    Skill,
    Flighter,
}

export class BattleManger {
    static #instance: BattleManger;
    public static getInstance(): BattleManger {
        if (!BattleManger.#instance) {
            BattleManger.#instance = new BattleManger();
        }
        return BattleManger.#instance;
    }

    get isTest() {
        return (oops.storage.get("battleTest") ?? '0') == '1';
    }

    #msgs: { eventName: number, data: any }[] = [];
      
    #lockMsg: number = 0;
    lockMsg() {
        return this.#lockMsg++;
    }
    unLockMsg() {
        return this.#lockMsg--;
    }
    #battle: Battle;
    #battleMap: BattleMap;
    get Battle() {
        return this.#battle;
    }
    get BattleMap() {
        return this.#battleMap;
    }
    get BattleTouch() {
        return this.Battle.battleTouch;
    }
    get BattlePlacedArea() {
          
        return this.Battle.battlePlacedArea;
    }
    nodePools: { [key: string]: NodePool } = {};
    mapPrefab: Prefab = null;   
    rolePrefabs: { [key: string]: Prefab } = {};   
    skillPrefabs: { [key: string]: Prefab } = {};   
    battlePrefabs: { [key: string]: Prefab } = {};   
    audioClips: { [key: string]: AudioClip } = {};   
    resPaths: string[] = [];
    audioResPaths: string[] = [];

    battleData: pkgsc.ScBattleEnterPush
    battlePlayerReady: pkgbc.BcBattlePlayerReadyPush
    armies: core.IArmy[] = [];
    mapId: number = 0;
    battleType: core.BattleType = 0;
    matchType: core.MatchType;

    mapName: string
    fRess: { [key: string]: { resName: string, count: number } } = {};   
    sRess: { [key: string]: string } = {};   
    aRess: { [key: string]: string } = {};   
    // ---------------------------------------------------------------------
    flighterGameObjcets: { [key: number]: FlighterGameObjcet } = {};
    skills: { [key: number]: core.IDelayEffect } = {};   
    gameTime: number = 0;   
    gameState: core.BattleState = core.BattleState.BattlePending;   
    powerState: BattlePowerType = BattlePowerType.NONE;   
    isBlue = true;   
    meTeam: core.Team;   
    isWatcher: boolean = false;   
    enemyTeam: core.Team;   
    playerMe: pkgbc.BcBattlePlayerReadyPush.IPlayer;
    playerEnemy: pkgbc.BcBattlePlayerReadyPush.IPlayer;
    isOpen = false;   
    needClose = false;   
    isLoadRes = true;   
    isSelectUrl = true;   
    init() {
        this.addEvent();
    }
    destroy() {
        this.removeEvent();
    }
    initRes(battle: Battle) {
          
        this.sRess = {};
        this.fRess = {};
        this.aRess = {};
        let mapInfo = TableMaps.getInfoById(this.mapId);
        if (!mapInfo) {
            Logger.erroring("map error mapId" + this.mapId);
        }
        this.mapName = mapInfo.res_name;
        for (const army of this.armies) {
            for (const card of army.cards) {
                let cardInfo = TableCards.getInfoByProtoIdAndLv(card.protoId, card.level);
                if (!cardInfo) {
                    log("not card.protoId", card.protoId, card.level);
                }

                for (const hero of cardInfo.summons) {
                    let heroInfo = TableHeroes.getInfoById(hero.id);
                    this.calcRes(heroInfo.Id, hero.count);
                }
            }
            let towerInfo = TableTower.getInfoByLevel(army.level, 0);
            if (army.pveId) {
                let pveCfg = TablePve.getInfoById(army.pveId);
                towerInfo = TableTower.getInfoById(pveCfg.tower_id);
            }
            let kingTower = TableHeroes.getInfoById(towerInfo.king_tower_hero_config_id);
            let guardTower = TableHeroes.getInfoById(towerInfo.guard_tower_hero_config_id);
            this.calcRes(kingTower.Id);
            this.calcRes(guardTower.Id);
        }
        // ---------------------------------------------------------
        this.#battle = battle;
    }

      
    calcRes = (heroId: number, count: number = 1) => {
        let heroInfo = TableHeroes.getInfoById(heroId);
        // if (this.fRess[heroInfo.res_name]) return;
        if (!this.fRess[heroInfo.res_name]) this.fRess[heroInfo.res_name] = { resName: heroInfo.res_name, count: count }
        this.fRess[heroInfo.res_name].count = this.fRess[heroInfo.res_name].count > count ? this.fRess[heroInfo.res_name].count : count;
        if (heroInfo.sound) {
            this.calcAudioRes(heroInfo.sound.atk_res);
            this.calcAudioRes(heroInfo.sound.run_res);
            this.calcAudioRes(heroInfo.sound.born_res);
            this.calcAudioRes(heroInfo.sound.dead_res);
            this.calcAudioRes(heroInfo.sound.jump_res);
            this.calcAudioRes(heroInfo.sound.rush_res);
        }

        for (const skid of heroInfo.sk_ids) {
            let skillInfo = TableSkill.getInfoById(skid);
            if (skillInfo.res_name) {
                this.sRess[skillInfo.res_name] = skillInfo.res_name;
            }
            if (skillInfo.sound) {
                this.calcAudioRes(skillInfo.sound.atk_res);
                this.calcAudioRes(skillInfo.sound.fly_res);
                this.calcAudioRes(skillInfo.sound.hit_res);
            }

            for (const effectId of skillInfo.effect_ids) {
                let effectInfo = TableSkillEffect.getInfoById(effectId);
                if (effectInfo.type == skill.EffectType.EffectTypeCall) {
                    let call = TableSkillEffectCall.getInfoById(effectInfo.value);
                    let heroInfo = TableHeroes.getInfoById(call.hero_id);
                    this.calcRes(heroInfo.Id)
                }
            }
        }
    }

    calcAudioRes(name: string) {
        if (name) {
            this.aRess[name] = name;
        }
    }

      
    loadMiniatureMap(mapName: string): Promise<Prefab> {
        return new Promise((resolve) => {
            let path = `battleRes/miniatureMap/${mapName}/${mapName}`;
            resLoader.load<Prefab>(path, Prefab, (finished: number, total: number, item: any) => {
                // onProgress(finished, total, item);
                // console.log(`${finished}/${total}`, finished / total);
            }, (e: Error, prefab: Prefab) => {
                if (e) {
                    resolve(null);
                } else {
                    resolve(prefab);
                }
            });
        })
    }

    dataInit() {
        this.#msgs.length = 0;
        this.#lockMsg = 0;
        this.flighterGameObjcets = {};
        this.skills = {};
        this.gameState = core.BattleState.BattlePending;
        this.powerState = BattlePowerType.NONE;
        this.timeState = BattleTimeType.NONE;
        this.gameTime = TableGlobalConfig.cfg.fighting_ms + TableGlobalConfig.cfg.over_time_ms;
        this.Battle.dataInit();

        FighterManager.getInstance().dataInit();
        BattleSkillManager.getInstance().dataInit();
    }
    reset() {
          
        BattleZIndexManager.getInstance().reset();
    }

    exitGame() {
        for (const key in this.nodePools) {
            this.nodePools[key].clear();
        }
        this.nodePools = {};
        this.isOpen = false;
        this.needClose = false;
        this.isLoadRes = true;
        this.isSelectUrl = true;
          
        // resLoader.getBundle().releaseUnusedAssets();
        // this.resPaths.forEach(e => resLoader.getBundle().release(e, Prefab));
        // this.audioResPaths.forEach(e => resLoader.getBundle().release(e, AudioClip));
    }

    create() {
        this.#battleMap = new BattleMap(this.#battle.tiledMap);
        this.#battleMap.setShadow(this.#battle.shadowNode, this.#battle.mapNode);
        this.BattlePlacedArea.init();
    }

    loadRes(onProgress: Function): Promise<Boolean> {
        return new Promise((resolve) => {
            // let mapName = 'map_0';
            // let fRess = [
            //     "role_drudgery",
            //     "role_harvester",
            // ]
            let mapName = this.mapName;

            this.rolePrefabs = {};
            this.skillPrefabs = {};
            this.battlePrefabs = {};
            this.resPaths.length = 0;
            this.audioResPaths.length = 0;
            for (const res in this.fRess) {
                this.resPaths.push(`battleRes/flighters/${res}/${res}`);
            }
            for (const res in this.sRess) {
                this.resPaths.push(`battleRes/skills/${res}/${res}`);
            }
            for (const res in this.aRess) {
                this.audioResPaths.push(`audios/battle/role/${res}`);
            }
            this.resPaths.push(`battleRes/map/${mapName}/${mapName}`);
            this.resPaths.push(`battle/${BattlePrefabs.BattleAudio}`);
            this.resPaths.push(`battle/${BattlePrefabs.Flighter}`);
            this.resPaths.push(`battle/${BattlePrefabs.BattleCards}`);
            this.resPaths.push(`battle/${BattlePrefabs.BattleInfo}`);
            this.resPaths.push(`battle/${BattlePrefabs.BattleWatcherInfo}`);
            this.resPaths.push(`battle/${BattlePrefabs.BattleBornTime}`);
            this.resPaths.push(`battle/${BattlePrefabs.BattleDieEffect}`);
            this.resPaths.push(`battle/${BattlePrefabs.BattleBornEffect}`);
            this.resPaths.push(`battle/${BattlePrefabs.BattleBornCost}`);

            let completeIdx = 0;
            let completeMax = 2;
            let completeCB = () => {
                completeIdx++;
                if (completeIdx >= completeMax) {
                    resolve(true);
                }
            }

            resLoader.load<Prefab>(this.resPaths, Prefab, (finished: number, total: number, item: any) => {
                onProgress(finished, total, item);
                // console.log(`${finished}/${total}`, finished / total);
            }, (e: Error, asserts: Prefab[]) => {
                if (e) {
                    error("battle res error:", e)
                    resolve(false);
                } else {
                    for (const assert of asserts) {
                        let name: string = assert.data.name;
                        let resName = name;
                        if (resName == this.mapName) {
                            this.mapPrefab = assert.data;
                        } else if (this.fRess[resName]) {
                            this.rolePrefabs[name] = assert.data;
                            this.initAddToPool(PoolEnum.Role, name, assert.data, this.fRess[name].count);
                        } else if (this.sRess[resName]) {
                            this.skillPrefabs[name] = assert.data;
                            this.initAddToPool(PoolEnum.Skill, name, assert.data, 1);
                        } else {
                            this.battlePrefabs[name] = assert.data;
                            this.initFlighterPool()
                        }
                    }
                    completeCB();
                }
            });

            resLoader.load<AudioClip>(this.audioResPaths, AudioClip, (finished: number, total: number, item: any) => {
                // onProgress(finished, total, item);
                // console.log(`${finished}/${total}`, finished / total);
            }, (e: Error, asserts: AudioClip[]) => {
                if (e) {
                    error("battle res error:", e)
                    resolve(false);
                } else {
                    for (const assert of asserts) {
                        let name: string = assert.name;
                        this.audioClips[name] = assert;
                    }
                    completeCB();
                }
            });
        })
    }

    getEnemyName() {
        let enemyName = this.playerEnemy.name;
        if (this.armies[this.enemyTeam].pveId) {
            enemyName = LanguageData.getLangByID(enemyName);
        }
        return enemyName;
    }

    isPVE() {
        return !!this.armies[this.enemyTeam].pveId;
    }

    isTVGame() {
        return this.battleType == core.BattleType.BattleTypeTVGame;
    }

      
    getDisplayColorByTeam(team: core.Team) {
        let bf = this.isTVGame();
        if (bf) {
            return core.Team.Blue == team ? core.Team.Blue : core.Team.Red;
        } else {
            return this.meTeam == team ? core.Team.Blue : core.Team.Red;
        }
    }

    addEvent() {
        Message.on(GameEvent.GameServerConnected, this.GameServerConnected, this);
        Message.on(GameEvent.GameServerReconnect, this.GameServerReconnect, this);
        Message.on(`${opcode.OpCode.ScMatchPush}`, this.ScMatchPush, this);
        Message.on(`${opcode.OpCode.ScBattleEnterPush}`, this.ScBattleEnterPush, this);
        Message.on(`${opcode.OpCode.BcBattleSettlePush}`, this.BcBattleSettlePush, this);
        Message.on(`${opcode.OpCode.BcBattlePush}`, this.BcBattlePush, this);
        Message.on(`${opcode.OpCode.BcSyncPush}`, this.BcSyncPush, this);
        Message.on(`${opcode.OpCode.BcBattleReadyPush}`, this.BcBattleReadyPush, this);
        Message.on(`${opcode.OpCode.BcBattlePlayerReadyPush}`, this.BcBattlePlayerReadyPush, this);
        Message.on(`${opcode.OpCode.BcPreAtkPush}`, this.BcPreAtkPush, this);
        Message.on(`${opcode.OpCode.BcAttackPush}`, this.BcAttackPush, this);
    }
    removeEvent() {
        Message.off(GameEvent.GameServerConnected, this.GameServerConnected, this);
        Message.off(GameEvent.GameServerReconnect, this.GameServerReconnect, this);
        Message.off(`${opcode.OpCode.ScMatchPush}`, this.ScMatchPush, this);
        Message.off(`${opcode.OpCode.ScBattleEnterPush}`, this.ScBattleEnterPush, this);
        Message.off(`${opcode.OpCode.BcBattleSettlePush}`, this.BcBattleSettlePush, this);
        Message.off(`${opcode.OpCode.BcBattlePush}`, this.BcBattlePush, this);
        Message.off(`${opcode.OpCode.BcSyncPush}`, this.BcSyncPush, this);
        Message.off(`${opcode.OpCode.BcBattleReadyPush}`, this.BcBattleReadyPush, this);
        Message.off(`${opcode.OpCode.BcBattlePlayerReadyPush}`, this.BcBattlePlayerReadyPush, this);
        Message.off(`${opcode.OpCode.BcPreAtkPush}`, this.BcPreAtkPush, this);
        Message.off(`${opcode.OpCode.BcAttackPush}`, this.BcAttackPush, this);
    }

      
    GameServerConnected() {

        this.dataInit();
    }
      
    GameServerReconnect() {
        this.reset();
    }

    async switchServerUrl() {
        this.isSelectUrl = true;
        netConfig.urlBattle = "";
        if (netConfig.channelid == -1) {
            netConfig.urlBattle = this.battleData.bsUrl;
        } else {
            let bwses = TableUrls.getUrlsByType(core.UrlType.UrlBattle).filter(v => v.bs_id == this.battleData.bsId).map(v => v.url);
            let bmaxWs = await CommonUtil.getMaxSpeedWs(bwses);
            this.isSelectUrl = false;
            if (!!bmaxWs) {
                netConfig.urlBattle = bmaxWs + "/game";
            }
            this.openBattle(!!bmaxWs ? errcode.ErrCode.Ok : errcode.ErrCode.Failed);
        }
    }

    async connect() {
        netChannel.gameCreate();
          
        //     let ip: string = oops.storage.get("httpServerEditBox");
        //     let server = ip.split(':')[1].split('//')[1] + ':38000';
        //     this.battleData.bsUrl = this.battleData.bsUrl.replace('', server)
        // }
        // this.battleData.bsId

        netChannel.gameConnect(this.battleData.bsToken);
    }

    async ScMatchPush(event: string, data: pkgsc.ScMatchPush) {
          
        Logger.table(data, 'ScMatchPush');
        if (data.code == errcode.ErrCode.Ok) {
            this.armies = data.armies;
            this.mapId = data.mapId;
            this.battleData = null;
        }
        this.openBattle(data.code);
    }

    async ScBattleEnterPush(event: string, data: pkgsc.ScBattleEnterPush) {
          
        Logger.table(data, 'ScBattleEnterPush');
        if (data.code == errcode.ErrCode.Ok) {
            this.armies = data.armys;
            this.mapId = data.mapId;
            this.battleType = data.battleType;
            this.battleData = data;
            this.switchServerUrl();
        }
        this.openBattle(data.code);
    }

    openBattle(code: errcode.ErrCode) {
        if (code == errcode.ErrCode.Ok) {
            if (this.isOpen == false) {
                this.isOpen = true;
                oops.gui.open(UIID.BattleUI);
            } else if (this.isLoadRes == false && this.isSelectUrl == false) {
                if (this.battleData) {
                    this.connect();
                }
            }
        } else {
            if (this.isOpen && this.isLoadRes && this.isSelectUrl) {
                this.needClose = true;
            } else {
                tips.alert("net_server_disconnected", () => {
                    oops.gui.remove(UIID.BattleUI, true);   
                })
            }
        }
    }

    BcBattlePlayerReadyPush(event: string, data: pkgbc.BcBattlePlayerReadyPush) {
        this.initFrameRecvDt();
        this.#msgs.push({ eventName: Number(event), data });
    }
    BcBattleReadyPush(event: string, data: pkgbc.BcBattleReadyPush) {
        this.#msgs.push({ eventName: Number(event), data });
    }
    BcBattlePush(event: string, data: pkgbc.BcBattlePush) {
        this.updFrameRecvDt();   
        this.#msgs.push({ eventName: Number(event), data });
    }
    BcSyncPush(event: string, data: pkgbc.BcSyncPush) {
        this.#msgs.push({ eventName: Number(event), data });
    }
    BcBattleSettlePush(event: string, data: pkgbc.BcBattleSettlePush) {
        this.#msgs.push({ eventName: Number(event), data });
    }
    BcPreAtkPush(event: string, data: pkgbc.BcPreAtkPush) {
        this.#msgs.push({ eventName: Number(event), data });
    }
    BcAttackPush(event: string, data: pkgbc.BcAttackPush) {
        this.#msgs.push({ eventName: Number(event), data });
    }

    updateMsg(dt: number) {
        this.setPlayInterval();
        // this.receiveFrameData(this._msgs.shift());


        // if (this._lockMsg > 0) return;
    }
    frameRecvTimeMs: number = 0;
    frameRecvDt: number = 0;
    dLogicDt: number = 0;
    _frameIntervelMS: number = 0;
    _smoothFramePopIntervalFactor: number = 0;
    _smoothFrameSoftLimitCount: number = 0;
    initFrameRecvDt() {
        this.frameRecvTimeMs = 0;
        this.frameRecvDt = 0;
        this.dLogicDt = 0.05;

        this._frameIntervelMS = 30;
          
        this._smoothFramePopIntervalFactor = -1;
          
        this._smoothFrameSoftLimitCount = 5;
    }
    updFrameRecvDt() {
        let nowMs = Date.now();
        if (this.frameRecvTimeMs != 0) {
            this.frameRecvDt = (nowMs - this.frameRecvTimeMs) / 1000;
        }
        this.frameRecvTimeMs = nowMs;
    }

    setPlayInterval() {
        let factor = this.calcSmoothFramePopIntervalFactor();
        if (factor === this._smoothFramePopIntervalFactor) {
            // console.log('equal factor, return');
            return;
        }
        this._smoothFramePopIntervalFactor = factor;
        // console.log('not equal factor:', this._usingSmoothFramePopIntervalFactor);

          
        this.Battle.unschedule(this.frameMsgs);
        this.Battle.schedule(this.frameMsgs, this._frameIntervelMS * factor / 1000);
    }

      
    calcSmoothFramePopIntervalFactor() {
        let framesLen = this.#msgs.length;
        let factor = 1;
        if (framesLen === 0) {
              
            factor = 1.2;
        }
        else if (framesLen === 1) {
            factor = 1.1;
        }
        else if (framesLen <= 3) {
              
            factor = 1;
        }
        else if (framesLen <= 5) {
            factor = 1 / framesLen;
        }
        else {
            factor = 0;
        }

        return factor;
    }
    frameMsgs() {
          
        let self = BattleManger.getInstance();
        if (self.#msgs.length <= 0) {
            return;
        }
        self.Battle.battleUI.msgsLengthLabel.string = `${self.#msgs.length}`;

          
        do {
            self.receiveFrameData(self.#msgs.shift());
        } while (self.#msgs.length > self._smoothFrameSoftLimitCount);

    }
    receiveFrameData(msg: {
        eventName: number;
        data: any;
    }) {
        // let msg = this._msgs.shift();
        if (msg) {
            switch (Number(msg.eventName)) {
                case opcode.OpCode.BcBattleReadyPush:
                    Logger.logNet(msg.eventName);
                    Logger.table(msg.data);
                    this.#BcBattleReadyPush(msg.data)
                    break;
                case opcode.OpCode.BcBattlePlayerReadyPush:
                    Logger.logNet(msg.eventName);
                    Logger.table(msg.data);
                    this.#BcBattlePlayerReadyPush(msg.data)
                    break;
                case opcode.OpCode.BcBattlePush:
                    this.#BcBattlePush(msg.data)
                    break;
                case opcode.OpCode.BcSyncPush:
                    this.#BcSyncPush(msg.data)
                    break;
                case opcode.OpCode.BcBattleSettlePush:
                    Logger.logNet(msg.eventName);
                    Logger.table(msg.data);
                    this.#BcBattleSettlePush(msg.data)
                    break;
                case opcode.OpCode.BcPreAtkPush:
                    this.#BcPreAtkPush(msg.data)
                    break;
                case opcode.OpCode.BcAttackPush:
                    this.#BcAttackPush(msg.data)
                    break;
                default:
                    break;
            }
        }
    }
      
    async placeCard(cardId: number, x: number, y: number) {
        let protoId = TableCards.getInfoById(cardId).proto_id;
        let data = pkgcb.CbAttackReq.create();
        data.cardProtoId = protoId;
        data.x = x;
        data.y = y;
        log("placeCard", data);
        let d = await netChannel.game.reqUnique(opcode.OpCode.CbAttackReq, opcode.OpCode.BcAttackResp, data)
        if (d.code == errcode.ErrCode.Ok) {
            let pos = this.sToCPos(v2(x, y));
            let card = TableCards.getInfoById(cardId);
            FighterManager.getInstance().showBronCostEffect(v3(pos.x, pos.y), card.cost);

            let _d = this.battleData.armys[this.meTeam];
            let _card = _d.cards.find(c => c.protoId == d.nextCardProto);
            let id = TableCards.getInfoByProtoIdAndLv(_card.protoId, _card.level).Id;
            this.Battle.battleCards.updCards(cardId, id);
            // this.Battle.battleCards.updPower(d.food);
        }
        return d.code == errcode.ErrCode.Ok;
    }

      
    oldCbPreAtkReq: pkgcb.ICbPreAtkReq;
    prePlaceCard(cardId: number, x: number, y: number) {
        let protoId = TableCards.getInfoById(cardId).proto_id;
        let data = pkgcb.CbPreAtkReq.create();
        data.cardProtoId = protoId;
        data.x = x;
        data.y = y;
        if (this.oldCbPreAtkReq == data) return;
        this.oldCbPreAtkReq = data;
        log("prePlaceCard", data);
        netChannel.game.reqUnique(opcode.OpCode.CbPreAtkReq, opcode.OpCode.BcPreAtkResp, data, false)
    }

      
    #BcBattleReadyPush(data: pkgbc.BcBattleReadyPush) {
          
        // // this.Battle.battleUI.startCountDown(TableGlobalConfig.cfg.ready_ms);
        // this.Battle.battleInfo.battleStart1Cmp.show(() => {
        //     this.Battle.battleInfo.battleStart2Cmp.show();
        // });

        // this.gameState = core.BattleState.BattleReady;
        // this.changeState();
        // this.updFlighters(data.fighters);
    }
      
    #BcBattlePlayerReadyPush(data: pkgbc.BcBattlePlayerReadyPush) {
        this.oldCbPreAtkReq = null;

        this.battlePlayerReady = data;
        let playerId = PlayerManger.getInstance().playerId;
        let me = data.players.find(p => p.id == playerId);

          
        this.isWatcher = !!!me;
        if (this.isWatcher) {
            me = data.players[core.Team.Blue];
            this.playerEnemy = data.players[core.Team.Red];
            this.meTeam = me?.team ?? core.Team.Blue;
            this.enemyTeam = this.playerEnemy.team ?? core.Team.Red;
            this.isBlue = this.meTeam == core.Team.Blue;
            this.playerMe = me;

            this.Battle.battleWatcherInfo.init();
            for (let index = 0; index < data.players.length; index++) {
                let ply = data.players[index];
                // let bc = ply.team == core.Team.Blue ? this.Battle.battleCards : this.Battle.enemyBattleCards;

                let _cards: number[] = [];
                let _nextCard: number = -1;
                let _d = this.battleData.armys[ply.team];
                for (const protoId of ply.cardsInWindow) {
                    let _card = _d.cards.find(c => c.protoId == protoId);
                    let id = TableCards.getInfoByProtoIdAndLv(_card.protoId, _card.level).Id;
                    _cards.push(id);
                }
                let _card = _d.cards.find(c => c.protoId == ply.nextCardProtoId);
                _nextCard = TableCards.getInfoByProtoIdAndLv(_card.protoId, _card.level).Id;
                this.Battle.battleWatcherInfo.watchCards[ply.team].init(ply.team, _cards, _nextCard);   
                this.Battle.battleWatcherInfo.watchCards[ply.team].updPower(ply.food);
            }

        } else {
            this.playerEnemy = data.players.find(p => p.id != playerId);
            this.meTeam = me?.team ?? core.Team.Blue;
            this.enemyTeam = this.playerEnemy.team ?? core.Team.Red;
            this.isBlue = this.meTeam == core.Team.Blue;
            this.playerMe = me;

            let _cards: number[] = [];
            let _nextCard: number = -1;
            let _d = this.battleData.armys[this.meTeam];
            for (const protoId of data.cardsInWindow) {
                let _card = _d.cards.find(c => c.protoId == protoId);
                let id = TableCards.getInfoByProtoIdAndLv(_card.protoId, _card.level).Id;
                _cards.push(id);
            }
            let _card = _d.cards.find(c => c.protoId == data.nextCardProtoId);
            _nextCard = TableCards.getInfoByProtoIdAndLv(_card.protoId, _card.level).Id;
            this.Battle.battleCards.init(_cards, _nextCard);   
            this.Battle.battleCards.updPower(data.food);
        }


        this.updFlighters(data.fighters)
        this.Battle.battleInfo.battleInfoCmp.init();
        this.Battle.battleInfo.battleInfoCmp.updTime(this.gameTime);

        if (data.result)
            this.Battle.battleInfo.showEnd(data.result);


        if (data.state == core.BattleState.BattlePending) {   
            this.Battle.battleInfo.showStart(TableGlobalConfig.cfg.ready_ms);
        } else if (data.state == core.BattleState.BattleReady) {   
            // this.Battle.battleUI.startCountDown(data.stateRemainMs);
            this.Battle.battleInfo.showStart(data.stateRemainMs);
        } else {
            this.Battle.battleInfo.showStart(0);
            // this.cameraActStart(TableGlobalConfig.cfg.ready_ms); // test
            this.changeGameTime(this.gameTime - data.stateRemainMs, true);
        }
        if (data.state == core.BattleState.BattleFighting) {   
        } else if (data.state == core.BattleState.BattleOverTime) {   
        } else if (data.state == core.BattleState.BattleSettle) {   
        } else if (data.state == core.BattleState.BattleShowTime) {   
        } else if (data.state == core.BattleState.BattleEnd) {   
        }
        this.gameState = data.state;
    }


    changeGameTime(time: number, isInit: boolean = false) {
        this.changePowerState(time, isInit)
        this.changeGameState(time, isInit)
        this.changerTimeState(time, isInit)
    }

      
    changeGameState(time: number, isInit = false) {
        let isChange = false;
        let gameState: core.BattleState = this.gameState;
        if (time < TableGlobalConfig.cfg.fighting_ms) {
            gameState = core.BattleState.BattleFighting;
        } else {
            gameState = core.BattleState.BattleOverTime;
        }
        if (this.gameState != gameState) {
            isChange = true;
              
            this.gameState = gameState;
        }

        if (isChange || isInit) {
            if (gameState == core.BattleState.BattleFighting) {
                if (this.isWatcher) {
                    this.Battle.battleWatcherInfo.show();
                } else {
                    this.Battle.battleCards.show();
                }
                this.Battle.battleInfo.battleStart1Cmp.hide();
            } else if (gameState == core.BattleState.BattleOverTime) {
                if (this.isWatcher) {
                    if (this.Battle.battleWatcherInfo.node.active == false)
                        this.Battle.battleWatcherInfo.show();
                } else {
                    if (this.Battle.battleCards.isHide() == false)
                        this.Battle.battleCards.show();
                }
                this.Battle.battleInfo.battleStart1Cmp.hide();
                this.Battle.battleInfo.battleAlertCmp.show();   
                oops.audio.playMusic(AudioMusicRes.battleOvertime);
            }
        }
    }
    timeState: BattleTimeType = BattleTimeType.NONE;
    changerTimeState(time: number, isInit: boolean = false) {
        let t = (this.gameTime - time) / 1000;
        let isChange = false;
        let timeState = this.timeState;
        if (t <= 30) {
            timeState = BattleTimeType.TIME30;
        } else if (t <= 60) {
            timeState = BattleTimeType.TIME60;
        } else if (t <= 120) {
            timeState = BattleTimeType.TIME120;
        }

        if (this.timeState != timeState) {
            isChange = true;
            this.timeState = timeState;
        }

        if (isChange && isInit == false) {
            this.Battle.battleInfo.battleTimeTipsCmp.show(timeState);
        }
    }

      
    changePowerState(time: number, isInit: boolean = false) {
        let powerState = this.powerState;
        if (time < TableGlobalConfig.cfg.normal_food_ms) {
            powerState = BattlePowerType.NORMAL;
        } else {
            powerState = BattlePowerType.DOUBLE;
        }
        let isChange = false;
        if (this.powerState != powerState) {
            isChange = true;
            this.powerState = powerState;

            if (this.powerState == BattlePowerType.NORMAL) {
                oops.audio.playMusic(AudioMusicRes.battleSingle);
            } else if (this.powerState == BattlePowerType.DOUBLE) {
                oops.audio.playMusic(AudioMusicRes.battleDouble);
            }
        }

        if (isInit == false) {
            if (isChange && powerState == BattlePowerType.DOUBLE) {   
                this.Battle.battleInfo.battleDoubleFoodCmp.show();   
            }
        }

        // if (isChange)
        //     this.Battle.battleCards.changeState();
    }

    #BcBattlePush(data: pkgbc.BcBattlePush) {
        let time = this.gameTime - data.remainMs;   
        this.Battle.battleInfo.battleInfoCmp.updTime(data.remainMs);

        if (this.isWatcher) {
            this.Battle.battleWatcherInfo.watchCards[core.Team.Red].updPower(data.foodInfoForWatcher[core.Team.Red]);
            this.Battle.battleWatcherInfo.watchCards[core.Team.Blue].updPower(data.foodInfoForWatcher[core.Team.Blue]);
        } else {
            this.Battle.battleCards.updPower(data.foodInfo);
        }

        this.changeGameTime(time);

        this.updFlighters(data.fighters, data.delayEffects);
        this.updSkills(data.delayEffects);
        for (const id of data.canceledEffects ?? []) {
            BattleSkillManager.getInstance().deleteSkill(id);
        }

        // data.delayEffects[0].skId
        // data.fighters[0].skills[0].id

        // for (let index = 0; index < data.fighters.length; index++) {
        //     for (const skill of data.fighters[index].skills) {
        //         let id = skill.id;
        //         for (const prop of skill.props) {
          
          
          
          
          
          
          

          
          
          
          
          
          
        //             }
        //         }
        //     }
        // }
    }

    #BcPreAtkPush(data: pkgbc.IBcPreAtkPush) {
        if (this.isWatcher == false) return;

        let team = core.Team.Blue;
        if (data.playerId == this.playerMe.id) {
            team = this.playerMe.team;
        } else if (data.playerId == this.playerEnemy.id) {
            team = this.playerEnemy.team;
        }

        let _d = this.battleData.armys[team];
        let _card = _d.cards.find(c => c.protoId == data.cardProto);
        let cardId = TableCards.getInfoByProtoIdAndLv(_card.protoId, _card.level).Id;
        if (data.x == -1 && data.x == -1) {
            this.Battle.battleWatcherInfo.watchCards[team].prePlaceCard(cardId, null);
        } else {
            let pos = this.sToCPosWatcher(v2(data.x, data.y));
            this.Battle.battleWatcherInfo.watchCards[team].prePlaceCard(cardId, pos);
        }

    }

    #BcAttackPush(data: pkgbc.BcAttackPush) {
        if (this.isWatcher == false) return;

        let team = core.Team.Blue;
        if (data.playerId == this.playerMe.id) {
            team = this.playerMe.team;
        } else if (data.playerId == this.playerEnemy.id) {
            team = this.playerEnemy.team;
        }

        let pos = this.sToCPosWatcher(v2(data.y, data.y));

        let card = TableCards.getInfoByProtoIdAndLv(data.costCardProto, 1);
        FighterManager.getInstance().showBronCostEffect(v3(pos.x, pos.y), card.cost);

        let _d = this.battleData.armys[team];
        let _card = _d.cards.find(c => c.protoId == data.costCardProto);
        let cardId = TableCards.getInfoByProtoIdAndLv(_card.protoId, _card.level).Id;
        let _nextCard = _d.cards.find(c => c.protoId == data.nextCardProto);
        let nextCardId = TableCards.getInfoByProtoIdAndLv(_nextCard.protoId, _nextCard.level).Id;
        this.Battle.battleWatcherInfo.watchCards[team].placeCard(cardId, nextCardId, data.food);
    }

    #BcSyncPush(data: pkgbc.BcSyncPush) {
        log('BcSyncPush', data)
        netChannel.gameClose();
        oops.gui.remove(UIID.BattleUI, true);
    }
    #BcBattleSettlePush(data: pkgbc.BcBattleSettlePush) {
        // let towerNum1 = 0;
        // let towerNum2 = 0;
        // for (const tower of data.result.towers) {
        //     let t = this.flighterGameObjcets[tower.id].props.GetValue(core.PropType.PropTypeTeam).i32;
        //     if (t == core.Team.Blue) {
        //         towerNum1++;
        //     } else {
        //         towerNum2++;
        //     }
        // }
        let gameState = this.gameState;
        if (data.result.towers.length > 0) {
            gameState = core.BattleState.BattleSettle;   
        } else {
            gameState = core.BattleState.BattleShowTime;   
        }

        let cb = () => {
            this.Battle.battleInfo.battleAlertCmp.hide();
            this.Battle.battleInfo.showEnd(data.result);
        }
        if (gameState == core.BattleState.BattleSettle) {
            this.Battle.battleInfo.battleMathcTipsCmp.showFinal();   
            FighterManager.getInstance().autoBattleEnd(cb, data.result.winner);
        } else {
            this.Battle.battleInfo.battleMathcTipsCmp.showOver();   
            cb();
        }
        // this.changeGameTime(this.gameTime, false, true);
        this.gameState = gameState;
    }

    updFlighters(fighters: core.IFighter[], skills: core.IDelayEffect[] = []) {
        let fGos: FlighterGameObjcet[] = [];
        for (const f of fighters ?? []) {
            let isCreate = false;
            let oldGo: FlighterGameObjcet
            if (this.flighterGameObjcets[f.id]) {
                let fighter = this.flighterGameObjcets[f.id].fighter;
                let buffer = core.Fighter.encode(fighter).finish();
                let old = core.Fighter.decode(new Uint8Array(buffer))

                oldGo = new FlighterGameObjcet(old);
            } else {
                isCreate = true;
            }
            this.updFlighter(f);
            let newGo = this.flighterGameObjcets[f.id]
            let casterSkills = skills.filter(s => s.casterId == f.id);
            let targetSkills = skills.filter(s => s.targetId == f.id);
            FighterManager.getInstance().updFlighter(oldGo, newGo, f, casterSkills, targetSkills);
            if (isCreate)
                fGos.push(newGo);
        }

        FighterManager.getInstance().calcBornTime(fGos);
    }

    updFlighter(f: core.IFighter) {
        if (this.flighterGameObjcets[f.id]) {
            this.flighterGameObjcets[f.id].updFighter(f);
        } else {
            this.flighterGameObjcets[f.id] = new FlighterGameObjcet(f);
        }
    }

    updSkills(effects: core.IDelayEffect[]) {
        for (const effect of effects) {
            this.updSkill(effect);
        }
    }
    updSkill(effect: core.IDelayEffect) {
        if (this.skills[effect.id]) {
            Logger.erroring("" + effect.skId);
        } else {
            BattleSkillManager.getInstance().createSkill(effect)
        }
    }

    initAddToPool(poolEnum: PoolEnum, resName: string, prefab: Node, count: number) {
        for (let index = 0; index < count; index++) {
            let pool = this.nodePools[poolEnum + resName];
            if (!pool) pool = new NodePool(poolEnum + resName);
            this.nodePools[poolEnum + resName] = pool;
            pool.put(instantiate(prefab));
        }
    }

    initFlighterPool() {
        let prefab = this.battlePrefabs[BattlePrefabs.Flighter];
        if (!prefab) return;
        for (let index = 0; index < 20; index++) {
            let pool = this.nodePools[PoolEnum.Flighter];
            if (!pool) pool = new NodePool(PoolEnum.Flighter.toString());
            this.nodePools[PoolEnum.Flighter] = pool;
            pool.put(instantiate(prefab));
        }
    }

    getFlighterByPool() {
        let node = this.nodePools[PoolEnum.Flighter].get();
        if (!node) node = instantiate(this.battlePrefabs[BattlePrefabs.Flighter]);
        return node;
    }

    putFlighterByPool(node: Node) {
        this.nodePools[PoolEnum.Flighter].put(node);
    }

    getRoleByPool(heroInfo: HeroCfg) {
        let resName = heroInfo.res_name;
        if (heroInfo.type == core.UnitType.UnitBomb) {   
            return instantiate(this.rolePrefabs[resName]);
        } else {
            let node = this.nodePools[PoolEnum.Role + resName].get();
            if (!node) node = instantiate(this.rolePrefabs[resName]);
            return node;
        }
    }

    putRoleByPool(heroInfo: HeroCfg, node: Node) {
        let resName = heroInfo.res_name;
        if (heroInfo.type == core.UnitType.UnitBomb) {   
            node.destroy();
        } else {
            this.nodePools[PoolEnum.Role + resName].put(node);
        }
    }

    poolSkill = ['magic_frozen']   
    getSkillByPool(skillInfo: SkillCfg) {
        let resName = skillInfo.res_name;
        if (this.poolSkill.findIndex(v => resName == v) != -1) {
            let node = this.nodePools[PoolEnum.Skill + resName].get();
            if (!node) node = instantiate(this.skillPrefabs[resName]);
            return node;
        } else {
            return instantiate(this.skillPrefabs[resName]);
        }
    }

    putSkillByPool(skillInfo: SkillCfg, node: Node) {
        let resName = skillInfo.res_name;
        if (this.poolSkill.findIndex(v => resName == v) != -1) {
            this.nodePools[PoolEnum.Skill + resName].put(node);
        } else {
            node.destroy();
        }
    }

    calcScore(args: BattleTowerType) {
        let score = 0;
        if (args.centerTower == 0) {
            score += 2;
        }
        if (args.rightTower == 0) {
            score++;
        }
        if (args.leftTower == 0) {
            score++;
        }
        score = score > 3 ? 3 : score;
        return score;
    }

    sToCPos(pos: Vec2) {
        let map = this.BattleMap;
        let _pos = v2(pos.x / this.mapSizeRatio, pos.y / this.mapSizeRatio);
        let __pos = v2(_pos.x * map.tiledSize.width, map.mapSize.height - _pos.y * map.tiledSize.height);

        if (this.isBlue == false) {   
            __pos.x = map.mapSize.width - __pos.x;
            __pos.y = map.mapSize.height - __pos.y;
        }
        return __pos;
    }

      
    cToSPos(pos: Vec2) {
        let map = this.BattleMap;
        if (this.isBlue == false) {   
            pos.x = map.mapSize.width - pos.x;
            pos.y = map.mapSize.height - pos.y;
        }
        let _pos = v2(pos.x / map.tiledSize.width, (map.mapSize.height - pos.y) / map.tiledSize.height);
        _pos.x -= 0.5;
        _pos.y -= 0.5;
        let __pos = v2(Math.round(_pos.x * this.mapSizeRatio), Math.round(_pos.y * this.mapSizeRatio));
        return __pos;
    }

      
    sToCPosWatcher(pos: Vec2) {
        let map = this.BattleMap;
        let _pos = v2(pos.x / this.mapSizeRatio, pos.y / this.mapSizeRatio);
        let __pos = v2(_pos.x * map.tiledSize.width, map.mapSize.height - _pos.y * map.tiledSize.height);
        return __pos;
    }

    mapSizeRatio = 32;
}