/*
 * @Author: dgflash
 * @Date: 2021-11-11 19:05:32
 * @LastEditors: dgflash
 * @LastEditTime: 2022-01-26 16:40:57
 */

import { Node, _decorator } from 'cc';
import { EventDispatcher } from "../../../core/common/event/EventDispatcher";
import { ecs } from '../../../core/libs/ecs/ECS';
import VMParent from "../../../core/libs/model-view/VMParent";
import { ViewUtil } from "../../../core/utils/ViewUtil";

const { ccclass, property } = _decorator;

/** 
 * Cocos Creator Component + ECS Comp + VM VMParent
   
  
  
  
  
 */
@ccclass('CCVMParentComp')
export abstract class CCVMParentComp extends VMParent implements ecs.IComp {
    static tid: number = -1;
    static compName: string;

    canRecycle!: boolean;
    ent!: ecs.Entity;

    abstract reset(): void;

    private nodes: Map<string, Node> = new Map();

      
    get(name: string): Node | undefined {
        return this.nodes.get(name);
    }

    onLoad() {
        ViewUtil.nodeTreeInfoLite(this.node, this.nodes);
        super.onLoad();
    }

      
    private _eventDispatcher: EventDispatcher | null = null;

    public get eventDispatcher(): EventDispatcher {
        if (!this._eventDispatcher) {
            this._eventDispatcher = new EventDispatcher();
        }
        return this._eventDispatcher;
    }

      
    private _isBindMessageActive: boolean = false;

      
    public bindMessageActive() {
        this._isBindMessageActive = true;
    }

      
    public unbindMessageActive() {
        this._isBindMessageActive = false;
    }

    /**
       
  
  
  
     */
    public on(event: string, listener: Function, thisObj: any) {
        this.eventDispatcher.on(event, (event, args) => {
            if (!this.isValid) {
                if (this._eventDispatcher) {
                    this._eventDispatcher.destroy();
                    this._eventDispatcher = null;
                }
                return;
            }

            if (this._isBindMessageActive) {
                if (this.node.active) {
                    listener.call(thisObj, event, args);
                }
            }
            else {
                listener.call(thisObj, event, args);
            }
        }, thisObj);
    }

    /**
       
  
     */
    public off(event: string) {
        if (this._eventDispatcher) {
            this._eventDispatcher.off(event);
        }
    }

    /** 
       
  
  
     */
    public dispatchEvent(event: string, arg: any = null) {
        this.eventDispatcher.dispatchEvent(event, arg);
    }

    onDestroy() {
        if (this._eventDispatcher) {
            this._eventDispatcher.destroy();
            this._eventDispatcher = null;
        }

        this.nodes.clear();
    }
    //#endregion
}