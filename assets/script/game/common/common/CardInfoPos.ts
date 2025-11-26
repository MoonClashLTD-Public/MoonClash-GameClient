import { Component, Rect, ScrollView, UITransform, v2, v3, _decorator } from "cc";
import { CardInfoPrefab } from "./CardInfoPrefab";

const { ccclass, property } = _decorator;

@ccclass('CardInfoPos')
export class CardInfoPos extends Component {
    private get cardInfoPrefab() {
        return this.node.getComponent(CardInfoPrefab);
    }
    update() {
        this.updatePos()
    }
      
    private updatePos() {
        if (!this.node.active) return
        if (this.cardInfoPrefab.tagetNode) {
            let pos = this.cardInfoPrefab.tagetNode.getWorldPosition();
            let h1 = this.cardInfoPrefab.cardInfo.node.getComponent(UITransform).height / 2;
            let y2 = this.node.getComponent(UITransform).height / 2 - h1;
            this.node.setWorldPosition(v3(pos.x, pos.y - y2 + 20, pos.z));
        }
    }

      
    init() {
        this.updatePos()
        if (this.cardInfoPrefab.sv) {
            if (!this.cardInfoPrefab.sv.node.hasEventListener(ScrollView.EventType.SCROLL_ENDED, this.onScrollEnd, this)) {
                this.cardInfoPrefab.sv.node.on(ScrollView.EventType.SCROLL_ENDED, this.onScrollEnd, this)
            }
            if (!this.cardInfoPrefab.sv.node.hasEventListener(ScrollView.EventType.SCROLLING, this.onScrolling, this)) {
                this.cardInfoPrefab.sv.node.on(ScrollView.EventType.SCROLLING, this.onScrolling, this)
            }
            this._checkScroll()
        }
    }

    onDestroy() {
        if (this.cardInfoPrefab.sv) {
            this.cardInfoPrefab.sv.node.off(ScrollView.EventType.SCROLL_ENDED, this.onScrollEnd, this);
            this.cardInfoPrefab.sv.node.off(ScrollView.EventType.SCROLLING, this.onScrolling, this);
        }
    }
    svRect: Rect = null;
      
    private _checkScroll() {
        if (this.cardInfoPrefab.sv && this.cardInfoPrefab.tagetNode) {
            let isHide = false;
            if (!this.svRect) {
                isHide = true;
                this.cardInfoPrefab.sv.content.active = false;
                let svRect = this.cardInfoPrefab.sv.node.getComponent(UITransform).getBoundingBoxToWorld();
                this.svRect = svRect;
            }
            let svRect = this.svRect;
            let rect = this.node.getComponent(UITransform).getBoundingBoxToWorld();
            rect.x = 0;
            if (svRect.containsRect(rect) == false) {
                let h = 0;
                if (svRect.y > rect.y) {   
                    h = svRect.y - rect.y;
                } else {   
                    h = -((rect.y + rect.height) - (svRect.y + svRect.height));
                }
                this.cardInfoPrefab.sv.scrollToOffset(this.cardInfoPrefab.sv.getScrollOffset().add(v2(0, h)), .3)
            }
            if (isHide)
                this.cardInfoPrefab.sv.content.active = true;
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