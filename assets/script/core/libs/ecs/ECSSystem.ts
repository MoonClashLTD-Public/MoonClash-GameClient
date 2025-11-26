import { ecs } from "./ECS";
import { ECSEntity } from "./ECSEntity";
import { ECSGroup } from "./ECSGroup";
import { ECSModel } from "./ECSModel";

/**
 *     group，    group                          
 * @param matcher           
 */
export function createGroup<E extends ECSEntity = ECSEntity>(matcher: ecs.IMatcher): ECSGroup<E> {
    let group = ECSModel.groups.get(matcher.mid);
    if (!group) {
        group = new ECSGroup(matcher);
        ECSModel.groups.set(matcher.mid, group);
        let careComponentTypeIds = matcher.indices;
        for (let i = 0; i < careComponentTypeIds.length; i++) {
            ECSModel.compAddOrRemove.get(careComponentTypeIds[i])!.push(group.onComponentAddOrRemove.bind(group));
        }
    }
    return group as unknown as ECSGroup<E>;
}

export abstract class ECSComblockSystem<E extends ECSEntity = ECSEntity> {
    protected group: ECSGroup<E>;
    protected dt: number = 0;

    private enteredEntities: Map<number, E> = null!;
    private removedEntities: Map<number, E> = null!;

    private hasEntityEnter: boolean = false;
    private hasEntityRemove: boolean = false;
    private hasUpdate: boolean = false;

    private tmpExecute: ((dt: number) => void) | null = null;
    private execute!: (dt: number) => void;

    constructor() {
        let hasOwnProperty = Object.hasOwnProperty;
        let prototype = Object.getPrototypeOf(this);
        let hasEntityEnter = hasOwnProperty.call(prototype, 'entityEnter');
        let hasEntityRemove = hasOwnProperty.call(prototype, 'entityRemove');
        let hasFirstUpdate = hasOwnProperty.call(prototype, 'firstUpdate');
        let hasUpdate = hasOwnProperty.call(prototype, 'update');

        this.hasEntityEnter = hasEntityEnter;
        this.hasEntityRemove = hasEntityRemove;
        this.hasUpdate = hasUpdate;

        if (hasEntityEnter || hasEntityRemove) {
            this.enteredEntities = new Map<number, E>();
            this.removedEntities = new Map<number, E>();

            this.execute = this.execute1;
            this.group = createGroup(this.filter());
            this.group.watchEntityEnterAndRemove(this.enteredEntities, this.removedEntities);
        }
        else {
            this.execute = this.execute0;
            this.group = createGroup(this.filter());
        }

        if (hasFirstUpdate) {
            this.tmpExecute = this.execute;
            this.execute = this.updateOnce;
        }
    }

    init(): void {

    }

    onDestroy(): void {

    }

    hasEntity(): boolean {
        return this.group.count > 0;
    }

    /**
     *       entityEnter，        firstUpdate
     * @param dt 
     * @returns 
     */
    private updateOnce(dt: number) {
        if (this.group.count === 0) {
            return;
        }

        this.dt = dt;

          
        if (this.enteredEntities.size > 0) {
            var entities = this.enteredEntities.values();
            for (let entity of entities) {
                (this as unknown as ecs.IEntityEnterSystem).entityEnter(entity);
            }
            this.enteredEntities.clear();
        }

          
        for (let entity of this.group.matchEntities) {
            (this as unknown as ecs.ISystemFirstUpdate).firstUpdate(entity);
        }

        this.execute = this.tmpExecute!;
        this.execute(dt);
        this.tmpExecute = null;
    }

    /**
     *       update
     * @param dt 
     * @returns 
     */
    private execute0(dt: number): void {
        if (this.group.count === 0) return;

        this.dt = dt;

          
        if (this.hasUpdate) {
            for (let entity of this.group.matchEntities) {
                (this as unknown as ecs.ISystemUpdate).update(entity);
            }
        }
    }

    /**
     *       entityRemove，      entityEnter，        update
     * @param dt 
     * @returns 
     */
    private execute1(dt: number): void {
        if (this.removedEntities.size > 0) {
            if (this.hasEntityRemove) {
                var entities = this.removedEntities.values();
                for (let entity of entities) {
                    (this as unknown as ecs.IEntityRemoveSystem).entityRemove(entity);
                }
            }
            this.removedEntities.clear();
        }

        if (this.group.count === 0) return;

        this.dt = dt;

          
        if (this.enteredEntities!.size > 0) {
            if (this.hasEntityEnter) {
                var entities = this.enteredEntities!.values();
                for (let entity of entities) {
                    (this as unknown as ecs.IEntityEnterSystem).entityEnter(entity);
                }
            }
            this.enteredEntities!.clear();
        }

          
        if (this.hasUpdate) {
            for (let entity of this.group.matchEntities) {
                (this as unknown as ecs.ISystemUpdate).update(entity);
            }
        }
    }

    /**
     *             
     * 
     *                       。
     */
    abstract filter(): ecs.IMatcher;
}

/**
 * System  root，          System              。
 * 
 *     System                RootSystem，                RootSystem。
 */
export class ECSRootSystem {
    private executeSystemFlows: ECSComblockSystem[] = [];
    private systemCnt: number = 0;

    add(system: ECSSystem | ECSComblockSystem) {
        if (system instanceof ECSSystem) {
              
            Array.prototype.push.apply(this.executeSystemFlows, system.comblockSystems);
        }
        else {
            this.executeSystemFlows.push(system as ECSComblockSystem);
        }
        this.systemCnt = this.executeSystemFlows.length;
        return this;
    }

    init() {
        this.executeSystemFlows.forEach(sys => sys.init());
    }

    execute(dt: number) {
        for (let i = 0; i < this.systemCnt; i++) {
            // @ts-ignore
            this.executeSystemFlows[i].execute(dt);
        }
    }

    clear() {
        this.executeSystemFlows.forEach(sys => sys.onDestroy());
    }
}

/**
 *           ，                                          。System          System。
 */
export class ECSSystem {
    private _comblockSystems: ECSComblockSystem[] = [];
    get comblockSystems() {
        return this._comblockSystems;
    }

    add(system: ECSSystem | ECSComblockSystem) {
        if (system instanceof ECSSystem) {
            Array.prototype.push.apply(this._comblockSystems, system._comblockSystems);
            system._comblockSystems.length = 0;
        }
        else {
            this._comblockSystems.push(system as ECSComblockSystem);
        }
        return this;
    }
}