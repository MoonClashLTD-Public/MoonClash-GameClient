import { _decorator, Component, Node, Tween, tween, v3, easing } from 'cc';
import { oops } from '../../../../core/Oops';
import { AudioMusicRes } from '../../../data/resManger';
const { ccclass, property } = _decorator;

@ccclass('BattleMathcTipsCmp')
export class BattleMathcTipsCmp extends Component {
    @property(Node)
    overNode: Node   
    @property(Node)
    finalsNode: Node   
    start() {

    }

    update(deltaTime: number) {

    }

    private init() {
        this.node.active = true;
        this.overNode.active = false;
        this.finalsNode.active = false;
    }

      
    showFinal() {
        this.init();
        this.finalsNode.active = true;
        this.tweenAct(this.finalsNode);
    }
      
    showOver() {
        this.init();
        this.overNode.active = true;
        this.tweenAct(this.overNode);
        oops.audio.playMusic(AudioMusicRes.battleOver);
    }

    tweenAct(node: Node) {
        node.setPosition(v3(1000, 0));
        Tween.stopAllByTarget(node);
        tween(node)
            .delay(1)
            .to(0.5, { position: v3() }, { easing: easing.circOut })
            .to(0, { eulerAngles: v3(0, 0, 10) })
            .to(0.5, { eulerAngles: v3(0, 0, 0) }, { easing: easing.bounceIn })
            .delay(1)
            .to(0.5, { position: v3(-1000) }, { easing: easing.circIn })
            .start();
    }
}

