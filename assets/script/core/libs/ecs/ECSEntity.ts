import { ecs } from "./ECS";
import { ECSMask } from "./ECSMask";
import { ECSModel } from "./ECSModel";

  

/**
   
  
  
 */
function broadcastCompAddOrRemove(entity: ECSEntity, componentTypeId: number) {
    let events = ECSModel.compAddOrRemove.get(componentTypeId);
    for (let i = events!.length - 1; i >= 0; i--) {
        events![i](entity);
    }
      
    if (ECSModel.tid2comp.has(componentTypeId)) {
        ECSModel.tid2comp.delete(componentTypeId);
    }
}

/**
   
 * @param ctor
 */
function createComp<T extends ecs.IComp>(ctor: ecs.CompCtor<T>): T {
    var cct = ECSModel.compCtors[ctor.tid];
    if (!cct) {
        throw Error(`${ctor.compName}`);
    }
    let comps = ECSModel.compPools.get(ctor.tid)!;
    let component = comps.pop() || new (cct as ecs.CompCtor<T>);
    return component as T;
}

/**
   
 * 
   
 * @param entity 
 */
function destroyEntity(entity: ECSEntity) {
    if (ECSModel.eid2Entity.has(entity.eid)) {
        var entitys = ECSModel.entityPool.get(entity.constructor.name);
        if (entitys == null) {
            entitys = [];
            ECSModel.entityPool.set(entity.constructor.name, entitys);
        }
        entitys.push(entity);
        ECSModel.eid2Entity.delete(entity.eid);
    }
    else {

    }
}

//#endregion

export class ECSEntity {
    /**
       
     */
    eid: number = -1;

    private mask = new ECSMask();

    /**
       
     */
    private compTid2Ctor: Map<number, ecs.CompType<ecs.IComp>> = new Map();
    /**
       
     */
    private compTid2Obj: Map<number, ecs.IComp> = new Map();

    /**
       
     * 
       
     * 
       
  
  
     */
    add<T extends ecs.IComp>(obj: T): ECSEntity;
    add(ctor: number, isReAdd?: boolean): ECSEntity;
    add<T extends ecs.IComp>(ctor: ecs.CompCtor<T>, isReAdd?: boolean): T;
    add<T extends ecs.IComp>(ctor: ecs.CompType<T>, isReAdd?: boolean): T;
    add<T extends ecs.IComp>(ctor: ecs.CompType<T> | T, isReAdd: boolean = false): T | ECSEntity {
        if (typeof ctor === 'function') {
            let compTid = ctor.tid;
            if (ctor.tid === -1) {
                throw Error('');
            }
            if (this.compTid2Ctor.has(compTid)) {                                 
                if (isReAdd) {
                    this.remove(ctor);
                }
                else {
                    console.log(`${ctor.compName}`);
                    // @ts-ignore
                    return this[ctor.compName] as T;
                }
            }
            this.mask.set(compTid);

            let comp: T;
            if (this.compTid2Obj.has(compTid)) {
                comp = this.compTid2Obj.get(compTid) as T;
                this.compTid2Obj.delete(compTid);
            }
            else {
                  
                comp = createComp(ctor) as T;
            }

              
            // @ts-ignore
            this[ctor.compName] = comp;
            this.compTid2Ctor.set(compTid, ctor);
            comp.ent = this;
              
            broadcastCompAddOrRemove(this, compTid);

            return comp;
        }
        else {
            let tmpCtor = (ctor.constructor as ecs.CompCtor<T>);
            let compTid = tmpCtor.tid;
              
              
            if (compTid === -1 || compTid == null) {
                throw Error('');
            }
            if (this.compTid2Ctor.has(compTid)) {
                throw Error('');
            }

            this.mask.set(compTid);
            //@ts-ignore
            this[tmpCtor.compName] = ctor;
            this.compTid2Ctor.set(compTid, tmpCtor);
            //@ts-ignore
            ctor.ent = this;
            //@ts-ignore
            ctor.canRecycle = false;
            broadcastCompAddOrRemove(this, compTid);

            return this;
        }
    }

    addComponents<T extends ecs.IComp>(...ctors: ecs.CompType<T>[]) {
        for (let ctor of ctors) {
            this.add(ctor);
        }
        return this;
    }

    get(ctor: number): number;
    get<T extends ecs.IComp>(ctor: ecs.CompCtor<T>): T;
    get<T extends ecs.IComp>(ctor: ecs.CompCtor<T> | number): T {
        // @ts-ignore
        return this[ctor.compName];
    }

    has(ctor: ecs.CompType<ecs.IComp>): boolean {
        if (typeof ctor == "number") {
            return this.mask.has(ctor);
        }
        else {
            return this.compTid2Ctor.has(ctor.tid);
        }
    }

    /**
     * 
  
  
       
       
     */
    remove(ctor: ecs.CompType<ecs.IComp>, isRecycle: boolean = true) {
        let hasComp = false;
        //@ts-ignore
        let componentTypeId = ctor.tid;
        //@ts-ignore
        let compName = ctor.compName;
        if (this.mask.has(componentTypeId)) {
            hasComp = true;
            //@ts-ignore
            let comp = this[ctor.compName] as IECSComp;
            //@ts-ignore
            comp.ent = null;
            if (isRecycle) {
                comp.reset();
                if (comp.canRecycle) {
                    ECSModel.compPools.get(componentTypeId)!.push(comp);
                }
            }
            else {
                this.compTid2Obj.set(componentTypeId, comp);
            }
        }

        if (hasComp) {
            //@ts-ignore
            this[compName] = null;
            this.mask.delete(componentTypeId);
            this.compTid2Ctor.delete(componentTypeId);
            broadcastCompAddOrRemove(this, componentTypeId);
        }
    }

    private _remove(comp: ecs.CompType<ecs.IComp>) {
        this.remove(comp, false);
    }

    /**
       
     */
    destroy() {
        this.compTid2Ctor.forEach(this._remove, this);
        destroyEntity(this);
        this.compTid2Obj.clear();
    }
}