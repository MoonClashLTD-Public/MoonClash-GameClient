import { _decorator, Component, Node, tween, Tween, v3, easing } from 'cc';
import { BattleTimeType } from '../../utils/BattleEnum';
const { ccclass, property } = _decorator;

@ccclass('BattleTimeTipsCmp')
export class BattleTimeTipsCmp extends Component {
    @property(Node)
    node30: Node
    @property(Node)
    node60: Node
    @property(Node)
    node120: Node
    start() {

    }

    update(deltaTime: number) {

    }

    show(type: BattleTimeType) {
        this.node.children.forEach(e => e.active = false);
        this.node.active = true;

        let node: Node = null;
        switch (type) {
            case BattleTimeType.TIME30:
                node = this.node30;
                break;
            case BattleTimeType.TIME60:
                node = this.node60;
                break;
            case BattleTimeType.TIME120:
                node = this.node120;
                break;
            default:
                break;
        }

        node.active = true;
        this.tweenAct(node);
        // Tween.stopAllByTarget(node);
        // tween(node)
        //     .delay(3)
        //     .call(() => {
        //         this.hide();
        //     })
        //     .start();
    }
    hide() {
        this.node.active = false;
    }


      
    testShow120() {
        this.node.active = true;
        this.node.children.forEach(e => e.active = false);
        this.node120.active = true;
        this.tweenAct(this.node120);
    }


    tweenAct(node: Node) {
        let wordNode = node.getChildByName("word");
        let dt = 0;
        if (wordNode) {
            dt = 2.5;
            wordNode.setPosition(v3(1000, 0));
            Tween.stopAllByTarget(wordNode);
            tween(wordNode)
                .to(0.5, { position: v3() }, { easing: easing.circOut })
                .to(0, { eulerAngles: v3(0, 0, 10) })
                .to(0.5, { eulerAngles: v3(0, 0, 0) }, { easing: easing.bounceIn })
                .delay(1)
                .to(0.5, { position: v3(-1000) }, { easing: easing.circIn })
                .start();
        }

        let timeNode = node.getChildByName("time");
        if (timeNode) {
            timeNode.setPosition(v3(1000, 0));
            Tween.stopAllByTarget(timeNode);
            tween(timeNode)
                .delay(dt)
                .to(0.5, { position: v3() }, { easing: easing.circOut })
                .to(0, { eulerAngles: v3(0, 0, 10) })
                .to(0.5, { eulerAngles: v3(0, 0, 0) }, { easing: easing.bounceIn })
                .delay(1)
                .to(0.5, { position: v3(-1000) }, { easing: easing.circIn })
                .start();
        }
    }
}

