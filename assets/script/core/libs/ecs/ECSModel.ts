/*
 * @Author: dgflash
 * @Date: 2022-05-12 14:18:44
 * @LastEditors: dgflash
 * @LastEditTime: 2022-05-24 11:07:13
 */
import { ecs } from "./ECS";
import { ECSEntity } from "./ECSEntity";
import { ECSGroup } from "./ECSGroup";

export class ECSModel {
      
    static eid = 1;

      
    static compTid = 0;

      
    static compPools: Map<number, ecs.IComp[]> = new Map();

      
    static compCtors: (ecs.CompCtor<any> | number)[] = [];

    /**
     *                                     “    ”      group  。goup                  （      ）                                。                  group
     *                 。
     */
    static compAddOrRemove: Map<number, ecs.CompAddOrRemove[]> = new Map();

      
    static tid2comp: Map<number, ecs.IComp> = new Map();

    /**
    *               
    */
    static entityPool: Map<string, ECSEntity[]> = new Map();

    /**
     *         id            
     */
    static eid2Entity: Map<number, ECSEntity> = new Map();

    /**
     *       group
     * 
     * key                ，                    group
     */
    static groups: Map<number, ECSGroup> = new Map();
}