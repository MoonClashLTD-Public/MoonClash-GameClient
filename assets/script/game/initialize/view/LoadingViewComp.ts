/*
 * @Author: dgflash
 * @Date: 2021-07-03 16:13:17
 * @LastEditors: dgflash
 * @LastEditTime: 2022-05-09 18:34:16
 */
import { sys, tween, warn, _decorator } from "cc";
import { DEV } from "cc/env";
// import { type } from "os";
import { Message } from "../../../core/common/event/MessageManager";
import { resLoader } from "../../../core/common/loader/ResLoader";
import { ecs } from "../../../core/libs/ecs/ECS";
import { oops } from "../../../core/Oops";
import { CommonUtil } from "../../../core/utils/CommonUtil";
import { JsonUtil } from "../../../core/utils/JsonUtil";
import { GameEvent } from "../../common/config/GameEvent";
import { UIID } from "../../common/config/GameUIConfig";
import { CCVMParentComp } from "../../common/ecs/CCVMParentComp";
import TableAttrPool from "../../common/table/TableAttrPool";
import TableAttrs from "../../common/table/TableAttrs";
import TableBattle from "../../common/table/TableBattle";
import TableBattlePowerSettlement from "../../common/table/TableBattlePowerSettlement";
import TableBlindBox from "../../common/table/TableBlindBox";
import TableBornAddrs from "../../common/table/TableBornAddrs";
import TableCards from "../../common/table/TableCards";
import TableEquip from "../../common/table/TableEquip";
import TableEquipAttr from "../../common/table/TableEquipAttr";
import TableEquipBurn from "../../common/table/TableEquipBurn";
import TableEquipCompose from "../../common/table/TableEquipCompose";
import TableEquipRaity from "../../common/table/TableEquipRaity";
import TableEquipRepairCost from "../../common/table/TableEquipRepairCost";
import TableFighterAi from "../../common/table/TableFighterAi";
import TableGlobalConfig from "../../common/table/TableGlobalConfig";
import TableGoldBoxContent from "../../common/table/TableGoldBoxContent";
import TableHeroes from "../../common/table/TableHeroes";
import TableJobs from "../../common/table/TableJobs";
import TableLanguags from "../../common/table/TableLanguags";
import TableMaps from "../../common/table/TableMaps";
import TableMaterialBoxContent from "../../common/table/TableMaterialBoxContent";
import TableNfts from "../../common/table/TableNfts";
import TablePve from "../../common/table/TablePve";
import TablePvePowerDelta from "../../common/table/TablePvePowerDelta";
import TableSkill from "../../common/table/TableSkill";
import TableSkillEffect from "../../common/table/TableSkillEffect";
import TableSkillEffectCall from "../../common/table/TableSkillEffectCall";
import TableSpBoxContent from "../../common/table/TableSpBoxContent";
import TableSummonOffset from "../../common/table/TableSummonOffset";
import TableTower from "../../common/table/TableTower";
import TableUrls from "../../common/table/TableUrls";
import { HotUpdate } from "./HotUpdate";
// import { TableRoleJob } from "../../common/table/TableRoleJob";
// import { TableRoleLevelUp } from "../../common/table/TableRoleLevelUp";

const { ccclass, property } = _decorator;

  
@ccclass('LoadingViewComp')
@ecs.register('LoadingView', false)
export class LoadingViewComp extends CCVMParentComp {
      
    data = {
          
        finished: 0,
          
        total: 0,
          
        progress: "0",
          
        prompt: "",
          
        ver: "",
    };

    private progress: number = 0;
    @property(HotUpdate)
    hotUpdate: HotUpdate = null;
    reset(): void {
          
        this.data.prompt = oops.language.getLangByID("loading_load_player");

          
        oops.gui.remove(UIID.Loading);

          
        resLoader.releaseDir("loading");

          
        // oops.gui.open(UIID.Demo);
        // oops.gui.open(UIID.BattleUI);
        oops.gui.open(UIID.LoginUI);
    }

