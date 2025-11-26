/*
 * @Author: dgflash
 * @Date: 2021-11-18 15:56:01
 * @LastEditors: dgflash
 * @LastEditTime: 2022-03-10 11:38:31
 */

import { ecs } from "../../../core/libs/ecs/ECS";
import { VM } from "../../../core/libs/model-view/ViewModel";
// import { TableRoleLevelUp } from "../../common/table/TableRoleLevelUp";

/**
   
 * 
   
  
 * 
   
  
  
 */
@ecs.register('RoleModelLevel')
export class RoleModelLevelComp extends ecs.Comp {
      
    // rtluNext: TableRoleLevelUp = new TableRoleLevelUp();
      
    // rtluCurrent: TableRoleLevelUp = new TableRoleLevelUp();

      
    vm: RoleLevelVM = new RoleLevelVM();

    vmAdd() {
        VM.add(this.vm, "RoleLevel");
    }

    vmRemove() {
        this.vm.reset();
        VM.remove("RoleLevel");
    }

    reset() {
        this.vmRemove();
    }
}

class RoleLevelVM {
      
    lv: number = 0;
      
    exp: number = 0;
      
    expNext: number = 0;

    reset() {
        this.lv = 0;
        this.exp = 0;
        this.expNext = 0;
    }
}