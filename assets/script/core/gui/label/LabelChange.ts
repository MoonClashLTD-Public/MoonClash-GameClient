/*
 * @Author: dgflash
 * @Date: 2022-04-14 17:08:01
 * @LastEditors: dgflash
 * @LastEditTime: 2022-04-14 18:26:24
 */
import { _decorator } from "cc";
import LabelNumber from "./LabelNumber";

const { ccclass, property, menu } = _decorator;

  
@ccclass("LabelChange")
@menu('ui/label/LabelChange')
export class LabelChange extends LabelNumber {
    @property
    isInteger: boolean = false;

    private duration: number = 0;              
    private callback: Function | undefined;    
    private isBegin: boolean = false;          
    private speed: number = 0;                 
    private end: number = 0;                   

    /**
       
     * @param {number} duration 
     * @param {number} end 
     * @param {Function} [callback]
     */
    public changeTo(duration: number, end: number, callback?: Function) {
        if (duration == 0) {
            if (callback) callback();
            return;
        }
        this.playAnim(duration, this.num, end, callback);
    }


    /**
       
     * @param {number} duration 
     * @param {number} value 
     * @param {Function} [callback] 
     * @memberof LabelChange
     */
    public changeBy(duration: number, value: number, callback?: Function) {
        if (duration == 0) {
            if (callback) callback();
            return;
        }
        this.playAnim(duration, this.num, this.num + value, callback);
    }

      
    public stop(excCallback: boolean = true) {
        this.num = this.end;
        this.isBegin = false;
        if (excCallback && this.callback) this.callback();
    }

      
    private playAnim(duration: number, begin: number, end: number, callback?: Function) {
        this.duration = duration;
        this.end = end;
        this.callback = callback;
        this.speed = (end - begin) / duration;

        this.num = begin;
        this.isBegin = true;
    }

      
    private isEnd(num: number): boolean {
        if (this.speed > 0) {
            return num >= this.end;
        }
        else {
            return num <= this.end;
        }
    }

    update(dt: number) {
        if (this.isBegin) {
            if (this.num == this.end) {
                this.isBegin = false;
                if (this.callback) this.callback();
                return;
            }
            let num = this.num + dt * this.speed;
            if (this.isInteger) num = Math.ceil(num);

              
            if (this.isEnd(num)) {
                num = this.end;
                this.isBegin = false;
                if (this.callback) this.callback();
            }
            this.num = num;
        }
    }
}