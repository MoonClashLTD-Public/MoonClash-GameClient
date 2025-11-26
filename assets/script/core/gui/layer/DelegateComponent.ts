import { Component, Node, _decorator } from "cc";
import { ViewParams } from "./Defines";

const { ccclass } = _decorator;

  
@ccclass('DelegateComponent')
export class DelegateComponent extends Component {
    viewParams: ViewParams | null = null;

    add() {
        let viewParams = this.viewParams!;

          
        this.applyComponentsFunction(this.node, "onAdded", viewParams.params);
        if (typeof viewParams.callbacks!.onAdded === "function") {
            viewParams.callbacks!.onAdded(this.node, viewParams.params);
        }
    }

      
    remove(isDestroy: boolean) {
        let viewParams = this.viewParams!;

        if (viewParams.valid) {
              
            this.applyComponentsFunction(this.node, "onBeforeRemove", viewParams.params);

              
            if (typeof viewParams.callbacks!.onBeforeRemove === "function") {
                viewParams.callbacks!.onBeforeRemove(
                    this.node,
                    () => {
                        this.removed(viewParams, isDestroy);
                    });
            }
            else {
                this.removed(viewParams, isDestroy);
            }
        }
    }

      
    private removed(viewParams: ViewParams, isDestroy: boolean) {
        viewParams.valid = false;

        if (typeof viewParams.callbacks!.onRemoved === "function") {
            viewParams.callbacks!.onRemoved(this.node, viewParams.params);
        }

        if (isDestroy)
            this.node.destroy();
        else
            this.node.removeFromParent();
    }

    onDestroy() {
        let viewParams = this.viewParams!;

          
        this.applyComponentsFunction(this.node, "onRemoved", viewParams.params);

          
        if (typeof viewParams.callbacks!.onRemoved === "function") {
            viewParams.callbacks!.onRemoved(this.node, viewParams.params);
        }

        this.viewParams = null;
    }

    protected applyComponentsFunction(node: Node, funName: string, params: any) {
        for (let i = 0; i < node.components.length; i++) {
            let component: any = node.components[i];
            let func = component[funName];
            if (func) {
                func.call(component, params);
            }
        }
    }
}