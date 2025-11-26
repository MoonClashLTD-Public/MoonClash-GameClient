/*
 * @Author: dgflash
 * @Date: 2022-01-21 09:33:44
 * @LastEditors: dgflash
 * @LastEditTime: 2022-02-09 12:16:28
 */
import { RoleAttributeType } from "../RoleEnum";
import { RoleNumeric } from "./RoleNumeric";

  
export class RoleNumericDecorator {
      
    attribute: RoleAttributeType = null!;
      
    value: number = 0;
}

  
export class RoleNumericMap {
      
    private attributes: Map<RoleAttributeType, RoleNumeric> = new Map();
      
    private decorators: Map<RoleNumericDecorator, number> = new Map();
      
    private vm: any = null!;

    constructor(vm: any) {
        this.vm = vm;
    }

      
    addDecorator(rnd: RoleNumericDecorator) {
        this.decorators.set(rnd, rnd.value);
        var rn = this.get(rnd.attribute);
        rn.decorator += rnd.value;
    }

      
    removeDecorator(rnd: RoleNumericDecorator) {
        this.decorators.delete(rnd);
        var rn = this.get(rnd.attribute);
        rn.decorator -= rnd.value;
    }

      
    get(type: RoleAttributeType): RoleNumeric {
        var attr = this.attributes.get(type);
        if (attr == null) {
            switch (type) {
                case RoleAttributeType.physical:
                    attr = new RoleNumericPhysical(type, this);
                    break;
                default:
                    attr = new RoleNumeric(type, this);
                    break;
            }
            this.attributes.set(type, attr);

            attr.onUpdate = (rn: RoleNumeric) => {
                this.vm[rn.type] = rn.value;
            };
        }
        return attr;
    }

    forEach(callbackfn: (value: RoleNumeric, key: RoleAttributeType, map: Map<RoleAttributeType, RoleNumeric>) => void, thisArg?: any): void {
        this.attributes.forEach(callbackfn, thisArg);
    }

      
    reset() {
        this.decorators.clear();
        this.attributes.forEach((value: RoleNumeric, key: RoleAttributeType, map: Map<RoleAttributeType, RoleNumeric>) => {
            value.reset();
        });
    }
}

  
export class RoleNumericPhysical extends RoleNumeric {
    protected update(): void {
        super.update();

          
        this.attributes.get(RoleAttributeType.hp).base = Math.floor(this.value * 0.5);
    }
}