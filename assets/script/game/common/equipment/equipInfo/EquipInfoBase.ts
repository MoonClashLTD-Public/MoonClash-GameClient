import { Component, ScrollView, UITransform, v2, v3, _decorator } from "cc";
import { PlayerManger } from "../../../data/playerManager";
import { ResManger } from "../../../data/resManger";
import { EquipmentPrefab } from "../EquipmentPrefab";

const { ccclass, property } = _decorator;

@ccclass('EquipInfoBase')
export class EquipInfoBase extends Component {
    protected get equipmentPrefab() {
        return this.node.parent.getComponent(EquipmentPrefab);
    }
    protected get playerManager() {
        return PlayerManger.getInstance()
    }

    protected get resManger() {
        return ResManger.getInstance()
    }

    start() { }
    init() { }
}