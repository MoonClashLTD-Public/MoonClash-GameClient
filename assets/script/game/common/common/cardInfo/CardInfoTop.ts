import { Label, _decorator, Node, Toggle } from "cc";
import { CardInfoBase } from "./CardInfoBase";

const { ccclass, property } = _decorator;
  
@ccclass('CardInfoTop')
export class CardInfoTop extends CardInfoBase {
    @property(Node)
    private maskNode: Node = null
    @property(Node)
    private hotNode: Node = null
    @property(Node)
    private assistNode = null
    @property(Node)
    private bindingNode = null
    init() { }

    openMask(b: boolean) {
        this.maskNode.active = b
    }

    openHot(b: boolean) {
        this.hotNode.active = b
    }

      
    openAssist(b: boolean) {
        // this.assistNode.active = b
    }

      
    openBinding(b: boolean) {
        this.bindingNode.active = b
    }
}