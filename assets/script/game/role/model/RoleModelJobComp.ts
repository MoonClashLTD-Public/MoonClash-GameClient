/*
 * @Author: dgflash
 * @Date: 2021-11-24 10:04:56
 * @LastEditors: dgflash
 * @LastEditTime: 2022-01-29 10:56:57
 */
import { ecs } from "../../../core/libs/ecs/ECS";
// import { TableRoleJob } from "../../common/table/TableRoleJob";
import { RoleAttributeType } from "./RoleEnum";
import { RoleModelComp } from "./RoleModelComp";

/** 
   
 * 
   
  
  
 */
@ecs.register('RoleModelJob')
export class RoleModelJobComp extends ecs.Comp {
    // private table: TableRoleJob = new TableRoleJob();

      
    private _id: number = -1;
    get id(): number {
        return this._id;
    }
    set id(value: number) {
        // this.table.init(value);
        this._id = value;

        var attributes = this.ent.get(RoleModelComp).attributes;
        attributes.get(RoleAttributeType.power).job = this.power;
        attributes.get(RoleAttributeType.agile).job = this.agile;
    }
      
    get armsName(): string {
        // return this.table.armsName;
        return ''
    }
      
    get power(): number {
        // return this.table.power;
        return 0;
    }
      
    get agile(): number {
        // return this.table.agile;
        return 0;
    }
      
    get weaponType(): number[] {
        // return this.table.weaponType;
        return [];
    }

    reset() {
        this._id = -1;
    }
}