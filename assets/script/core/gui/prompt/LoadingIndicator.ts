/*
 * @Author: dgflash
 * @Date: 2022-04-14 17:08:01
 * @LastEditors: dgflash
 * @LastEditTime: 2022-04-14 18:27:26
 */
import { Component, Node, Tween, tween, UIOpacity, _decorator } from "cc";
import { UIID } from "../../../game/common/config/GameUIConfig";
import { oops } from "../../Oops";

const { ccclass, property, menu } = _decorator;

  
@ccclass("LoadingIndicator")
@menu('ui/prompt/LoadingIndicator')
export default class LoadingIndicator extends Component {
    @property(Node)
    private loading: Node | null = null;

    private loading_rotate: number = 0;
    public onAdded(params: any = {}) {
        let bg = this.node.getChildByName('bg');
        let uio = bg.getComponent(UIOpacity) ?? bg.addComponent(UIOpacity);
        if (oops.gui.has(UIID.LoadingMask)) {
            uio.opacity = 0;
        } else {
            uio.opacity = 170;
        }

        let upt = this.node.getComponent(UIOpacity);
        Tween.stopAllByTarget(upt);
        upt.opacity = 0;
        tween(upt)
            .delay(3)
            .to(0.5, { opacity: 255 })
            .start()
    }
    public onRemoved() {
    }

    update(dt: number) {
        this.loading_rotate += dt * 220;
        this.loading!.setRotationFromEuler(0, 0, -this.loading_rotate % 360)
        if (this.loading_rotate > 360) {
            this.loading_rotate -= 360;
        }
    }
}