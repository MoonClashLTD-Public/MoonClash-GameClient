/*
   
 */

import { Camera, Layers, Node, warn, Widget } from "cc";
import { GUI } from "../GUI";
import { UICallbacks } from "./Defines";
import { DelegateComponent } from "./DelegateComponent";
import { LayerDialog } from "./LayerDialog";
import { LayerNotify } from "./LayerNotify";
import { LayerPopUp } from "./LayerPopup";
import { LayerUI } from "./LayerUI";
import { UIMap } from "./UIMap";

  
export enum LayerType {
      
    Game = "LayerGame",
      
    UI = "LayerUI",
      
    PopUp = "LayerPopUp",
      
    Dialog = "LayerDialog",
      
    Alert = "LayerAlert",
      
    Notify = "LayerNotify",
      
    Guide = "LayerGuide"
}

  
export interface UIConfig {
    bundle?: string;
      
    layer: LayerType;
      
    prefab: string;
}

export class LayerManager {
      
    public root!: Node;
      
    public camera!: Camera;
      
    public game!: Node;
      
    public guide!: Node;
      
    public uiMap!: UIMap;

      
    private ui!: LayerUI;
      
    private popup!: LayerPopUp;
      
    private dialog!: LayerDialog;
      
    private alert!: LayerDialog;
      
    private notify!: LayerNotify;
      
    private configs: { [key: number]: UIConfig } = {};

      
    public get portrait() {
        return this.root.getComponent(GUI)!.portrait;
    }

    /**
       
  
     */
    public init(configs: { [key: number]: UIConfig }): void {
        this.configs = configs;
    }

    /**
       
  
  
     */
    public toast(content: string, useI18n: boolean = false) {
        this.notify.show(content, useI18n)
    }

    /**
       
  
  
     */
    public setConfig(uiId: number, config: UIConfig): void {
        this.configs[uiId] = config;
    }

      
    public setUIMap(data: any) {
        if (this.uiMap == null) {
            this.uiMap = new UIMap();
        }
        this.uiMap.init(this, data);
    }

    /**
       
  
  
  
     * @returns 
     */
    public open<T>(uiId: number, uiArgs: T = null, callbacks?: UICallbacks): void {
        var config = this.configs[uiId];
        if (config == null) {

            return;
        }

        switch (config.layer) {
            case LayerType.UI:
                this.ui.add(config, uiArgs, callbacks);
                break;
            case LayerType.PopUp:
                this.popup.add(config, uiArgs, callbacks);
                break;
            case LayerType.Dialog:
                this.dialog.add(config, uiArgs, callbacks);
                break;
            case LayerType.Alert:
                this.alert.add(config, uiArgs, callbacks);
                break;
        }
    }

    /**
       
  
  
     * @returns 
     */
    public async openAsync<T>(uiId: number, uiArgs: T = null): Promise<Node | null> {
        return new Promise<Node | null>((resolve, reject) => {
            var callbacks: UICallbacks = {
                onAdded: (node: Node, params: any) => {
                    resolve(node)
                }
            };
            this.open(uiId, uiArgs, callbacks);
        });
    }

    public has(uiId: number) {
        var config = this.configs[uiId];
        if (config == null) {

            return;
        }

        var result = false;
        switch (config.layer) {
            case LayerType.UI:
                result = this.ui.has(config.prefab);
                break;
            case LayerType.PopUp:
                result = this.popup.has(config.prefab);
                break;
            case LayerType.Dialog:
                result = this.dialog.has(config.prefab);
                break;
            case LayerType.Alert:
                result = this.alert.has(config.prefab);
                break;
        }
        return result;
    }

    public remove(uiId: number, isDestroy = true) {
        var config = this.configs[uiId];
        if (config == null) {

            return;
        }

        switch (config.layer) {
            case LayerType.UI:
                this.ui.remove(config.prefab, isDestroy);
                break;
            case LayerType.PopUp:
                this.popup.remove(config.prefab, isDestroy);
                break;
            case LayerType.Dialog:
                this.dialog.remove(config.prefab, isDestroy);
                break;
            case LayerType.Alert:
                this.alert.remove(config.prefab, isDestroy);
                break;
        }
    }

      
    public removeByNode(node: Node, isDestroy: boolean = true) {
        if (node instanceof Node) {
            let comp = node.getComponent(DelegateComponent);
            if (comp && comp.viewParams) {
                  
                (node.parent as LayerUI).removeByUuid(comp.viewParams.uuid, isDestroy);
            }
            else {

                node.destroy();
            }
            return;
        }
    }

    public clear(isDestroy: boolean = false) {
        this.ui.clear(isDestroy);
        this.popup.clear(isDestroy);
        this.dialog.clear(isDestroy);
        this.alert.clear(isDestroy);
    }

    public constructor(root: Node) {
        this.root = root;
        this.camera = this.root.getComponentInChildren(Camera)!;

        this.game = this.create_node(LayerType.Game);

        this.ui = new LayerUI(LayerType.UI);
        this.popup = new LayerPopUp(LayerType.PopUp);
        this.dialog = new LayerDialog(LayerType.Dialog);
        this.alert = new LayerDialog(LayerType.Alert);
        this.notify = new LayerNotify(LayerType.Notify);

        this.guide = this.create_node(LayerType.Guide);

        root.addChild(this.game);
        root.addChild(this.ui);
        root.addChild(this.popup);
        root.addChild(this.dialog);
        root.addChild(this.alert);
        root.addChild(this.notify);
        root.addChild(this.guide);
    }

    private create_node(name: string) {
        var node = new Node(name);
        node.layer = Layers.Enum.UI_2D;
        var w: Widget = node.addComponent(Widget);
        w.isAlignLeft = w.isAlignRight = w.isAlignTop = w.isAlignBottom = true;
        w.left = w.right = w.top = w.bottom = 0;
        w.alignMode = 2;
        w.enabled = true;
        return node;
    }
}