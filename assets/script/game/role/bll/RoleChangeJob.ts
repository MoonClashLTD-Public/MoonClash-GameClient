/*
 * @Author: dgflash
 * @Date: 2022-01-25 17:49:26
 * @LastEditors: dgflash
 * @LastEditTime: 2022-04-15 09:37:39
 */

import { Message } from "../../../core/common/event/MessageManager";
import { ecs } from "../../../core/libs/ecs/ECS";
import { RoleModelJobComp } from "../model/RoleModelJobComp";
import { Role } from "../Role";
import { RoleEvent } from "../RoleEvent";

/**
   
 * 
   
  
  
  
 * 
   
  
  
 */
@ecs.register('RoleChangeJob')
export class RoleChangeJobComp extends ecs.Comp {
      
    jobId: number = -1;

    reset() {
        this.jobId = -1;
    }
}

export class RoleChangeJobSystem extends ecs.ComblockSystem implements ecs.IEntityEnterSystem {
    filter(): ecs.IMatcher {
        return ecs.allOf(RoleChangeJobComp, RoleModelJobComp);
    }

    entityEnter(e: Role): void {
          
        e.RoleModelJob.id = e.RoleChangeJob.jobId;

          
        Message.dispatchEvent(RoleEvent.ChangeJob);

        e.remove(RoleChangeJobComp);
    }
}