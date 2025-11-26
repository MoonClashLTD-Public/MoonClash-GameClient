import { director, log } from 'cc';
import { JsonOb } from './JsonOb';

const VM_EMIT_HEAD = 'VC:';
const DEBUG_SHOW_PATH = false;

  
function setValueFromPath(obj: any, path: string, value: any, tag: string | null = '') {
    let props = path.split('.');
    for (let i = 0; i < props.length; i++) {
        const propName = props[i];
        if (propName in obj === false) { console.error('[' + propName + '] not find in ' + tag + '.' + path); break; }
        if (i == props.length - 1) {
            obj[propName] = value;
        }
        else {
            obj = obj[propName];
        }
    }
}

  
function getValueFromPath(obj: any, path: string, def?: any, tag: string | null = ''): any {
    let props = path.split('.');
    for (let i = 0; i < props.length; i++) {
        const propName = props[i];
        if ((propName in obj === false)) { console.error('[' + propName + '] not find in ' + tag + '.' + path); return def; }
        obj = obj[propName];
    }
    if (obj === null || typeof obj === "undefined") obj = def;  
    return obj;
}

/**
 * ModelViewer  
 */
class ViewModel<T>{
    constructor(data: T, tag: string) {
        new JsonOb(data, this._callback.bind(this));
        this.$data = data;
        this._tag = tag;
    }

    public $data: T;

      
    private _tag: string | null = null;

      
    public active: boolean = true;

      
    public emitToRootPath: boolean = false;

      
    private _callback(n: any, o: any, path: string[]): void {
        if (this.active == true) {
            let name = VM_EMIT_HEAD + this._tag + '.' + path.join('.')
            if (DEBUG_SHOW_PATH) log('>>', n, o, path);
            director.emit(name, n, o, [this._tag].concat(path));                              

            if (this.emitToRootPath) director.emit(VM_EMIT_HEAD + this._tag, n, o, path);     

            if (path.length >= 2) {
                for (let i = 0; i < path.length - 1; i++) {
                    const e = path[i];
                      
                }
            }
        }
    }

      
    public setValue(path: string, value: any) {
        setValueFromPath(this.$data, path, value, this._tag);
    }

      
    public getValue(path: string, def?: any): any {
        return getValueFromPath(this.$data, path, def, this._tag);
    }
}

/**
 * VM      (  )
 */
class VMManager {
    private _mvs: Map<string, ViewModel<any>> = new Map<string, ViewModel<any>>();

    /**
     *       ，     VM   （           ）
     * @param data        
     * @param tag         (       VM，     )
     * @param activeRootObject        ，        ，     
     */
    add<T>(data: T, tag: string = 'global', activeRootObject: boolean = false) {
        let vm = new ViewModel<T>(data, tag);
        let has = this._mvs.get(tag);
        if (tag.includes('.')) {
            console.error('cant write . in tag:', tag);
            return;
        }
        if (has) {
            console.error('already set VM tag:' + tag);
            return;
        }

        vm.emitToRootPath = activeRootObject;

        this._mvs.set(tag, vm);
    }

    /**
     *        VM   
     * @param tag 
     */
    remove(tag: string) {
        this._mvs.delete(tag);
    }

    /**
     *        
     * @param tag   tag
     */
    get<T>(tag: string): ViewModel<T> | undefined {
        let res = this._mvs.get(tag);
        return res;
    }

    /**
     *       ,    VM        
     * @param path -       
     * @param value -       
     */
    addValue(path: string, value: any) {
        path = path.trim();  
        let rs = path.split('.');
        if (rs.length < 2) { console.error('Cant find path:' + path) };
        let vm = this.get(rs[0]);
        if (!vm) { console.error('Cant Set VM:' + rs[0]); return; };
        let resPath = rs.slice(1).join('.');
        vm.setValue(resPath, vm.getValue(resPath) + value);
    }

    /**
     *       ,    VM        
     * @param path -       
     * @param def -              
     */
    getValue(path: string, def?: any): any {
        path = path.trim();                   
        let rs = path.split('.');
        if (rs.length < 2) { console.error('Get Value Cant find path:' + path); return; };
        let vm = this.get(rs[0]);
        if (!vm) { console.error('Cant Get VM:' + rs[0]); return; };
        return vm.getValue(rs.slice(1).join('.'), def);
    }

    /**
     *       ,    VM        
     * @param path -       
     * @param value -       
     */
    setValue(path: string, value: any) {
        path = path.trim();                   
        let rs = path.split('.');
        if (rs.length < 2) { console.error('Set Value Cant find path:' + path); return; };
        let vm = this.get(rs[0]);
        if (!vm) { console.error('Cant Set VM:' + rs[0]); return; };
        vm.setValue(rs.slice(1).join('.'), value);

    }

    setObjValue = setValueFromPath;
    getObjValue = getValueFromPath;

      
    bindPath(path: string, callback: (...args: any) => void, target?: any, useCapture?: boolean): void {
        path = path.trim();                   
        if (path == '') {
            console.error(target.node.name, '         ');
            return;
        }
        if (path.split('.')[0] === '*') {
            console.error(path, '     ,        VMParent  onLoad   ,           VMParent        ');
            return;
        }
        director.on(VM_EMIT_HEAD + path, callback, target, useCapture);
    }

      
    unbindPath(path: string, callback: (...args: any) => void, target?: any): void {
        path = path.trim();  
        if (path.split('.')[0] === '*') {
            console.error(path, '     ,        VMParent  onLoad   ,           VMParent        ');
            return;
        }
        director.off(VM_EMIT_HEAD + path, callback, target);
    }

      
    inactive(): void {
        this._mvs.forEach(mv => {
            mv.active = false;
        })
    }

      
    active(): void {
        this._mvs.forEach(mv => {
            mv.active = false;
        })
    }
}

  

/**
 *  VM    ,    : 
 *  https://github.com/wsssheep/cocos_creator_mvvm_tools/blob/master/docs/ViewModelScript.md
 */
export let VM = new VMManager();