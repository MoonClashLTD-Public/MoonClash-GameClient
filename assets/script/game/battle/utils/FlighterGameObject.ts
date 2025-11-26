import { log } from "cc";
import { Logger } from "../../../core/common/log/Logger";
import { BattleProp } from "./BattleProp";

export class FlighterGameObjcet {
    /**id */
    private _id: number = -1;
      
    public props: BattleProp = new BattleProp();   
    public fighter: core.IFighter;

    /**id */
    get id() {
        return this._id;
    }

    public constructor(fighter: core.IFighter) {
        this._id = fighter.id;
        this.fighter = fighter;
        fighter.props.forEach(v => this.props.SetValue(v.t, core.Prop.create({ t: v.t, i32: v.i32 })));
    }

    updFighter(flighter: core.IFighter) {
        for (const prop of flighter.props) {
            let _prop = core.Prop.create();
            _prop.t = prop.t;
            _prop.i32 = prop.i32;
            this.props.SetValue(prop.t, _prop);

            let idx = this.fighter.props.findIndex((v, k) => v.t == prop.t);
            if (idx == -1) {
                this.fighter.props.push(_prop);
            } else {
                this.fighter.props[idx as core.PropType] = _prop;
            }
        }
    }
}