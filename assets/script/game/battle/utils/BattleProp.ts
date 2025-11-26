  
export class BattleProp {
    private _attrs: Map<number, core.IProp> = new Map();   

    public constructor() {
        this.Reset();
    }

      
    public Reset(): void {
        this._attrs.clear();
          
        for (let index = 0; index < core.PropType.PropTypeSepEnd; index++) {
            let d = core.Prop.create();
            d.t = index;
            this._attrs.set(index, d);
        }
          
        // for (let index = final_prop.PropType.PropSepCommonEnd + 1; index < final_prop.PropType.PropSepPlayerEnd; index++) {
        //     let d = core.Prop.create();
        //     d.type = index;
        //     this._attrs.set(index, d);
        // }
          
        // for (let index = final_prop.PropType.PropSepCommonEnd + 1; index < final_prop.PropType.PropSepMonsterEnd; index++) {
        //     let d = core.Prop.create();
        //     d.type = index;
        //     this._attrs.set(index, d);
        // }
    }

      
    public GetAttrs(): Map<number, core.IProp> {
        return this._attrs;
    }

      
      
      
    public GetValue(key: core.PropType): core.IProp {
        return this._attrs.get(key) ?? core.Prop.create();
    }

      
      
      
    public SetValue(key: core.PropType, value: core.IProp): void {
        if (this._attrs.get(key) != null) {
            this._attrs.set(key, value);
        }
    }

      
      
      
    public AddValue(key: core.PropType, add: number): void {
        if (this._attrs.get(key) != null) {
            let prop = this._attrs.get(key);
            prop.i32 += add;
            this._attrs.set(key, prop);
        }
    }
}

export class BattlePropHelp {
      
    // public static GetPropFinalDesc(attrType: final_prop.PropType): string {
    //     switch (attrType) {
    //         case final_prop.PropType.PropHp:
      
    //         case final_prop.PropType.PropHpMax:
      
    //         case final_prop.PropType.PropAtkMin:
      
    //         case final_prop.PropType.PropAtkMax:
      
    //         case final_prop.PropType.PropDefMin:
      
    //         case final_prop.PropType.PropDefMax:
      
    //         case final_prop.PropType.PropRecover:
      
    //         case final_prop.PropType.PropHit:
      
    //         case final_prop.PropType.PropDodge:
      
    //         case final_prop.PropType.PropQi:
      
    //         case final_prop.PropType.PropCritProb:
      
    //         case final_prop.PropType.PropCritValue:
      
    //         case final_prop.PropType.PropLucky:
      
    //         case final_prop.PropType.PropTalent:
      
    //         case final_prop.PropType.PropNature:
      
    //         case final_prop.PropType.PropDmgPlus:
      
    //         case final_prop.PropType.PropDmgPlus:
      
    //         default:
    //             return "err"
    //     }
    // }

      
    // public static GetPropDesc(attrType: core.PropType): string {
    //     switch (attrType) {
    //         case core.PropType.PropHpMax:
      
    //         case core.PropType.PropAtkMin:
      
    //         case core.PropType.PropAtkMax:
      
    //         case core.PropType.PropDefMin:
      
    //         case core.PropType.PropDefMax:
      
    //         case core.PropType.PropRecover:
      
    //         case core.PropType.PropHit:
      
    //         case core.PropType.PropDodge:
      
    //         case core.PropType.PropQi:
      
    //         case core.PropType.PropCritProb:
      
    //         case core.PropType.PropCritValue:
      
    //         case core.PropType.PropLucky:
      
    //         case core.PropType.PropTalent:
      
    //         case core.PropType.PropNature:
      
    //         case core.PropType.PropDmgPlus:
      
    //         case core.PropType.PropCdReset:
      
    //         case core.PropType.PropExp:
      
    //         case core.PropType.PropCoin:
      
    //         case core.PropType.PropGoldIngot:
      
    //         case core.PropType.PropExp2:
      
    //         case core.PropType.PropSwordValue:
      
    //         case core.PropType.PropCamp:
      
    //         case core.PropType.PropShaYi:
      
    //         default:
    //             return "err"
    //     }
    // }
}