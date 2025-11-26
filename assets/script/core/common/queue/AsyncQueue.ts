import { log, warn } from "cc";

export type NextFunction = (nextArgs?: any) => void;

export type AsyncCallback = (next: NextFunction, params: any, args: any) => void;

interface AsyncTask {
    /**
       
     */
    uuid: number;
    /**
        
  
  
      */
    callbacks: Array<AsyncCallback>;
    /**
        
      */
    params: any
}

export class AsyncQueue {
      
    private _runningAsyncTask: AsyncTask | null = null;

      
    private static _$uuid_count: number = 1;

    private _queues: Array<AsyncTask> = [];

    public get queues(): Array<AsyncTask> {
        return this._queues;
    }
      
    private _isProcessingTaskUUID: number = 0;

    private _enable: boolean = true;
    /**
       
     */
    public get enable() {
        return this._enable;
    }
    /**
       
     */
    public set enable(val: boolean) {
        if (this._enable === val) {
            return;
        }
        this._enable = val;
        if (val && this.size > 0) {
            this.play();
        }
    }

    /**
       
     */
    public complete: Function | null = null;

    /**
  
       
     */
    public push(callback: AsyncCallback, params: any = null): number {
        let uuid = AsyncQueue._$uuid_count++;
        this._queues.push({
            uuid: uuid,
            callbacks: [callback],
            params: params
        })
        return uuid;
    }

    /**
  
       
     */
    public pushMulti(params: any, ...callbacks: AsyncCallback[]): number {
        let uuid = AsyncQueue._$uuid_count++;
        this._queues.push({
            uuid: uuid,
            callbacks: callbacks,
            params: params
        })
        return uuid;
    }

      
    public remove(uuid: number) {
        if (this._runningAsyncTask?.uuid === uuid) {

            return;
        }
        for (let i = 0; i < this._queues.length; i++) {
            if (this._queues[i].uuid === uuid) {
                this._queues.splice(i, 1);
                break;
            }
        }
    }

    /**
       
     */
    public get size(): number {
        return this._queues.length;
    }

    /**
       
     */
    public get isProcessing(): boolean {
        return this._isProcessingTaskUUID > 0;
    }

    /**
       
     */
    public get isStop(): boolean {
        if (this._queues.length > 0) {
            return false;
        }
        if (this.isProcessing) {
            return false;
        }
        return true;
    }

      
    public get runningParams() {
        if (this._runningAsyncTask) {
            return this._runningAsyncTask.params;
        }
        return null;
    }

    /**
       
     */
    public clear() {
        this._queues = [];
        this._isProcessingTaskUUID = 0;
        this._runningAsyncTask = null;
    }

    protected next(taskUUID: number, args: any = null) {
        if (this._isProcessingTaskUUID === taskUUID) {
            this._isProcessingTaskUUID = 0;
            this._runningAsyncTask = null;
            this.play(args);
        }
        else {
            if (this._runningAsyncTask) {
                log(this._runningAsyncTask);
            }
        }
    }

    /**
       
     */
    public step() {
        if (this.isProcessing) {
            this.next(this._isProcessingTaskUUID);
        }
    }

    /**
       
     */
    public play(args: any = null) {
        if (this.isProcessing) {
            return;
        }

        if (!this._enable) {
            return;
        }

        let actionData: AsyncTask = this._queues.shift()!;
        if (actionData) {
            this._runningAsyncTask = actionData;
            let taskUUID: number = actionData.uuid;
            this._isProcessingTaskUUID = taskUUID;
            let callbacks: Array<AsyncCallback> = actionData.callbacks;

            if (callbacks.length == 1) {
                let nextFunc: NextFunction = (nextArgs: any = null) => {
                    this.next(taskUUID, nextArgs);
                }
                callbacks[0](nextFunc, actionData.params, args);
            }
            else {
                  
                let fnum: number = callbacks.length;
                let nextArgsArr: any[] = [];
                let nextFunc: NextFunction = (nextArgs: any = null) => {
                    --fnum;
                    nextArgsArr.push(nextArgs || null);
                    if (fnum === 0) {
                        this.next(taskUUID, nextArgsArr);
                    }
                }
                let knum = fnum;
                for (let i = 0; i < knum; i++) {
                    callbacks[i](nextFunc, actionData.params, args);
                }
            }
        }
        else {
            this._isProcessingTaskUUID = 0;
            this._runningAsyncTask = null;
              
            if (this.complete) {
                this.complete(args);
            }
        }
    }

    /**
  
  
  
     */
    public yieldTime(time: number, callback: Function | null = null) {
        let task = function (next: Function, params: any, args: any) {
            let _t = setTimeout(() => {
                clearTimeout(_t);
                if (callback) {
                    callback();
                }
                next(args);
            }, time);
        }
        this.push(task, { des: "AsyncQueue.yieldTime" });
    }

    /**
       
     * @param count 
     * @param next 
  
     */
    public static excuteTimes(count: number, next: Function | null = null): Function {
        let fnum: number = count;
        let tempCall = () => {
            --fnum;
            if (fnum === 0) {
                next && next();
            }
        }
        return tempCall;
    }
}