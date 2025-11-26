
/*
 * @Author: dgflash
 * @Date: 2021-11-18 17:47:56
 * @LastEditors: dgflash
 * @LastEditTime: 2022-04-25 12:02:10
 */
import { Node, Vec3 } from "cc";
import { ecs } from "../../core/libs/ecs/ECS";
import { ViewUtil } from "../../core/utils/ViewUtil";
import { MoveToComp } from "../common/ecs/position/MoveTo";
import { RoleChangeJobComp, RoleChangeJobSystem } from "./bll/RoleChangeJob";
import { RoleUpgradeComp, RoleUpgradeSystem } from "./bll/RoleUpgrade";
import { RoleAnimatorType } from "./model/RoleEnum";
import { RoleModelBaseComp } from "./model/RoleModelBaseComp";
import { RoleModelComp } from "./model/RoleModelComp";
import { RoleModelJobComp } from "./model/RoleModelJobComp";
import { RoleModelLevelComp } from "./model/RoleModelLevelComp";
import { RoleViewComp } from "./view/RoleViewComp";
import { RoleViewInfoComp } from "./view/RoleViewInfoComp";

/** 
   
   
  
  
  
  
  
 */
export class Role extends ecs.Entity {
      
    RoleModel!: RoleModelComp;
    RoleModelBase!: RoleModelBaseComp;            
    RoleModelJob!: RoleModelJobComp;
    RoleModelLevel!: RoleModelLevelComp;

      
    RoleChangeJob!: RoleChangeJobComp;            
    RoleUpgrade!: RoleUpgradeComp;                
    RoleMoveTo!: MoveToComp;                      

      
    RoleView!: RoleViewComp;                      
    RoleViewInfo!: RoleViewInfoComp;              

    protected init() {
          
        this.addComponents<ecs.Comp>(
            RoleModelComp,
            RoleModelBaseComp,
            RoleModelJobComp,
            RoleModelLevelComp);
    }

      
    changeJob(jobId: number) {
        var rcj = this.add(RoleChangeJobComp);
        rcj.jobId = jobId;
    }

      
    upgrade(lv: number = 0) {
        var ru = this.add(RoleUpgradeComp);
        ru.lv = lv;
    }

      
    move(target: Vec3) {
        var move = this.get(MoveToComp) || this.add(MoveToComp);
        move.target = target;
        move.node = this.RoleView.node;
        move.speed = 100;
    }

    destroy(): void {
          
        this.remove(RoleViewComp);
        super.destroy();
    }

      
    load(parent: Node, pos: Vec3 = Vec3.ZERO) {
        var node = ViewUtil.createPrefabNode("game/battle/role");
        var mv = node.getComponent(RoleViewComp)!;
        this.add(mv);

        node.parent = parent;
        node.setPosition(pos);
    }

      
    attack() {
        this.RoleView.animator.setTrigger(RoleAnimatorType.Attack);
    }
}

export class EcsRoleSystem extends ecs.System {
    constructor() {
        super();

        this.add(new RoleChangeJobSystem());
        this.add(new RoleUpgradeSystem());
    }
}