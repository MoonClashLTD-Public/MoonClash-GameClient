import { ecs } from "./ECS";
import { ECSEntity } from "./ECSEntity";

  
export abstract class ECSComp implements ecs.IComp {
    /**
       
     */
    static tid: number = -1;
    static compName: string;
    /**
       
     */
    ent!: ECSEntity;

    /**
       
       
     */
    canRecycle: boolean = true;

    /**
       
     * 
     * *  
     */
    abstract reset(): void;
}