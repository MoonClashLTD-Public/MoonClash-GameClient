import { Component } from "cc";
import { EventDispatcher } from "../event/EventDispatcher";

export const guid = function () {
    let guid: string = "";
    for (let i = 1; i <= 32; i++) {
        let n = Math.floor(Math.random() * 16.0).toString(16);
        guid += n;
        if ((i == 8) || (i == 12) || (i == 16) || (i == 20))
            guid += "-";
    }
    return guid;
}

export class TimerManager extends EventDispatcher {
    private static times: any = {};
    private schedules: any = {};
    private _scheduleCount: number = 1;

    private initTime: number = (new Date()).getTime();        
    private component: Component;

      
    private _$serverTimeElasped: number = 0;

    constructor(component: Component) {
        super();
        this.component = component;
        this.schedule(this.onUpdate.bind(this), 1);
    }
    /**
       
     * @param val 
     */
    public serverTimeElasped(val?: number): number {
        if (val) {
            this._$serverTimeElasped = val;
        }
        return this._$serverTimeElasped;
    }

    /**
       
     * @param format 
     * @param date 
     */
    public format(format: string, date: Date): string {
        let o: any = {
            "M+": date.getMonth() + 1,                      // month 
            "d+": date.getDate(),                           // day 
            "h+": date.getHours(),                          // hour 
            "m+": date.getMinutes(),                        // minute 
            "s+": date.getSeconds(),                        // second 
            "q+": Math.floor((date.getMonth() + 3) / 3),    // quarter 
            "S": date.getMilliseconds()                     // millisecond 
        }
        if (/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        }

        for (let k in o) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
            }
        }
        return format;
    }

      
    public getTime(): number {
        return this.getLocalTime() - this.initTime;
    }

      
    public getLocalTime(): number {
        return Date.now();
    }

    public schedule(callback: Function, interval: number): string {
        let UUID = `schedule_${this._scheduleCount++}`
        this.schedules[UUID] = callback;
        this.component.schedule(callback, interval);
        return UUID;
    }

    public scheduleOnce(callback: Function, delay: number = 0): string {
        let UUID = `scheduleOnce_${this._scheduleCount++}`;
        this.schedules[UUID] = callback;
        this.component.scheduleOnce(() => {
            let cb = this.schedules[UUID];
            if (cb) {
                cb();
            }
            this.unschedule(UUID);
        }, Math.max(delay, 0));
        return UUID;
    }

    public unschedule(uuid: string) {
        let cb = this.schedules[uuid];
        if (cb) {
            this.component.unschedule(cb);
            delete this.schedules[uuid];
        }
    }

    public unscheduleAllCallbacks() {
        for (let k in this.schedules) {
            this.component.unschedule(this.schedules[k]);
        }
        this.schedules = {};
    }

    onUpdate(dt: number) {
          
        for (let key in TimerManager.times) {
            let data = TimerManager.times[key];
            if (data.object[data.field] > 0) {
                data.object[data.field]--;

                if (data.object[data.field] == 0) {
                    this.timerComplete(data);
                }
                else {                               
                    if (data.onSecond) {
                        data.onSecond.call(data.object);                          
                    }
                }
            }
        }
    }

      
    public save() {
        for (let key in TimerManager.times) {
            TimerManager.times[key].startTime = this.getTime();
        }
    }

      
    public load() {
        for (let key in TimerManager.times) {
            let interval = Math.floor((this.getTime() - (TimerManager.times[key].startTime || this.getTime())) / 1000);
            let data = TimerManager.times[key];
            data.object[data.field] = data.object[data.field] - interval;
            if (data.object[data.field] < 0) {
                data.object[data.field] = 0;
                this.timerComplete(data);
            }
            TimerManager.times[key].startTime = null;
        }
    }

      
    private timerComplete(data: any) {
        if (data.onComplete) data.onComplete.call(data.object);
        if (data.event) this.dispatchEvent(data.event);
    }

      
    public registerObject(object: any, field: string, onSecond: Function, onComplete: Function) {
        let data: any = {};
        data.id = guid();
        data.object = object;                                     
        data.field = field;                                       
        data.onSecond = onSecond;                                 
        data.onComplete = onComplete;                             
        TimerManager.times[data.id] = data;
        return data.id;
    }

      
    public unRegisterObject(id: string) {
        if (TimerManager.times[id])
            delete TimerManager.times[id];
    }

    /** 
       
  
  
  
     */
    public register(event: string, object: any, field: Array<string>) {
        let data: any = {};
        data.id = event;
        data.event = event;                                   
        data.object = object;                                 
        data.field = field;                                   
        TimerManager.times[data.id] = data;
    }

      
    public unRegister(event: string) {
        if (TimerManager.times[event])
            delete TimerManager.times[event];
    }
}

  
export class Timer {
    public callback: Function | null = null;

    private _elapsedTime: number = 0;

    public get elapsedTime(): number {
        return this._elapsedTime;
    }

    private _step: number = 0;
      
    get step(): number {
        return this._step;
    }
    set step(step: number) {
        this._step = step;                       
        this._elapsedTime = 0;                   
    }

    public get progress(): number {
        return this._elapsedTime / this._step;
    }

    constructor(step: number = 0) {
        this.step = step;
    }

    public update(dt: number) {
        this._elapsedTime += dt;

        if (this._elapsedTime >= this._step) {
            this._elapsedTime -= this._step;
            this.callback?.call(this);
            return true;
        }
        return false;
    }

    public reset() {
        this._elapsedTime = 0;
    }
}