import { _decorator, Component, Node, tween, UIOpacity, easing, Tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BattleNoCardTipsCmp')
export class BattleNoCardTipsCmp extends Component {
    start() {

    }

    update(deltaTime: number) {

    }

    show() {
        this.node.active = true;
        let uio = this.node.getComponent(UIOpacity);
        Tween.stopAllByTarget(uio);
        uio.opacity = 0;
        tween(uio)
            .to(0.5, { opacity: 255 }, { easing: easing.smooth })
            .delay(0.5)
            .to(0.5, { opacity: 0 }, { easing: easing.smooth })
            .start()
    }
}

