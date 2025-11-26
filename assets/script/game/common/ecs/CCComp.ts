/*
 * @Author: dgflash
 * @Date: 2021-11-11 19:05:32
 * @LastEditors: dgflash
 * @LastEditTime: 2022-01-26 16:48:03
 */

import { Component, Node, _decorator } from 'cc';
import { EventDispatcher } from '../../../core/common/event/EventDispatcher';
import { ecs } from '../../../core/libs/ecs/ECS';
import { ViewUtil } from '../../../core/utils/ViewUtil';

const { ccclass, property } = _decorator;

/** 
  
   
  
  
  
  
 */
@ccclass('CCComp')
export abstract class CCComp extends Component implements ecs.IComp {
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