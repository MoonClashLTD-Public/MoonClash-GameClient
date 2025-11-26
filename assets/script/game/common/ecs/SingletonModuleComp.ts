/*
 * @Author: dgflash
 * @Date: 2021-11-18 14:20:46
 * @LastEditors: dgflash
 * @LastEditTime: 2022-03-15 10:36:13
 */

import { ecs } from "../../../core/libs/ecs/ECS";
import { Account } from "../../account/Account";
import { Initialize } from "../../initialize/Initialize";

  
@ecs.register('SingletonModule')
export class SingletonModuleComp extends ecs.Comp {
      
    initialize: Initialize = null!;
      
    account: Account = null!;

    reset() { }
}

export var smc: SingletonModuleComp = ecs.getSingleton(SingletonModuleComp);