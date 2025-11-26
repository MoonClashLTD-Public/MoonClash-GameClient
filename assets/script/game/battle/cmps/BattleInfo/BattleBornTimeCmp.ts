import { _decorator, Component, Node, Sprite, tween, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BattleBornTimeCmp')
export class BattleBornTimeCmp extends Component {
    @property(Node)
    pointerNode: Node
    @property(Sprite)
    redSprite: Sprite
    @property(Sprite)
    blueSprite: Sprite

    start() {

    }

    update(deltaTime: number) {

    }

    show(time: number, isBlue: boolean, delCb: Function) {
        this.blueSprite.node.active = false;
        this.redSprite.node.active = false;
        let spr = isBlue ? this.blueSprite : this.redSprite;
        spr.node.active = true;

        let t = time / 1000;
        tween(spr)
            .to(t, { fillRange: -1 })
            .start();
        tween(this.pointerNode)
            .to(t, { eulerAngles: v3(0, 0, -360) })
            .call(() => {
                // this.node.destroy();
                delCb && delCb();
            })
            .start();
    }
}

