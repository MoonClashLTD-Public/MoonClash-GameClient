import { _decorator, Component, Node, tween, v3, easing, Label, Tween, Sprite } from 'cc';
import { oops } from '../../../../core/Oops';
import { AudioSoundRes } from '../../../data/resManger';
import { BattleManger } from '../../BattleManger';
const { ccclass, property } = _decorator;

@ccclass('BattleStart1Cmp')
export class BattleStart1Cmp extends Component {
    @property(Node)
    redNode: Node
    @property(Node)
    blueNode: Node
    @property(Node)
    vsLight: Node
    start() {

    }

    update(deltaTime: number) {

    }

    show(t: number, overTime: number, cb?: Function) {
        oops.audio.playEffect(AudioSoundRes.battleStart);

        let bm = BattleManger.getInstance();
        let str1 = 'Home'
        let str2 = 'Visitor'
        if (bm.meTeam != core.Team.Blue) {
            [str1, str2] = [str2, str1]
        }
        this.blueNode.getChildByName('Label').getComponent(Label).string = `${str1}`;
        this.redNode.getChildByName('Label').getComponent(Label).string = `${str2}`;
        this.blueNode.getChildByName('name').getComponent(Label).string = `${bm.playerMe.name}`;
        this.redNode.getChildByName('name').getComponent(Label).string = `${BattleManger.getInstance().getEnemyName()}`;


        let redPos = v3(4, 192);
        let bluePos = v3(11, -134);

        if (bm.isTVGame() && bm.meTeam == core.Team.Red) {
              
            let redSf = this.redNode.getComponent(Sprite).spriteFrame;
            let blueSf = this.blueNode.getComponent(Sprite).spriteFrame;
            [this.redNode.getComponent(Sprite).spriteFrame, this.blueNode.getComponent(Sprite).spriteFrame] = [blueSf, redSf];
        }

        this.redNode.setPosition(v3(redPos.x - 1000, redPos.y))
        this.blueNode.setPosition(v3(bluePos.x + 1000, bluePos.y))
        tween(this.redNode)
            .to(0.5, {
                position: v3(redPos.x, redPos.y)
            }, { easing: easing.sineInOut })
            .delay(t)
            .to(0.5, {
                position: v3(redPos.x - 1000, redPos.y)
            }, { easing: easing.sineInOut })
            .start();
        tween(this.blueNode)
            .to(0.5, {
                position: v3(bluePos.x, bluePos.y)
            }, { easing: easing.sineInOut })
            .delay(t)
            .to(0.5, {
                position: v3(bluePos.x + 1000, bluePos.y)
            }, { easing: easing.sineInOut })
            .start();


        this.node.active = true;

        // let s = v3(1.25, 1.25, 1.25);
        // let tos = v3(1, 1, 1);
        // this.node.setScale(s);
        tween(this.node)
            // .to(t, { scale: tos }, { easing: easing.cubicOut })
            .delay(t + overTime)
            .call(() => {
                this.hide();
                cb && cb();
            })
            .start();


        Tween.stopAllByTarget(this.vsLight);
        tween(this.vsLight)
            .by(5, { angle: 360 }, { easing: easing.linear })
            .repeatForever()
            .start();
    }
    hide() {
        this.node.active = false;
    }
}

