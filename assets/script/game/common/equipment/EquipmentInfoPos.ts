import { Component, Rect, ScrollView, UITransform, v2, v3, _decorator } from "cc";
import { EquipmentInfoPrefab } from "./EquipmentInfoPrefab";

const { ccclass, property } = _decorator;

@ccclass('EquipmentInfoPos')
export class EquipmentInfoPos extends Component {
    private get equipmentInfoPrefab() {
        return this.node.getComponent(EquipmentInfoPrefab);
    }

    update() {
        this.updatePos()
    }
      
    private updatePos() {
        if (!this.node.active) return
        if (this.equipmentInfoPrefab.tagetNode) {
            let pos = this.equipmentInfoPrefab.tagetNode.getWorldPosition();
            let h1 = this.equipmentInfoPrefab.cardInfo.node.getComponent(UITransform).height / 2;
            let y2 = this.node.getComponent(UITransform).height / 2 - h1;
            this.node.setWorldPosition(v3(pos.x, pos.y - y2 + 20 + this.equipmentInfoPrefab.offsetH, pos.z));
        }
    }

      
    init() {
        this.updatePos()
        if (this.equipmentInfoPrefab.sv) {
            if (!this.equipmentInfoPrefab.sv.node.hasEventListener(ScrollView.EventType.SCROLL_ENDED, this.onScrollEnd, this)) {
                this.equipmentInfoPrefab.sv.node.on(ScrollView.EventType.SCROLL_ENDED, this.onScrollEnd, this)
            }
            if (!this.equipmentInfoPrefab.sv.node.hasEventListener(ScrollView.EventType.SCROLLING, this.onScrolling, this)) {
                this.equipmentInfoPrefab.sv.node.on(ScrollView.EventType.SCROLLING, this.onScrolling, this)
            }
            this._checkScroll()
        }
    }

    onDestroy() {
        if (this.equipmentInfoPrefab.sv) {
            this.equipmentInfoPrefab.sv.node.off(ScrollView.EventType.SCROLL_ENDED, this.onScrollEnd, this);
            this.equipmentInfoPrefab.sv.node.off(ScrollView.EventType.SCROLLING, this.onScrolling, this);
        }
    }

      
    private _checkScroll() {
        if (this.equipmentInfoPrefab.sv && this.equipmentInfoPrefab.tagetNode) {
            this.equipmentInfoPrefab.sv.content.active = false;
            let svRect = this.equipmentInfoPrefab.sv.node.getComponent(UITransform).getBoundingBoxToWorld();
            let _UITransform = this.node.getComponent(UITransform);
            let rect = new Rect()
            rect.x = svRect.width / 2;
            rect.y = this.node.getWorldPosition().y - _UITransform.height * _UITransform.anchorY;
            rect.height = _UITransform.height;
            rect.width = _UITransform.width;

            if (svRect.containsRect(rect) == false) {
                let h = 0;
                if (svRect.y > rect.y) {   
                    h = svRect.y - rect.y;
                } else {   
                    h = -((rect.y + rect.height) - (svRect.y + svRect.height));
                }
                this.equipmentInfoPrefab.sv.scrollToOffset(this.equipmentInfoPrefab.sv.getScrollOffset().add(v2(0, h)), .3)
            }
            this.equipmentInfoPrefab.sv.content.active = true;
        }
    }

    private isUserScrolling = false
    private onScrolling(scrollView: ScrollView) {
        // log("onScrolling", scrollView.isAutoScrolling(), scrollView.isScrolling())
        if (scrollView.isScrolling()) this.isUserScrolling = true
        this.updatePos();
    }

    private onScrollEnd() {
        // if (this.node.active && this.isUserScrolling) this.node.active = false;
        this.isUserScrolling = false;
    }
}