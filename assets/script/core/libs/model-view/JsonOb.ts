/**
 *                       ，
 *               ，                ，                
 */

const OP = Object.prototype;
const types = {
    obj: '[object Object]',
    array: '[object Array]'
}
const OAM = ['push', 'pop', 'shift', 'unshift', 'sort', 'reverse', 'splice'];

/**
 *                 
 */
export class JsonOb<T> {
    constructor(obj: T, callback: (newVal: any, oldVal: any, pathArray: string[]) => void) {
        if (OP.toString.call(obj) !== types.obj && OP.toString.call(obj) !== types.array) {
            console.error('                    ');
        }
        this._callback = callback;
        this.observe(obj);
    }

    private _callback;
      
    private observe<T>(obj: T, path?: any) {
        if (OP.toString.call(obj) === types.array) {
            this.overrideArrayProto(obj, path);
        }

        Object.keys(obj).forEach((key) => {
            let self = this;
            // @ts-ignore
            let oldVal = obj[key];
            let pathArray = path && path.slice();
            if (pathArray) {
                pathArray.push(key);
            }
            else {
                pathArray = [key];
            }
            Object.defineProperty(obj, key, {
                get: function () {
                    return oldVal;
                },
                set: function (newVal) {
                    //cc.log(newVal);
                    if (oldVal !== newVal) {
                        if (OP.toString.call(newVal) === '[object Object]') {
                            self.observe(newVal, pathArray);
                        }
                        self._callback(newVal, oldVal, pathArray);
                        oldVal = newVal;
                    }
                }
            })

            // @ts-ignore
            if (OP.toString.call(obj[key]) === types.obj || OP.toString.call(obj[key]) === types.array) {
                // @ts-ignore
                this.observe(obj[key], pathArray);
            }
        }, this)
    }

    /**
     *                       
     * @param array 
     * @param path 
     */
    private overrideArrayProto(array: any, path: any) {
          
        var originalProto = Array.prototype;
          
        var overrideProto = Object.create(Array.prototype);
        var self = this;
        var result;

          
        OAM.forEach((method: any) => {
            Object.defineProperty(overrideProto, method, {
                value: function () {
                    var oldVal = this.slice();
                      
                    result = originalProto[method].apply(this, arguments);
                      
                    self.observe(this, path);
                    self._callback(this, oldVal, path);
                    return result;
                }
            })
        });

          
        array['__proto__'] = overrideProto;
    }
}