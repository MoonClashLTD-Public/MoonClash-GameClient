import { sys } from "cc";
// import { PREVIEW } from "cc/env";
import { md5 } from "../../libs/security/Md5";
import { EncryptUtil } from "./EncryptUtil";
let PREVIEW = true;
export module storage {
    let _key: string | null = 'client';
    let _iv: string | null = 'game';
    let _id: number = -1;

    // /**
      
      
      
    //  */
    // export function init(key: string, iv: string) {
    //     _key = md5(key);
    //     _iv = md5(iv);
    // }

    /**
       
     * @param id 
     */
    export function setUser(id: number) {
        _id = id;
    }

    /**
       
  
  
     * @returns 
     */
    export function set(key: string, value: any) {
        key = `${key}_${_id}`;

        if (null == key) {
            console.error("");
            return;
        }
        if (!PREVIEW) {
            key = md5(key);
        }
        if (null == value) {

            remove(key);
            return;
        }
        if (typeof value === 'function') {
            console.error("");
            return;
        }
        if (typeof value === 'object') {
            try {
                value = JSON.stringify(value);
            }
            catch (e) {
                console.error(` = ${value}`);
                return;
            }
        }
        else if (typeof value === 'number') {
            value = value + "";
        }
        if (!PREVIEW && null != _key && null != _iv) {
            try {
                value = EncryptUtil.aesEncrypt(`${value}`, _key, _iv);
            }
            catch (e) {
                value = null;
            }
        }
        sys.localStorage.setItem(key, value);
    }

    /**
       
  
  
     * @returns 
     */
    export function get(key: string, defaultValue?: any) {
        if (null == key) {
            console.error("");
            return;
        }

        key = `${key}_${_id}`;

        if (!PREVIEW) {
            key = md5(key);
        }
        let str: string | null = sys.localStorage.getItem(key);
        if (null != str && '' !== str && !PREVIEW && null != _key && null != _iv) {
            try {
                str = EncryptUtil.aesDecrypt(str, _key, _iv);
            }
            catch (e) {
                str = null;
            }

        }
        if (null == defaultValue || typeof defaultValue === 'string') {
            return str;
        }
        if (null === str) {
            return defaultValue;
        }
        if (typeof defaultValue === 'number') {
            return Number(str) || 0;
        }
        if (typeof defaultValue === 'boolean') {
            return "true" == str;   
        }
        if (typeof defaultValue === 'object') {
            try {
                return JSON.parse(str);
            }
            catch (e) {
                console.error(",str=" + str);
                return defaultValue;
            }

        }
        return str;
    }

    /**
       
  
     * @returns 
     */
    export function remove(key: string) {
        if (null == key) {
            console.error("");
            return;
        }

        key = `${key}_${_id}`;

        if (!PREVIEW) {
            key = md5(key);
        }
        sys.localStorage.removeItem(key);
    }

    /**
       
     */
    export function clear() {
        sys.localStorage.clear();
    }
}