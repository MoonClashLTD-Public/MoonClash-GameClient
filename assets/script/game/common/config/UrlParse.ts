import { sys } from "cc";

/*
   
 */
export class UrlParse {
    private _data: any = null;

      
    public get query(): any {
        return this._data;
    }

    constructor() {
        if (!sys.isBrowser) {
            this._data = {};
            return;
        }
        this._data = this.parseUrl();
    }

    private parseUrl() {
        if (typeof window !== "object") {
            return {};
        }
        if (!window.document) {
            return {};
        }
        let url = window.document.location.href.toString();
        let u = url.split("?");
        if (typeof (u[1]) == "string") {
            u = u[1].split("&");
            let get: any = {};
            for (let i = 0, l = u.length; i < l; ++i) {
                let j = u[i].split("=");
                get[j[0]] = j[1];
            }
            return get;
        }
        else {
            return {};
        }
    }
}