    async start() {
        await this.loadCustom();
        if (sys.isNative) {
            this.hotUpdate?.startHotUpdate();
        } else {
            this.enter();
        }
    }

    enter() {
        this.addEvent();
        this.loadRes();
    }

    private addEvent() {
        this.on(GameEvent.LoginSuccess, this.onHandler, this);
    }

    private onHandler(event: string, args: any) {
        switch (event) {
            case GameEvent.LoginSuccess:
                  
                this.ent.remove(LoadingViewComp);
                break;
        }
    }

      
    private async loadRes() {
        this.data.progress = `${0}`;
        this.loadGameRes();
    }

      
    private async loadCustom() {
          
        this.data.prompt = oops.language.getLangByID("loading_load_json");

        let cfgs = [
            TableAttrPool,
            TableBlindBox,
            TableMaterialBoxContent,
            TableSpBoxContent,
            TableGoldBoxContent,
            TableCards,
            TableGlobalConfig,
            TableBattle,
            TableHeroes,
            TableMaps,
            TableSkill,
            TableSkillEffect,
            TableSkillEffectCall,
            TableTower,
            TableBornAddrs,
            TableJobs,
            TableNfts,
            TableAttrs,
            TableSummonOffset,
            TableFighterAi,
            TableEquip,
            TableEquipRaity,
            TableEquipAttr,
            TableEquipRepairCost,
            TableEquipBurn,
            TableEquipCompose,
            TablePve,
            TableUrls,
            TableBattlePowerSettlement,
            TablePvePowerDelta

        ];
        let isTestUrl = sys.isBrowser && !DEV;
        if (isTestUrl) {
             
        }
        let promises: Promise<unknown>[] = []
        cfgs.forEach(e => promises.push(JsonUtil.loadAsync(e.TableName, isTestUrl)));
        TableLanguags.TableNames.forEach(e => promises.push(JsonUtil.loadAsync(e, isTestUrl)));
        await Promise.all(promises);   
        for (const cfg of cfgs) {
            cfg.init();   
        }
    }

      
    private loadGameRes() {
          
        this.data.prompt = oops.language.getLangByID("loading_load_game");

        resLoader.loadDir("gameRes", this.onProgressCallback.bind(this), this.onCompleteCallback.bind(this));

        tween(this)
            .to(1, {}, {
                onStart(target: LoadingViewComp) {
                    target.virtualProgress = 0;
                },
                onUpdate(target: LoadingViewComp, ratio: number) {
                    target.virtualProgress = ratio;
                    if (target.isLoadGameResFinish && ratio > 0.5) {
                        this.finished = ratio * this.total;
                        target.updProgressInfo();
                    }
                },
                onComplete(target: LoadingViewComp) {
                    target.isVirtualProgressFinish = true;
                    if (target.isLoadGameResFinish) {
                        this.finished = this.total;
                    }
                    target.updProgressInfo();
                    target.onAllFinish();
                },
            })
            .start();
    }
    isLoadGameResFinish = false;
    isVirtualProgressFinish = false;
    virtualProgress = 0;
    _finished = 0;
    _total = 0;
      
    private onProgressCallback(finished: number, total: number, item: any) {
        this._finished = finished;
        this._total = total;
        this.updProgressInfo();
    }

    updProgressInfo() {
        let finished = this._finished / 2 + (this._finished / 2 * this.virtualProgress);
        let total = this._total;
        this.data.finished = finished;
        this.data.total = total;

        var progress = finished / total;
        if (progress > this.progress) {
            this.progress = progress;
            this.data.progress = (progress * 100).toFixed(2);
        }
    }

      
    private onCompleteCallback() {
        this.isLoadGameResFinish = true;
        this.onAllFinish();
    }

    private onAllFinish() {
        if (this.isLoadGameResFinish && this.isVirtualProgressFinish) {
              
            // smc.account = ecs.getEntity<Account>(Account);
            // smc.account.connect();
            CommonUtil.waitCmpt(this, 0).then(() => {
                Message.dispatchEvent(GameEvent.LoginSuccess);
            })
        }
    }
}