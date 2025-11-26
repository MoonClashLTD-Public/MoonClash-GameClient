import { MessageEventData } from "./MessageManager";

/*
 * ，
 */
export class EventDispatcher {
    protected _msg: MessageEventData | null = null;

    /**
     * 
     * @param event(string)      
     * @param listener(function) 
     * @param thisObj(object)    this
     */
    public on(event: string, listener: (event: string, args: any) => void, thisObj: any) {
        if (this._msg == null) {
            this._msg = new MessageEventData();
        }
        this._msg.on(event, listener, thisObj);
    }

    /**
     * 
     * @param event(string)      
     * @param listener(function) 
     * @param thisObj(object)    this
     */
    public off(event: string) {
        if (this._msg) {
            this._msg.off(event);
        }
    }

    /** 
     *  
     * @param event(string)      
     * @param arg(Array)         
     */
    public dispatchEvent(event: string, arg: any = null) {
        if (this._msg == null) {
            this._msg = new MessageEventData();
        }
        this._msg.dispatchEvent(event, arg);
    }
    /**
     * 
     */
    public destroy() {
        if (this._msg) {
            this._msg.removes();
        }
        this._msg = null;
    }
}