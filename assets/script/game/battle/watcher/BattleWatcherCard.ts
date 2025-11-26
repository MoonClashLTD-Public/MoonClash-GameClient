import { _decorator, Component, easing, Label, Node, Sprite, tween, Tween, UITransform, v3, Vec2 } from 'cc';
import TableGlobalConfig from '../../common/table/TableGlobalConfig';
import { BattleCard } from '../cmps/BattleCard';
import { BattleUtils } from '../BattleUtils';
const { ccclass, property } = _decorator;

@ccclass('BattleWatcherCard')
export class BattleWatcherCard extends Component {
    @property(Node)
    nextNode: Node = null;
    @property([Node])
    cardNode: Node[] = [];
    @property([Node])
    blueNodes: Node[] = [];
    @property([Node])
    redNodes: Node[] = [];

    @property([Node])
    powerLight: Node[] = [];   
    @property(Node)
    maxNodeTips: Node = null;
    @property(Number)
    powerPBLength: number = 0;
    @property([UITransform])
    powerPB: UITransform[] = [];
    @property(UITransform)
    powerPB0: UITransform = null;
    @property(Label)
    curFood: Label = null;
    curPower: number = 0;
    allTime: number = 0;
    curTime: number = 0;
    singleTime: number = 0;
    curTeam: core.Team;
    heroModel: Node = null;   
    curCardId: number = -1;   

    cards: number[] = [];   
    nextCard: number = 0;   
    onLoad() {
    }

    init(team: core.Team, cards: number[], nextCard: number) {
        this.curCardId = -1;
        this.node.active = true;

        this.curTeam = team;

        this.blueNodes.forEach(e => e.active = team == core.Team.Blue);
        this.redNodes.forEach(e => e.active = team == core.Team.Red);

        this.cards = cards;
        this.nextCard = nextCard;

        this.updCardDisplay();
    }

    updPower(foodInfo: core.IFoodInfo) {
        this.singleTime = foodInfo.addIntervalMs;
        this.curPower = foodInfo.currentFood;
        this.curTime = this.curPower * foodInfo.addIntervalMs + foodInfo.sinceLastUpdateMs;
        this.allTime = TableGlobalConfig.cfg.max_food * foodInfo.addIntervalMs;
        this.updPbUI();
    }

    private updPbUI() {
        if (this.allTime == 0) return;
        let curT = this.curTime > this.allTime ? this.allTime : this.curTime;
        this.powerPB0.height = curT / this.allTime * this.powerPBLength;
        this.powerPB[this.curTeam].height = Math.floor(curT / this.singleTime) / TableGlobalConfig.cfg.max_food * this.powerPBLength;
        this.lightAct(curT >= this.allTime);

        this.curFood.string = `${Math.floor(curT / this.singleTime)}`;
        this.curFood.node.getComponentInChildren(Label).string = this.curFood.string;
    }

    lightTween: Tween<Node>;
    lightAct(anim: boolean) {
        this.maxNodeTips.active = anim;
        let powerLight = this.powerLight[this.curTeam];
        let defX = powerLight.getPosition().x;
        if (anim) {
            if (!this.lightTween) {
                powerLight.setPosition(defX, 0);
                this.lightTween = tween(powerLight)
                    .to(0, { position: v3(defX, 0) }, { easing: easing.smooth })
                    .to(3, { position: v3(defX, 700) }, { easing: easing.smooth })
                    .union()
                    .repeatForever()
                    .start();
                // let idx = 0;
                // for (const card of this.handCards) {
                //     card.showAct(idx++);
                // }
            }
        } else {
            if (this.lightTween) {
                this.lightTween.stop();
                this.lightTween = null;

                // for (const card of this.handCards) {
                //     card.hideAct();
                // }
            }
            powerLight.setPosition(defX, 0);
        }
    }

      
    updCardDisplay() {
        for (let index = 0; index < this.cards.length; index++) {
            const cardId = this.cards[index];
            let bCard = this.cardNode[index].getComponent(BattleCard);
            bCard.updCard(cardId, false, true);

            bCard.node.getComponentInChildren(Sprite).grayscale = this.curCardId == cardId;
        }
        this.nextNode.getComponent(BattleCard).updCard(this.nextCard, true, true);
    }

      
    prePlaceCard(cardId: number, pos?: Vec2) {
        if (pos) {
            if (this.curCardId != cardId && this.heroModel) {
                BattleUtils.hideHeroModel(this.heroModel, this.curCardId, true);
                this.heroModel = null;
            }
            this.curCardId = cardId;
            this.heroModel = BattleUtils.showHeroModel(this.heroModel, this.curCardId, v3(pos.x, pos.y), this.curTeam);
        } else {
            BattleUtils.hideHeroModel(this.heroModel, this.curCardId, true);
            this.heroModel = null;
            this.curCardId = -1;
        }

        this.updCardDisplay();
    }

      
    placeCard(cardId: number, nextCardId: number, food: core.IFoodInfo) {
        BattleUtils.hideHeroModel(this.heroModel, this.curCardId, true);
        this.curCardId = -1;
        this.heroModel = null;

        let idx = this.cards.findIndex(e => e == cardId);
        if (idx != -1) {
            this.cards[idx] = cardId;
            this.nextCard = nextCardId;
        }

        this.updPower(food);

        this.updCardDisplay();
    }
}