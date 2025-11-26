import { ecs } from "./ECS";
import { ECSEntity } from "./ECSEntity";

export class ECSGroup<E extends ECSEntity = ECSEntity> {
      
    private matcher: ecs.IMatcher;

    private _matchEntities: Map<number, E> = new Map();

    private _entitiesCache: E[] | null = null;

    /**
     *               
     */
    get matchEntities() {
        if (this._entitiesCache === null) {
            this._entitiesCache = Array.from(this._matchEntities.values());
        }
        return this._entitiesCache;
    }

    /**
     *     group            。
     * 
     *   ：                      。
     *   ：            this._matchEntities.size            ，            get    。                                        count    
     */
    count = 0;

      
    get entity(): E {
        return this.matchEntities[0];
    }

    private _enteredEntities: Map<number, E> | null = null;
    private _removedEntities: Map<number, E> | null = null;

    constructor(matcher: ecs.IMatcher) {
        this.matcher = matcher;
    }

    onComponentAddOrRemove(entity: E) {
        if (this.matcher.isMatch(entity)) {                           
            this._matchEntities.set(entity.eid, entity);
            this._entitiesCache = null;
            this.count++;

            if (this._enteredEntities) {
                this._enteredEntities.set(entity.eid, entity);
                this._removedEntities!.delete(entity.eid);
            }
        }
        else if (this._matchEntities.has(entity.eid)) {               
            this._matchEntities.delete(entity.eid);
            this._entitiesCache = null;
            this.count--;

            if (this._enteredEntities) {
                this._enteredEntities.delete(entity.eid);
                this._removedEntities!.set(entity.eid, entity);
            }
        }
    }

    watchEntityEnterAndRemove(enteredEntities: Map<number, E>, removedEntities: Map<number, E>) {
        this._enteredEntities = enteredEntities;
        this._removedEntities = removedEntities;
    }

    clear() {
        this._matchEntities.clear();
        this._entitiesCache = null;
        this.count = 0;
        this._enteredEntities?.clear();
        this._removedEntities?.clear();
    }
}