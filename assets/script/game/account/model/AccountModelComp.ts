

/*
 * @Author: dgflash
 * @Date: 2021-11-12 10:02:31
 * @LastEditors: dgflash
 * @LastEditTime: 2022-01-27 11:07:05
 */

import { ecs } from "../../../core/libs/ecs/ECS";
import { Role } from "../../role/Role";

/** 
   
 */
@ecs.register('AccountModel')
export class AccountModelComp extends ecs.Comp {
      
    currency: any = {};
      
    role: Role = null!;

    reset() {

    }
}