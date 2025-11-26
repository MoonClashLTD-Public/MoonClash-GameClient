/*
 * @Author: dgflash
 * @Date: 2021-11-11 17:45:23
 * @LastEditors: dgflash
 * @LastEditTime: 2022-02-24 16:47:45
 */
import { Node, Prefab, error, instantiate, resources, sys } from "cc";
import { resLoader } from "../../core/common/loader/ResLoader";
import { AsyncQueue, NextFunction } from "../../core/common/queue/AsyncQueue";
import { ecs } from "../../core/libs/ecs/ECS";
import { UICallbacks } from "../../core/gui/layer/Defines";
import { oops } from "../../core/Oops";
import { config } from "../common/config/Config";
import { UIConfigData, UIID } from "../common/config/GameUIConfig";
import { LoadingViewComp } from "./view/LoadingViewComp";
import { Languages } from "../../core/gui/language/LanguageData";
import { STORAGE_ENUM } from "../homeUI/HomeEvent";

/**
   
  
  
 */
export class Initialize extends ecs.Entity {
    LoadingView!: LoadingViewComp;

    protected init() {
        var queue: AsyncQueue = new AsyncQueue();

          
        this.loadCustom(queue);
          
        this.loadLanguage(queue);
          
        this.loadCommon(queue);
          
        this.onComplete(queue);

        queue.play();
    }


      
    private loadCustom(queue: AsyncQueue) {
        queue.push(async (next: NextFunction, params: any, args: any) => {
              
            // if (config.query.channelId) SDKPlatform.setChannelId(config.query.channelId);

              
            resLoader.load("language/font/" + oops.language.current, next);
        });
    }

      
    private loadLanguage(queue: AsyncQueue) {
        queue.push((next: NextFunction, params: any, args: any) => {
              
            let lan = oops.storage.get(STORAGE_ENUM.language);
            if (lan == null) {
                // lan = SDKPlatform.getLanguage();
                switch (sys.language) {
                    case sys.Language.ENGLISH:
                        lan = Languages.EN;
                        break;
                    case sys.Language.KOREAN:
                        lan = Languages.KO;
                        break;
                    case sys.Language.CHINESE:
                        lan = Languages.ZH;
                        break;
                    default:
                        lan = Languages.EN;
                        break;
                }
                oops.storage.set(STORAGE_ENUM.language, lan!);
            }

              
            oops.language.setAssetsPath(config.game.languagePathJson, config.game.languagePathTexture);

              
            oops.language.setLanguage(lan!, next);
        });
    }

      
    private loadCommon(queue: AsyncQueue) {
        queue.push((next: NextFunction, params: any, args: any) => {
            resLoader.loadDir("common", next);
        });
    }

      
    private async onComplete(queue: AsyncQueue) {
        queue.complete = async () => {
            oops.gui.open(UIID.FgMask);   
            let viewParams = UIConfigData[UIID.FgMask];
            resLoader.load(resources.name, viewParams.prefab, (err: Error | null, res: Prefab) => {
                if (err) {
                    error(err);
                    return
                }
                let childNode: Node = instantiate(res);
                oops.gui.guide.addChild(childNode);
            });
            var node = await oops.gui.openAsync(UIID.Loading);
            if (node) this.add(node.getComponent(LoadingViewComp) as ecs.Comp);
        };
    }
}