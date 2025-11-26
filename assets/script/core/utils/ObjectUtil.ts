/**
   
 */
export default class ObjectUtil {
    /**
       
  
     */
    public static isObject(value: any): boolean {
        return Object.prototype.toString.call(value) === '[object Object]';
    }

    /**
       
  
     */
    public static deepCopy(target: any): any {
        if (target == null || typeof target !== 'object') {
            return target;
        }

        let result: any = null;

        if (target instanceof Date) {
            result = new Date();
            result.setTime(target.getTime());
            return result;
        }

        if (target instanceof Array) {
            result = [];
            for (let i = 0, length = target.length; i < length; i++) {
                result[i] = this.deepCopy(target[i]);
            }
            return result;
        }

        if (target instanceof Map) {
            result = new Map();
            for (var key of target.keys())
                result.set(key, this.deepCopy(target.get(key)));
            return result;
        } else if (target instanceof Object) {
            result = {};
            for (const key in target) {
                if (target.hasOwnProperty(key)) {
                    result[key] = this.deepCopy(target[key]);
                }
            }
            return result;
        }

    }

    /**
       
  
     */
    public static copy(target: object): object {
        return JSON.parse(JSON.stringify(target));
    }
}
