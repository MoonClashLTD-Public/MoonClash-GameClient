import { _decorator, Component, Node, tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BattleDoubleFoodCmp')
export class BattleDoubleFoodCmp extends Component {
    start() {

    }

    update(deltaTime: number) {

    }

    show() {
        this.node.active = true;
        tween(this.node)
            .delay(3)
            .call(() => {
                this.hide();
            })
            .start();
    }
    hide() {
        this.node.active = false;
    }
}

