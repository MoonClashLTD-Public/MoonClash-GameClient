import { _decorator, Component, Node, tween, UIOpacity, easing, Tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BattleAlertCmp')
export class BattleAlertCmp extends Component {
    start() {

    }

    update(deltaTime: number) {

    }

    show() {
          
        this.node.active = true;
        let uio = this.node.getComponent(UIOpacity);
        uio.opacity = 0;
        Tween.stopAllByTarget(uio);
        tween(uio)
            .to(0.5, { opacity: 100 }, { easing: easing.fade })
            .to(0.5, { opacity: 0 }, { easing: easing.fade })
            .union()
            .repeatForever()
            // .to(0.3, { opacity: 255 }, { easing: easing.fade })
            // .to(0.3, { opacity: 0 }, { easing: easing.fade })
            // .to(0.3, { opacity: 255 }, { easing: easing.fade })
            // .to(0.3, { opacity: 0 }, { easing: easing.fade })
            .start();

    }
    hide() {
        this.node.active = false;
    }
}

