import { _decorator, Component, instantiate, Label, Node, Prefab, v3 } from 'cc';
import { BattleManger } from '../BattleManger';
import { BattleWatcherCard } from './BattleWatcherCard';
const { ccclass, property } = _decorator;

@ccclass('BattleWatcherInfo')
export class BattleWatcherInfo extends Component {
    @property(Node)
    blueName: Node = null;
    @property(Node)
    redName: Node = null;
    @property(Node)
    battleWCTmpNode: Node = null;

    watchCards: BattleWatcherCard[] = [];
    onLoad() {
        this.node.active = false;
        this.battleWCTmpNode.active = false;
    }

    init() {
        this.blueName.getComponentInChildren(Label).string = BattleManger.getInstance().battlePlayerReady.players[core.Team.Blue].name;
        this.redName.getComponentInChildren(Label).string = BattleManger.getInstance().battlePlayerReady.players[core.Team.Red].name;

        let wcRedNode = instantiate(this.battleWCTmpNode);
        let wcBlueNode = instantiate(this.battleWCTmpNode);
        wcRedNode.setPosition(v3(-325, 267));
        wcBlueNode.setPosition(v3(-325, -195));

        this.node.addChild(wcRedNode);
        this.node.addChild(wcBlueNode);
        this.watchCards[core.Team.Blue] = wcBlueNode.getComponent(BattleWatcherCard);
        this.watchCards[core.Team.Red] = wcRedNode.getComponent(BattleWatcherCard);
    }

    show() {
        this.node.active = true;
        this.watchCards.forEach(e => e.node.active = true);

        // this.hideCostBg();
        // this.node.active = true;

        // let t = this.handCards.length * 0.5;
        // for (let index = 0; index < this.handCards.length; index++) {
        //     t -= 0.5;
        //     this.handCards[index].showCardAct(t);
        // }
    }
}