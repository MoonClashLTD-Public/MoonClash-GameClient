import { ecs } from "../../../core/libs/ecs/ECS";
import { RoleAttributeType } from "../model/RoleEnum";
import { RoleModelLevelComp } from "../model/RoleModelLevelComp";
import { Role } from "../Role";

/**
   
 */
@ecs.register('RoleUpgrade')
export class RoleUpgradeComp extends ecs.Comp {
      
    lv: number = 0;

    reset() {
        this.lv = 0;
    }
}

export class RoleUpgradeSystem extends ecs.ComblockSystem implements ecs.IEntityEnterSystem {
    filter(): ecs.IMatcher {
        return ecs.allOf(RoleUpgradeComp, RoleModelLevelComp);
    }

    entityEnter(e: Role): void {
        let rm = e.RoleModel;
        let rlm = e.RoleModelLevel;
        let ru = e.RoleUpgrade;

        if (ru.lv == 0)
            rlm.vm.lv++;                     
        else
            rlm.vm.lv = ru.lv;               

          
        rlm.rtluCurrent.init(rlm.vm.lv);
          
        rm.attributes.get(RoleAttributeType.hp).level = rlm.rtluCurrent.hp;

          
        rlm.rtluNext.init(rlm.vm.lv + 1);
        rlm.vm.expNext = rlm.rtluNext.needexp;

        e.remove(RoleUpgradeComp);
    }
}