/*
 * @CreateTime: May 30, 2018 9:35 AM
 * @Author: dgflash
 * @Contact: dgflash@qq.com
 * @Last Modified By: dgflash
 * @Last Modified Time: May 26, 2020 2:04 PM
 * @Description: HTTP
 */

import { error, warn } from "cc";
import { netConfig } from "../../game/common/net/NetConfig";
import { md5 } from "../libs/security/Md5";
import { oops } from "../Oops";

  
let DevToken = {
    1: "743b65cdd863157a53d9cbd1b825f656",
    2: "",
    99: "92073d2fe26e543ce222cc0fb0b7d7a0",
}

var urls: any = {};                        
var reqparams: any = {};                   

export enum HttpEvent {
    NO_NETWORK = "http_request_no_network",                    
    UNKNOWN_ERROR = "http_request_unknown_error",              
    TIMEOUT = "http_request_timout"                            
}

export class HttpRequest {
      
    public server: string = "";
      
    public webJwt: string = "";
      
    public timeout: number = 10000;

    /**
  
       
     * 
     * Get
        var complete = function(response){
            LogWrap.log(response);
        }
        var error = function(response){
            LogWrap.log(response);
        }
        this.get(name, complete, error);
    */
    public get(name: string, completeCallback: Function, errorCallback: Function) {
        this.sendRequest(name, null, false, completeCallback, errorCallback)
    }
    public getAsync(name: string) {
        return new Promise((resolve: (value: unknown) => void, reject: (value: unknown) => void) => {
            this.sendRequest(name, null, false, resolve, reject);
        });
    }
    public getWithParams(name: string, params: any, completeCallback: Function, errorCallback: Function) {
        this.sendRequest(name, params, false, completeCallback, errorCallback)
    }

    public getByArraybuffer(name: string, completeCallback: Function, errorCallback: Function) {
        this.sendRequest(name, null, false, completeCallback, errorCallback, 'arraybuffer', false);
    }
    public getWithParamsByArraybuffer(name: string, params: any, completeCallback: Function, errorCallback: Function) {
        this.sendRequest(name, params, false, completeCallback, errorCallback, 'arraybuffer', false);
    }

    /** 
  
       
     *      
     * Post
        var param = '{"LoginCode":"donggang_dev","Password":"e10adc3949ba59abbe56e057f20f883e"}'
        var complete = function(response){
                var jsonData = JSON.parse(response);
                var data = JSON.parse(jsonData.Data);
            LogWrap.log(data.Id);
        }
        var error = function(response){
            LogWrap.log(response);
        }
        this.post(name, param, complete, error);
    */
    public post(name: string, params: any, completeCallback?: Function, errorCallback?: Function) {
        this.sendRequest(name, params, true, completeCallback, errorCallback);
    }
    public postAsync(name: string, params: any) {
        return new Promise((resolve: (value: unknown) => void, reject: (value: unknown) => void) => {
            this.sendRequest(name, params, true, resolve, reject);
        });
    }

      
    public abort(name: string) {
        var xhr = urls[this.server + name];
        if (xhr) {
            xhr.abort();
        }
    }

    /**
       
     */
    private getParamString(params: any) {
        var result = "";
        for (var name in params) {
            let data = params[name];
            if (data instanceof Object) {
                for (var key in data)
                    result += `${key}=${data[key]}&`;
            }
            else {
                result += `${name}=${data}&`;
            }
        }

        return result.substr(0, result.length - 1);
    }

    /** 
  
  
  
  
  
  
  
     */
    private sendRequest(name: string,
        params: any,
        isPost: boolean,
        completeCallback?: Function,
        errorCallback?: Function,
        responseType?: string,
        isOpenTimeout = true,
        timeout: number = this.timeout) {
        if (name == null || name == '') {
            error("");
            return;
        }

        var url: string, newUrl: string, paramsStr: string;
        if (name.toLocaleLowerCase().indexOf("http") == 0) {
            url = name;
        }
        else {
            url = this.server + name;
        }

        if (isPost) {
            paramsStr = params;
        } else if (params) {
            paramsStr = this.getParamString(params);
            if (url.indexOf("?") > -1)
                newUrl = url + "&" + paramsStr;
            else
                newUrl = url + "?" + paramsStr;
        } else {
            newUrl = url;
        }

        if (urls[newUrl] != null && reqparams[newUrl] == paramsStr!) {

            return;
        }

        var xhr = new XMLHttpRequest();

          
        urls[newUrl] = xhr;
        reqparams[newUrl] = paramsStr!;

        if (isPost) {
            xhr.open("POST", url);
        }
        else {
            xhr.open("GET", newUrl);
        }

        // xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
        xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        if (this.webJwt)
            xhr.setRequestHeader("Authorization", `Bearer ${this.webJwt}`);
        if (name == "/auth/auth_by_id")
            xhr.setRequestHeader("X-DevToken", md5(params.id + DevToken[netConfig.channelid]));

        var data: any = {};
        data.url = url;
        data.params = params;

          
        if (isOpenTimeout) {
            xhr.timeout = timeout;
            xhr.ontimeout = () => {
                this.deleteCache(newUrl);

                data.event = HttpEvent.TIMEOUT;

                if (errorCallback) errorCallback(data);
            }
        }

        xhr.onloadend = (a) => {
            if (xhr.status == 500) {
                this.deleteCache(newUrl);

                if (errorCallback == null) return;

                data.event = HttpEvent.NO_NETWORK;            

                if (errorCallback) errorCallback(data);
            }
        }

        xhr.onerror = () => {
            this.deleteCache(newUrl);

            if (errorCallback == null) return;

            if (xhr.readyState == 0 || xhr.readyState == 1 || xhr.status == 0) {
                data.event = HttpEvent.NO_NETWORK;            
            }
            else {
                data.event = HttpEvent.UNKNOWN_ERROR;         
            }

            if (errorCallback) errorCallback(data);
        };

        xhr.onreadystatechange = () => {
            if (xhr.readyState != 4) return;

            this.deleteCache(newUrl);

            if (xhr.status == 200) {
                if (completeCallback) {
                    if (responseType == 'arraybuffer') {
                          
                        xhr.responseType = responseType;
                        if (completeCallback) completeCallback(xhr.response);
                    }
                    else {
                          
                        var data: any = JSON.parse(xhr.response);
                        if (data.code != null) {
                            // let exclude = {
                            //     [errcode.ErrCode.WaitComplete]: true
                              
                              
                            if (data.code == 0) {
                                if (completeCallback) completeCallback(data.data);
                            } else {
                                if (errorCallback) errorCallback(data);
                            }
                            this.tips(xhr.responseURL, data.code);
                        }
                        else {
                            if (completeCallback) completeCallback(data);
                        }
                    }
                }
            } else if (xhr.status != 0) {
                if (errorCallback) errorCallback({ code: -1, message: `http error xhr.status ${xhr.status}` });
            }
        };

        if (params == null || params == "") {
            xhr.send();
        }
        else {
              
            xhr.send(JSON.stringify(params));
        }
    }

    private deleteCache(url: string) {
        delete urls[url];
        delete reqparams[url];
    }

    notTips = [errcode.ErrCode.QuestionTodayCompleted];
    private tips(url: string, code: number) {
        if (this.notTips.indexOf(code) != -1) {   
            return;
        }
        if (code > 0) {
            if (code == errcode.ErrCode.Failed && url.search("/gas/") != -1) {
                  
                oops.gui.toast("tip_gas_err", true);
            } else {
                oops.gui.toast(`_err_${code}`, true);
            }
        }
    }
}