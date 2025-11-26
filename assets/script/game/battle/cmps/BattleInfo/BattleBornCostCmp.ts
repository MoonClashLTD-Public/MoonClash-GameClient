import { _decorator, Component, Node, Sprite, tween, v3, Label, easing } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BattleBornCostCmp')
export class BattleBornCostCmp extends Component {
    @property(Label)
    costLabel: Label
    start() {

    }

    update(deltaTime: number) {

    }

    show(cost: number, delCb: Function) {
        this.costLabel.string = `-${cost}`
        tween(this.node)
            .by(1, { position: v3(0, 70, 0) }, { easing: easing.elasticOut })
            .call(() => {
                delCb && delCb();
            })
            .start();
    }
}

