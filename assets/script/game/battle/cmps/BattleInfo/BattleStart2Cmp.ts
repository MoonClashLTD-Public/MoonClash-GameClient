import { _decorator, Component, Node, tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BattleStart2Cmp')
export class BattleStart2Cmp extends Component {
    start() {

    }

    update(deltaTime: number) {

    }

    show(t: number) {
        this.node.active = true;

        tween(this.node)
            .delay(t)
            .call(() => {
                this.hide();
            })
            .start();
    }
    hide() {
        this.node.active = false;
    }
}

