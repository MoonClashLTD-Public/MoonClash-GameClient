import { _decorator, Sprite, Node } from "cc";
import { EquipInfoBase } from "./EquipInfoBase";

const { ccclass, property } = _decorator;
  
@ccclass('EquipInfoTop')
export class EquipInfoTop extends EquipInfoBase {
    @property(Node)
    private maskNode: Node = null
    @property(Node)
    private hotNode: Node = null
    init() { }

    openMask(b: boolean) {
        this.maskNode.active = b
    }

    openHot(b: boolean) {
        this.hotNode.active = b
    }
}