import { _decorator, Component, Node, tween, v3, easing, Tween } from 'cc';
import { Message } from '../../../../core/common/event/MessageManager';
import { BattleManger } from '../../BattleManger';
import { BattleEvent, BattleTowerType } from '../../utils/BattleEnum';
const { ccclass, property } = _decorator;

@ccclass('BattleScoreCmp')
export class BattleScoreCmp extends Component {
    @property(Node)
    redScoreNode: Node
    @property(Node)
    blueScoreNode: Node

    start() {

    }

    update(deltaTime: number) {

    }

    // show(data: core.IBattleResult) {
    //     this.redScoreNode.active = true;
    //     this.blueScoreNode.active = true;

    //     this.node.active = true;
    //     let bm = BattleManger.getInstance();
    //     let scoreMe = data.scores[bm.meTeam];
    //     let scoreEnemy = data.scores[bm.enemyTeam];
    //     // redScoreNode
    //     // blueScoreNode
    //     this.updScore(this.redScoreNode, scoreEnemy);
    //     this.updScore(this.blueScoreNode, scoreMe);

    // }
    hide(anim: boolean = false) {
        if (anim) {
            Tween.stopAllByTarget(this.node);
            tween(this.node)
                .delay(6)
                .call(() => {
                    this.hide();
                })
                .start();
        } else {
            this.node.active = false;
        }
    }

    registers() {
        Message.on(BattleEvent.BLUETOWERREDUCE, this.BLUETOWERREDUCE, this)
        Message.on(BattleEvent.REDTOWERREDUCE, this.REDTOWERREDUCE, this)
    }
    unRegisters() {
        Message.off(BattleEvent.BLUETOWERREDUCE, this.BLUETOWERREDUCE, this)
        Message.off(BattleEvent.REDTOWERREDUCE, this.REDTOWERREDUCE, this)
    }

    BLUETOWERREDUCE(eventName: string, args: BattleTowerType) {
        let score = BattleManger.getInstance().calcScore(args);
        if (BattleManger.getInstance().enemyTeam == core.Team.Blue) {
              
            this.showMe(score);
        } else {
              
            this.showEnemy(score);
        }
    }
    REDTOWERREDUCE(eventName: string, args: BattleTowerType) {
        let score = BattleManger.getInstance().calcScore(args);
        if (BattleManger.getInstance().enemyTeam == core.Team.Red) {
              
            this.showMe(score);
        } else {
              
            this.showEnemy(score);
        }
    }

    updScore(node: Node, score: number) {
        for (let index = 0; index < node.children.length; index++) {
            const _node = node.children[index];
            if (index < score) {
                _node.active = true;
                this.scoreAct(_node);
            } else {
                _node.active = false;
            }
        }
    }

    scoreAct(node: Node) {
        tween(node)
            .to(0.5, { scale: v3(1, 1, 1) }, { easing: easing.fade })
            .to(0.5, { scale: v3(0.8, 0.8, 0.8) }, { easing: easing.fade })
            .to(0.5, { scale: v3(1, 1, 1) }, { easing: easing.fade })
            .to(0.5, { scale: v3(0.8, 0.8, 0.8) }, { easing: easing.fade })
            .start();
    }

    showMe(score: number) {
        this.hide(true);

        this.redScoreNode.parent.active = false;
        this.blueScoreNode.parent.active = true;

        this.node.active = true;
        this.updScore(this.blueScoreNode, score);
    }
    showEnemy(score: number) {
        this.hide(true)

        this.redScoreNode.parent.active = true;
        this.blueScoreNode.parent.active = false;

        this.node.active = true;
        this.updScore(this.redScoreNode, score);
    }
}

