/*
 * @Author: dgflash
 * @Date: 2021-11-18 15:56:01
 * @LastEditors: dgflash
 * @LastEditTime: 2022-03-10 10:23:41
 */

import { ecs } from "../../../core/libs/ecs/ECS";
import { VM } from "../../../core/libs/model-view/ViewModel";
import { RoleAttributeType } from "./RoleEnum";
import { RoleModelComp } from "./RoleModelComp";

/**
   
 * 
   
  
  
 * 
   
  
  
 */
@ecs.register('RoleModelBase')
export class RoleModelBaseComp extends ecs.Comp {
      
    private vm: any = {};

      
    private _power: number = 0;
    public get power(): number {
        return this._power;
    }
    public set power(value: number) {
        this._power = value;
        this.ent.get(RoleModelComp).attributes.get(RoleAttributeType.power).base = value;
        this.vm[RoleAttributeType.power] = value;
    }

      
    private _physical: number = 0;
    public get physical(): number {
        return this._physical;
    }
    public set physical(value: number) {
        this._physical = value;
        this.ent.get(RoleModelComp).attributes.get(RoleAttributeType.physical).base = value;
        this.vm[RoleAttributeType.physical] = value;
    }

      
    private _agile: number = 0;
    public get agile(): number {
        return this._agile;
    }
    public set agile(value: number) {
        this._agile = value;
        this.ent.get(RoleModelComp).attributes.get(RoleAttributeType.agile).base = value;
        this.vm[RoleAttributeType.agile] = value;
    }

    vmAdd() {
        VM.add(this.vm, "RoleBase");
    }

    vmRemove() {
        VM.remove("RoleBase");
    }

    reset() {
        this.vmRemove();

        for (var key in this.vm) {
            this.vm[key] = 0;
        }
    }
}