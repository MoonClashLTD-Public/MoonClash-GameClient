
import { error, instantiate, isValid, Node, Prefab, resources, warn, Widget } from "cc";
import { resLoader } from "../../common/loader/ResLoader";
import { UICallbacks, ViewParams } from "./Defines";
import { DelegateComponent } from "./DelegateComponent";
import { UIConfig } from "./LayerManager";

export class LayerUI extends Node {
      
    protected ui_nodes = new Map<string, ViewParams>();
      
    protected ui_cache = new Map<string, ViewParams>();

    /**
     * 
  
  
     */
    constructor(name: string) {
        super(name);

        var widget: Widget = this.addComponent(Widget);
        widget.isAlignLeft = widget.isAlignRight = widget.isAlignTop = widget.isAlignBottom = true;
        widget.left = widget.right = widget.top = widget.bottom = 0;
        widget.alignMode = 2;
        widget.enabled = true;
    }

      
    protected getUuid(prefabPath: string): string {
        var uuid = `${this.name}_${prefabPath}`;
        return uuid.replace(/\//g, "_");
    }

    /**
       
  
  
  
     */
    add(config: UIConfig, params?: any, callbacks?: UICallbacks): string {
        let prefabPath = config.prefab;
        var uuid = this.getUuid(prefabPath);
        var viewParams = this.ui_nodes.get(uuid);

        if (viewParams && viewParams.valid) {

            return "";
        }

        if (viewParams == null) {
            viewParams = new ViewParams();
            viewParams.uuid = uuid;
            viewParams.prefabPath = prefabPath;
            this.ui_nodes.set(viewParams.uuid, viewParams);
        }

        viewParams.params = params || {};
        viewParams.callbacks = callbacks || {};
        viewParams.valid = true;

        this.load(viewParams, config.bundle)

        return uuid;
    }

    /**
       
  
  
     */
    protected load(viewParams: ViewParams, bundle?: string) {
        var vp: ViewParams = this.ui_nodes.get(viewParams.uuid)!;
        if (vp && vp.node) {
            this.createNode(null, vp);
        }
        else {
              
            bundle = bundle || resources.name;
            resLoader.load(bundle, viewParams.prefabPath, (err: Error | null, res: Prefab) => {
                if (err) {
                    error(err);
                }

                let childNode: Node = instantiate(res);
                viewParams.node = childNode;

                let comp: DelegateComponent = childNode.addComponent(DelegateComponent);
                comp.viewParams = viewParams;

                this.createNode(res, viewParams);
            });
        }
    }

    /**
       
     * @param prefab 
     * @param viewParams 
     */
    protected createNode(prefab: Prefab | null, viewParams: ViewParams) {
        viewParams.valid = true;
        let childNode: Node | null = viewParams!.node!;
        let comp: DelegateComponent | null = childNode.getComponent(DelegateComponent);
        childNode.parent = this;
        comp!.add();

        return childNode;
    }

    /**
       
     * @param prefabPath 
     */
    remove(prefabPath: string, isDestroy: boolean): void {
          
        if (isDestroy) this.removeCache(prefabPath);

          
        let children = this.__nodes();
        for (let i = 0; i < children.length; i++) {
            let viewParams = children[i].viewParams!;
            if (viewParams.prefabPath === prefabPath) {
                if (isDestroy) {
                      
                    this.ui_nodes.delete(viewParams.uuid);
                }
                else {
                      
                    this.ui_cache.set(viewParams.prefabPath, viewParams);
                }

                children[i].remove(isDestroy);
                viewParams.valid = false;
            }
        }
    }

    /**
       
       
     * @param uuid 
     */
    protected removeByUuid(uuid: string, isDestroy: boolean): void {
        var viewParams = this.ui_nodes.get(uuid);
        if (viewParams) {
            if (isDestroy)
                this.ui_nodes.delete(viewParams.uuid);

            var childNode = viewParams.node;
            var comp = childNode!.getComponent(DelegateComponent)!;
            comp.remove(isDestroy);
        }
    }

    /** 
       
       
     */
    private removeCache(prefabPath: string) {
        let viewParams = this.ui_cache.get(prefabPath);
        if (viewParams && viewParams.valid == false) {
            var childNode = viewParams.node;
            childNode!.getComponent(DelegateComponent)!.remove(true);
            this.ui_nodes.delete(viewParams.uuid);
            this.ui_cache.delete(prefabPath);
        }
    }

    /**
       
     * @param uuid 
     */
    getByUuid(uuid: string): Node | null {
        let children = this.__nodes();
        for (let comp of children) {
            if (comp.viewParams && comp.viewParams.uuid === uuid) {
                return comp.node;
            }
        }
        return null;
    }

    /**
       
     * @param prefabPath 
     */
    get(prefabPath: string): Array<Node> {
        let arr: Array<Node> = [];
        let children = this.__nodes();
        for (let comp of children) {
            if (comp.viewParams!.prefabPath === prefabPath) {
                arr.push(comp.node);
            }
        }
        return arr;
    }

    /**
       
  
     */
    has(prefabPathOrUUID: string): boolean {
        let children = this.__nodes();
        for (let comp of children) {
            if (comp.viewParams!.uuid === prefabPathOrUUID || comp.viewParams!.prefabPath === prefabPathOrUUID) {
                return true;
            }
        }
        return false;
    }

    /**
       
  
     */
    find(prefabPathReg: RegExp): Node[] {
        let arr: Node[] = [];
        let children = this.__nodes();
        for (let comp of children) {
            if (prefabPathReg.test(comp.viewParams!.prefabPath)) {
                arr.push(comp.node);
            }
        }
        return arr;
    }

      
    protected __nodes(): Array<DelegateComponent> {
        let result: Array<DelegateComponent> = [];
        let children = this.children;
        for (let i = 0; i < children.length; i++) {
            let comp = children[i].getComponent(DelegateComponent);
            if (comp && comp.viewParams && comp.viewParams.valid && isValid(comp)) {
                result.push(comp);
            }
        }
        return result;
    }

      
    size(): number {
        return this.children.length;
    }

      
    clear(isDestroy: boolean): void {
          
        this.ui_nodes.forEach((value: ViewParams, key: string) => {
            this.removeByUuid(value.uuid, isDestroy);
            value.valid = false;
        });
        this.ui_nodes.clear();

          
        if (isDestroy) {
            this.ui_cache.forEach((value: ViewParams, prefabPath: string) => {
                this.removeCache(prefabPath);
            });
        }
    }
}