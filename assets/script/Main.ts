/*
 * @Author: dgflash
 * @Date: 2021-07-03 16:13:17
 * @LastEditors: dgflash
 * @LastEditTime: 2022-04-25 14:44:17
 */
import { dynamicAtlasManager, game, macro, setDisplayStats, sys, _decorator } from 'cc';
import { DEBUG } from 'cc/env';
import { ecs } from './core/libs/ecs/ECS';
import { CommonUtil } from './core/utils/CommonUtil';
import { CommonEnter } from './game/common/ecs/CommonEnter';
import { smc } from './game/common/ecs/SingletonModuleComp';
import { Initialize } from './game/initialize/Initialize';

const { ccclass, property } = _decorator;

macro.CLEANUP_IMAGE_CACHE = false;
dynamicAtlasManager.enabled = true;
dynamicAtlasManager.maxFrameSize = 512;

@ccclass('Main')
export class Main extends CommonEnter {
    start() {
        if (DEBUG) setDisplayStats(true);
    }

    protected async run() {
        smc.initialize = ecs.getEntity<Initialize>(Initialize);
    }
}
