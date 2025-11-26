/*
 * @Author: dgflash
 * @Date: 2022-04-14 17:08:01
 * @LastEditors: dgflash
 * @LastEditTime: 2022-04-14 19:07:39
 */
import { Component, _decorator } from "cc";
import { EventDispatcher } from "../common/event/EventDispatcher";

const { ccclass } = _decorator;

@ccclass("GameComponent")
export class GameComponent extends Component {
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
    public dispatchEvent(event: string, arg = null) {
        this.eventDispatcher.dispatchEvent(event, arg);
    }

    onDestroy() {
        if (this._eventDispatcher) {
            this._eventDispatcher.destroy();
            this._eventDispatcher = null;
        }
    }
}