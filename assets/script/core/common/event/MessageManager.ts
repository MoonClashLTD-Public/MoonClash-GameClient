import { log, warn } from "cc";

class EventData {
    public event!: string;
    public listener!: (event: string, args: any) => void;
    public obj: any;
}

/**
 * 、
 */
export class MessageEventData {
    private events: any = {};

    on(event: string, listener: (event: string, args: any) => void, thisObj: object) {
        let list: Array<EventData> = this.events[event];
        if (list == null) {
            list = [];
            this.events[event] = list;
        }
        let data: EventData = new EventData();
        data.event = event;
        data.listener = listener;
        data.obj = thisObj;
        list.push(data);

        Message.on(event, listener, thisObj);
    }

    off(event: string) {
        let ebs: Array<EventData> = this.events[event];
        if (!ebs) {
            return;
        }
        for (let eb of ebs) {
            Message.off(event, eb.listener, eb.obj);
        }
        delete this.events[event];
    }

    dispatchEvent(event: string, arg: any = null) {
        Message.dispatchEvent(event, arg);
    }

    removes() {
        for (let event in this.events) {
            this.off(event);
        }
    }
}

class MessageManager {
    public static readonly Instance: MessageManager = new MessageManager();

    private events: any = {};

    /**
     * 
     * @param event(string)      
     * @param listener(function) 
     * @param thisObj(object)    this
     */
    on(event: string, listener: (event: string, args: any) => void, thisObj: object) {
        if (!event || !listener) {
            return;
        }

        let list: Array<EventData> = this.events[event];
        if (list == null) {
            list = [];
            this.events[event] = list;
        }

        let length = list.length;
        for (let i = 0; i < length; i++) {
            let bin = list[i];
            if (bin.listener == listener && bin.obj == thisObj) {

                return;
            }
        }


        let data: EventData = new EventData();
        data.event = event;
        data.listener = listener;
        data.obj = thisObj;
        list.push(data);
    }

    /**
     * ，，
     * @param event 
     * @param listener 
     * @param thisObj 
     */
    once(event: string, listener: (event: string, args: any) => void, thisObj: object) {
        let _listener: any = ($event: string, $args: any) => {
            this.off(event, _listener, thisObj);
            _listener = null;
            listener.call(thisObj, $event, $args);
        }
        this.on(event, _listener, thisObj);
    }

    /**
     * 
     * @param event(string)      
     * @param listener(function) 
     * @param thisObj(object)    this
     */
    off(event: string, listener: Function, thisObj: object) {
        let list: Array<EventData> = this.events[event];

        if (!list) {
            log(`【${event}】`);
            return;
        }


        let length = list.length;
        for (let i = 0; i < length; i++) {
            let bin: EventData = list[i];
            if (bin.listener == listener && bin.obj == thisObj) {
                list.splice(i, 1);
                break;
            }
        }

        if (list.length == 0) {
            delete this.events[event];
        }
    }

    /** 
     *  
     * @param event(string)      
     * @param arg(any)           
     */
    dispatchEvent(event: string, arg: any = null) {
        let list: Array<EventData> = this.events[event];

        if (list != null) {
            let temp: Array<EventData> = list.concat();
            let length = temp.length;
            for (let i = 0; i < length; i++) {
                let eventBin = temp[i];
                eventBin.listener.call(eventBin.obj, event, arg);
            }
        }
    }
}

export const Message = MessageManager.Instance;