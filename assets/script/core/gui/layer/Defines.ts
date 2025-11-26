/*
 * @Author: dgflash
 * @Date: 2021-11-18 11:21:32
 * @LastEditors: dgflash
 * @LastEditTime: 2022-01-24 14:24:07
 */
/*
  
 */
import { Node } from "cc";

  
export interface UICallbacks {
      
    onAdded?: (node: Node, params: any) => void,

    /**
  
     */
    onRemoved?: (node: Node | null, params: any) => void,

    /** 
       
     * 
       
     * 
       
     * 
     * */
    onBeforeRemove?: (node: Node, next: Function) => void
}

  
export interface PopViewParams extends UICallbacks {
      
    modal?: boolean,

      
    touchClose?: boolean,

      
    opacity?: number;
}

  
export class ViewParams {
      
    public uuid!: string;
      
    public prefabPath!: string;
      
    public params: any | null;
      
    public callbacks!: UICallbacks | null;
      
    public valid: boolean = true;
      
    public node: Node | null = null;;
}