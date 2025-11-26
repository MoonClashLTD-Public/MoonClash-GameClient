/*
 * @Date: 2021-11-24 16:08:36
 * @LastEditors: dgflash
 * @LastEditTime: 2022-06-02 10:52:52
 */

import { BlockInputEvents, Layers } from "cc";
import { PopViewParams } from "./Defines";
import { UIConfig } from "./LayerManager";
import { LayerUI } from "./LayerUI";

/*
  
   
 */
export class LayerPopUp extends LayerUI {
    protected black!: BlockInputEvents;

    constructor(name: string) {
        super(name);
        this.init();
    }

    private init() {
        this.layer = Layers.Enum.UI_2D;
        this.black = this.addComponent(BlockInputEvents);
        this.black.enabled = false;
    }

    /**
       
  
  
  
     */
    add(config: UIConfig, params: any, popParams?: PopViewParams): string {
        this.black.enabled = true;
        return super.add(config, params, popParams);
    }

    remove(prefabPath: string, isDestroy: boolean): void {
        super.remove(prefabPath, isDestroy);
        this.setBlackDisable();
    }

    protected removeByUuid(prefabPath: string, isDestroy: boolean): void {
        super.removeByUuid(prefabPath, isDestroy);
        this.setBlackDisable();
    }

    protected setBlackDisable() {
        this.black.enabled = false;
    }

    clear(isDestroy: boolean) {
        super.clear(isDestroy)
        this.black.enabled = false;
    }
}