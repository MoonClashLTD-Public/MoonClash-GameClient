import { ecs } from "./ECS";
import { ECSEntity } from "./ECSEntity";
import { ECSMask } from "./ECSMask";
import { ECSModel } from "./ECSModel";

let macherId: number = 1;

/**
 *             “  ”      
 *     ：ecs.Macher.allOf(...).excludeOf(...)        allOf && excludeOf，        “        ”      “            ”
 */
export class ECSMatcher implements ecs.IMatcher {
    protected rules: BaseOf[] = [];
    protected _indices: number[] | null = null;
    public isMatch!: (entity: ECSEntity) => boolean;
    public mid: number = -1;

    private _key: string | null = null;
    public get key(): string {
        if (!this._key) {
            let s = '';
            for (let i = 0; i < this.rules.length; i++) {
                s += this.rules[i].getKey()
                if (i < this.rules.length - 1) {
                    s += ' && '
                }
            }
            this._key = s;
        }
        return this._key;
    }

    constructor() {
        this.mid = macherId++;
    }

    /**
     *                     。      Group  ，Context        id    Group                        。
     */
    get indices() {
        if (this._indices === null) {
            this._indices = [];
            this.rules.forEach((rule) => {
                Array.prototype.push.apply(this._indices, rule.indices);
            });
        }
        return this._indices;
    }

    /**
     *                 ，                                  。
     * @param args         
     */
    anyOf(...args: ecs.CompType<ecs.IComp>[]): ECSMatcher {
        this.rules.push(new AnyOf(...args));
        this.bindMatchMethod();
        return this;
    }

    /**
     *                 ，                              。
     * @param args         
     */
    allOf(...args: ecs.CompType<ecs.IComp>[]): ECSMatcher {
        this.rules.push(new AllOf(...args));
        this.bindMatchMethod();
        return this;
    }

    /**
     *                             
     * 
     *     ：
     *                        onlyOf。    onlyOf                              。
     * @param args         
     */
    onlyOf(...args: ecs.CompType<ecs.IComp>[]): ECSMatcher {
        this.rules.push(new AllOf(...args));
        let otherTids: ecs.CompType<ecs.IComp>[] = [];
        for (let ctor of ECSModel.compCtors) {
            if (args.indexOf(ctor) < 0) {
                otherTids.push(ctor);
            }
        }
        this.rules.push(new ExcludeOf(...otherTids));
        this.bindMatchMethod();
        return this;
    }

    /**
     *                         
     * @param args 
     */
    excludeOf(...args: ecs.CompType<ecs.IComp>[]) {
        this.rules.push(new ExcludeOf(...args));
        this.bindMatchMethod();
        return this;
    }

    private bindMatchMethod() {
        if (this.rules.length === 1) {
            this.isMatch = this.isMatch1;
        }
        else if (this.rules.length === 2) {
            this.isMatch = this.isMatch2;
        }
        else {
            this.isMatch = this.isMatchMore;
        }
    }

    private isMatch1(entity: ECSEntity): boolean {
        return this.rules[0].isMatch(entity);
    }

    private isMatch2(entity: ECSEntity): boolean {
        return this.rules[0].isMatch(entity) && this.rules[1].isMatch(entity);
    }

    private isMatchMore(entity: ECSEntity): boolean {
        for (let rule of this.rules) {
            if (!rule.isMatch(entity)) {
                return false;
            }
        }
        return true;
    }

    clone(): ECSMatcher {
        let newMatcher = new ECSMatcher();
        newMatcher.mid = macherId++;
        this.rules.forEach(rule => newMatcher.rules.push(rule));
        return newMatcher;
    }
}

abstract class BaseOf {
    indices: number[] = [];

    protected mask = new ECSMask();

    constructor(...args: ecs.CompType<ecs.IComp>[]) {
        let componentTypeId = -1;
        let len = args.length;
        for (let i = 0; i < len; i++) {
            if (typeof (args[i]) === "number") {
                componentTypeId = args[i] as number;
            }
            else {
                componentTypeId = (args[i] as ecs.CompCtor<ecs.IComp>).tid;
            }
            if (componentTypeId == -1) {
                throw Error('                  ！');
            }
            this.mask.set(componentTypeId);

            if (this.indices.indexOf(componentTypeId) < 0) {   
                this.indices.push(componentTypeId);
            }
        }
        if (len > 1) {
            this.indices.sort((a, b) => { return a - b; });   
        }
    }

    toString(): string {
        return this.indices.join('-');   
    }

    abstract getKey(): string;

    abstract isMatch(entity: ECSEntity): boolean;
}

/**
 *                                   
 */
class AnyOf extends BaseOf {
    public isMatch(entity: ECSEntity): boolean {
        // @ts-ignore
        return this.mask.or(entity.mask);
    }

    getKey(): string {
        return 'anyOf:' + this.toString();
    }
}

/**
 *               “    ”          ，                                          
 */
class AllOf extends BaseOf {
    public isMatch(entity: ECSEntity): boolean {
        // @ts-ignore
        return this.mask.and(entity.mask);
    }

    getKey(): string {
        return 'allOf:' + this.toString();
    }
}

/**
 *                         
 */
class ExcludeOf extends BaseOf {
    public getKey(): string {
        return 'excludeOf:' + this.toString();
    }

    public isMatch(entity: ECSEntity): boolean {
        // @ts-ignore
        return !this.mask.or(entity.mask);
    }
}