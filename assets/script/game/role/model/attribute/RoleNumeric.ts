/*
 * @Author: dgflash
 * @Date: 2022-01-20 18:20:32
 * @LastEditors: dgflash
 * @LastEditTime: 2022-02-09 13:11:39
 */

import { RoleAttributeType } from "../RoleEnum";
import { RoleNumericMap } from "./RoleNumericMap";

  
export enum RoleModuleType {
      
    Base,
      
    Job,
      
    Level,
      
    Equip,
      
    Decorator,
      
    Skill
}

/** 
   
  
  
 */
export class RoleNumeric {
      
    onUpdate: Function = null!

      
    type: RoleAttributeType = null!;

      
    value: number = 0;

      
    protected attributes: RoleNumericMap;
      
    protected values: Map<RoleModuleType, number> = new Map();

    constructor(type: RoleAttributeType, attributes: RoleNumericMap) {
        this.type = type;
        this.attributes = attributes;

          
        var rmt = RoleModuleType;
        for (var key in rmt) {
            var k = Number(key);
            if (k > -1) this.values.set(k, 0);
        }
    }

      
    protected getValue(module: RoleModuleType) {
        return this.values.get(module);
    }

      
    protected setValue(module: RoleModuleType, value: number) {
        this.values.set(module, value);
        this.update();
    }

    protected update() {
        var result = 0;
        this.values.forEach(value => {
            result += value;
        });
        this.value = result;

        this.onUpdate && this.onUpdate(this);
    }

    reset() {
        this.values.clear();
        this.update();
    }

      
    get base(): number {
        return this.getValue(RoleModuleType.Base)!;
    }
    set base(value: number) {
        this.setValue(RoleModuleType.Base, value);
    }

      
    get level(): number {
        return this.getValue(RoleModuleType.Level)!;
    }
    set level(value: number) {
        this.setValue(RoleModuleType.Level, value);
    }

      
    get job(): number {
        return this.getValue(RoleModuleType.Job)!;
    }
    set job(value: number) {
        this.setValue(RoleModuleType.Job, value);
    }

      
    get equip(): number {
        return this.getValue(RoleModuleType.Equip)!;
    }
    set equip(value: number) {
        this.setValue(RoleModuleType.Equip, value);
    }

      
    get decorator(): number {
        return this.getValue(RoleModuleType.Decorator)!;
    }
    set decorator(value: number) {
        this.setValue(RoleModuleType.Decorator, value);
    }

      
    get skill(): number {
        return this.getValue(RoleModuleType.Skill)!;
    }
    set skill(value: number) {
        this.setValue(RoleModuleType.Skill, value);
    }
}