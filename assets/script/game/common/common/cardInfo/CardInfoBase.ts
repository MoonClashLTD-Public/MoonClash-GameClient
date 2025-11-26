import { Component, ScrollView, UITransform, v2, v3, _decorator } from "cc";
import { PlayerManger } from "../../../data/playerManager";
import { ResManger } from "../../../data/resManger";
import { CardPrefab } from "../CardPrefab";

const { ccclass, property } = _decorator;

@ccclass('CardInfoBase')
export class CardInfoBase extends Component {
    protected get cardInfoPrefab() {
        return this.node.parent.getComponent(CardPrefab);
    }
    protected get playerManager() {
        return PlayerManger.getInstance()
    }

    protected get cardManager() {
        return PlayerManger.getInstance().cardManager.playCard
    }

    protected get cardGroupManager() {
        return PlayerManger.getInstance().cardManager.playCardGroup
    }

    start() { }
    init() { }
}