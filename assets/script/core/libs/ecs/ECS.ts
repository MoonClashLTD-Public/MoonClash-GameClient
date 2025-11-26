import { ECSComp } from "./ECSComp";
import { ECSEntity } from "./ECSEntity";
import { ECSMatcher } from "./ECSMatcher";
import { ECSModel } from "./ECSModel";
import { createGroup, ECSComblockSystem, ECSRootSystem, ECSSystem } from "./ECSSystem";

export module ecs {
    export type Entity = ECSEntity;
    export type Comp = ECSComp;
    export type System = ECSSystem;
    export type RootSystem = ECSRootSystem;
    export type ComblockSystem = ECSComblockSystem;

    export const Entity = ECSEntity;
    export const Comp = ECSComp;
    export const System = ECSSystem;
    export const RootSystem = ECSRootSystem;
    export const ComblockSystem = ECSComblockSystem;

    export type CompAddOrRemove = (entity: Entity) => void;
    export type CompType<T> = CompCtor<T> | number;

      
    export interface EntityCtor<T> {
        new(): T;
    }

    export interface IComp {
        canRecycle: boolean;
        ent: Entity;

        reset(): void;
    }

    export interface CompCtor<T> {
        new(): T;
        tid: number;
        compName: string;
    }

    export interface IMatcher {
        mid: number;
        indices: number[];
        key: string;
        isMatch(entity: Entity): boolean;
    }

    /**
       
     * 
  
       
     */
    export interface IEntityEnterSystem<E extends Entity = Entity> {
        entityEnter(entity: E): void;
    }

      
    export interface IEntityRemoveSystem<E extends Entity = Entity> {
        entityRemove(entity: E): void;
    }

      
    export interface ISystemFirstUpdate<E extends Entity = Entity> {
        firstUpdate(entity: E): void;
    }

      
    export interface ISystemUpdate<E extends Entity = Entity> {
        update(entity: E): void;
    }
    //#endregion

    /**
       
  
  
     */
    export function register<T>(compName: string, canNew: boolean = true) {
        return function (ctor: CompCtor<T>) {
            if (ctor.tid === -1) {
                ctor.tid = ECSModel.compTid++;
                ctor.compName = compName;
                if (canNew) {
                    ECSModel.compCtors.push(ctor);
                    ECSModel.compPools.set(ctor.tid, []);
                }
                else {
                    ECSModel.compCtors.push(null!);
                }
                ECSModel.compAddOrRemove.set(ctor.tid, []);
            }
            else {
                throw new Error(` ${compName}.`);
            }
        }
    }

      
    export function getEntity<T extends Entity>(ctor: EntityCtor<T>): T {
        var entitys = ECSModel.entityPool.get(ctor.name) || [];
        let entity: any = entitys.pop();
        if (!entity) {
            entity = new ctor();
            entity.eid = ECSModel.eid++;   
        }

        if (entity.init)
            entity.init();
        else
            console.error(`${ctor.name}`);

        ECSModel.eid2Entity.set(entity.eid, entity);
        return entity as T;
    }

    /**
       
     * @param matcher 
     * @returns 
     */
    export function query<E extends Entity = Entity>(matcher: IMatcher): E[] {
        let group = ECSModel.groups.get(matcher.mid);
        if (!group) {
            group = createGroup(matcher);
            ECSModel.eid2Entity.forEach(group.onComponentAddOrRemove, group);
        }
        return group.matchEntities as E[];
    }

      
    export function clear() {
        ECSModel.eid2Entity.forEach((entity) => {
            entity.destroy();
        });
        ECSModel.groups.forEach((group) => {
            group.clear();
        });
        ECSModel.compAddOrRemove.forEach(callbackLst => {
            callbackLst.length = 0;
        });
        ECSModel.eid2Entity.clear();
        ECSModel.groups.clear();
    }

    /**
       
     * @param eid 
     */
    export function getEntityByEid<E extends Entity = Entity>(eid: number): E {
        return ECSModel.eid2Entity.get(eid) as E;
    }

      
    export function activeEntityCount() {
        return ECSModel.eid2Entity.size;
    }

      
    function createEntity<E extends Entity = Entity>(): E {
        let entity = new Entity();
        entity.eid = ECSModel.eid++;                       
        ECSModel.eid2Entity.set(entity.eid, entity);
        return entity as E;
    }

    /**
       
     * @param ctor 
     */
    function createEntityWithComp<T extends IComp>(ctor: CompCtor<T>): T {
        let entity = createEntity();
        return entity.add(ctor);
    }

      
    /**
       
       
     * @param args 
     */
    export function allOf(...args: CompType<IComp>[]) {
        return new ECSMatcher().allOf(...args);
    }

    /**
       
  
     */
    export function anyOf(...args: CompType<IComp>[]) {
        return new ECSMatcher().anyOf(...args);
    }

    /**
       
     * 
       
       
  
     */
    export function onlyOf(...args: CompType<IComp>[]) {
        return new ECSMatcher().onlyOf(...args);
    }

    /**
       
     * 
     * eg.
  
     * @param args 
     */
    export function excludeOf(...args: CompType<IComp>[]) {
        return new ECSMatcher().excludeOf(...args);
    }
    //#endregion

      
    /**
       
  
     */
    export function getSingleton<T extends IComp>(ctor: CompCtor<T>) {
        if (!ECSModel.tid2comp.has(ctor.tid)) {
            let comp = createEntityWithComp(ctor) as T;
            ECSModel.tid2comp.set(ctor.tid, comp);
        }
        return ECSModel.tid2comp.get(ctor.tid) as T;
    }

    /**
       
     * @param obj 
     */
    export function addSingleton(obj: IComp) {
        let tid = (obj.constructor as CompCtor<IComp>).tid;
        if (!ECSModel.tid2comp.has(tid)) {
            ECSModel.tid2comp.set(tid, obj);
        }
    }

    //#endregion
}