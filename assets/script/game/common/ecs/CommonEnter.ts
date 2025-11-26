/*
 * @Author: dgflash
 * @Date: 2021-07-03 16:13:17
 * @LastEditors: dgflash
 * @LastEditTime: 2022-05-10 11:36:35
 */
import { ECSRootSystem } from '../../../core/libs/ecs/ECSSystem';
import { oops } from '../../../core/Oops';
import { Root } from '../../../core/Root';
import { config } from '../config/Config';
import { CommonSystem } from './CommonSystem';

  
export class CommonEnter extends Root {
    onLoad() {
        super.onLoad();

        oops.ecs = new ECSRootSystem();
        oops.ecs.add(new CommonSystem())
        oops.ecs.init();

          
        config.init(this.run.bind(this));
    }

      
    protected run() {

    }

    update(dt: number) {
        oops.ecs.execute(dt);
    }
}