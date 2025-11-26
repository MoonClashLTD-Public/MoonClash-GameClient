/*
   
   
 */

import { error, instantiate, Node, Prefab } from "cc";
import { resLoader } from "../../common/loader/ResLoader";
import { ViewParams } from "./Defines";
import { DelegateComponent } from "./DelegateComponent";
import { LayerUI } from "./LayerUI";
import { NotifyComponent } from "./NotifyComponent";

const ToastPrefabPath: string = 'common/prefab/notify';

export class LayerNotify extends LayerUI {
    /**
       
  
  
     */
    show(content: string, useI18n: boolean): void {
        var viewParams = new ViewParams();
        viewParams.uuid = this.getUuid(ToastPrefabPath);
        viewParams.prefabPath = ToastPrefabPath;
        viewParams.params = { content: content, useI18n: useI18n };
        viewParams.callbacks = {};
        viewParams.valid = true;

        this.ui_nodes.set(viewParams.uuid, viewParams);
        this.load(viewParams);
    }

    protected load(viewParams: ViewParams) {
          
        resLoader.load(viewParams.prefabPath, (err: Error | null, res: Prefab) => {
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

    protected createNode(prefab: Prefab, viewParams: ViewParams) {
        let childNode: Node = super.createNode(prefab, viewParams);
        let toastCom = childNode.getComponent(NotifyComponent)!;
        childNode.active = true;
        toastCom.toast(viewParams.params.content, viewParams.params.useI18n);
        return childNode;
    }
}