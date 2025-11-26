import { _decorator, Component, Node, Vec2, v2, ProgressBar, UITransform, v3, tween, easing, Tween, Label } from 'cc';
import { CommonUtil } from '../../core/utils/CommonUtil';
import TableCards from '../common/table/TableCards';
import TableGlobalConfig from '../common/table/TableGlobalConfig';
import { BattleManger } from './BattleManger';
import { BattleCard } from './cmps/BattleCard';
import { BattlePowerType } from './utils/BattleEnum';
import { BattleFace } from './BattleFace';
const { ccclass, property } = _decorator;

@ccclass('BattleCards')
export class BattleCards extends Component {
    @property(Node)
    cardNode: Node = null;
    @property(Node)
    maxNodeTips: Node = null;
    @property(BattleCard)
    nextBattleCard: BattleCard = null;

    @property(UITransform)
    powerPB: UITransform = null;
    @property(UITransform)
    powerPB0: UITransform = null;
    @property(Node)
    powerLight: Node = null;   
    @property(Number)
    powerPBLength: number = 0;
    @property(Label)
    curFood: Label = null;
    @property(UITransform)
    costBg: UITransform = null;
    @property(Node)
    heroPlace: Node = null;

    handCardIds: number[] = [];
    nextCard: number;
    nextCards: {
        useCardId: number,
        nextCardId: number
    }[] = [];
    curPower: number = 0;
    allTime: number = 0;
    curTime: number = 0;
    singleTime: number = 0;

    selCard: BattleCard = null;
    handCards: BattleCard[] = [];
    start() {
        this.heroPlace.active = false;
        this.node.getComponentInChildren(BattleFace).addEvent();
    }

    show() {
        this.hideCostBg();
        // this.node.active = true;
        this.node.getChildByName("faceBtn").active = true;
        this.node.getChildByName("cardNode").active = true;

        let t = this.handCards.length * 0.5;
        for (let index = 0; index < this.handCards.length; index++) {
            t -= 0.5;
            this.handCards[index].showCardAct(t);
        }
          
        //     card.showCardAct(t)
        // }
        // this.nextBattleCard.showCardAct(t);
    }
    hide() {
        // this.node.active = false;
        this.node.getChildByName("faceBtn").active = false;
        this.node.getChildByName("cardNode").active = false;
    }

    isHide() {
        return this.node.getChildByName("cardNode").active;
    }

    update(deltaTime: number) {
        this.updPbUI();
        this.curTime += deltaTime * 1000;
    }

    init(cards: number[], nextCardId: number) {
        this.selCard = null;
        this.handCards.length = 0;
        this.handCardIds = cards;
        this.nextCard = nextCardId;
        let pos = [
            -130,
            0,
            130,
        ]
        for (let index = 0; index < cards.length; index++) {
            const cardId = cards[index];
            let bCard = this.cardNode.children[index].getComponent(BattleCard);
            bCard.updCard(cardId, false, true);
            bCard.defPos.x = pos[index];
            bCard.node.setPosition(v3(bCard.defPos.x, 0));
            this.handCards.push(bCard);
        }

        this.nextBattleCard.getComponent(BattleCard).updCard(nextCardId, true, true);
    }

    updCard(useCardId: number, curNextCardId: number, nextCardId: number) {
        let idx = this.handCardIds.findIndex(cardId => cardId === useCardId);
        let bCard = this.cardNode.children[idx].getComponent(BattleCard);
        bCard.updCard(curNextCardId);
        bCard.node.setPosition(v3(bCard.defPos.x, 0));
        this.handCards[idx] = bCard;
        this.handCardIds[idx] = curNextCardId;
        this.nextCard = nextCardId;

        this.nextBattleCard.getComponent(BattleCard).updCard(nextCardId, true);
    }

    updCardAct: Tween<Node> = null;
    updCards(useCardId: number, nextCardId: number) {
        this.selCard = null;
        if (this.updCardAct) {
            this.nextCards.push({ useCardId, nextCardId });
        } else {
            this.updCardAct = tween(this.node)
                .delay(1)
                .call(() => {
                    this.updCardAct = null;
                    this.updCard(useCardId, this.nextCard, nextCardId);
                    let x = this.nextCards.shift();
                    if (x)
                        this.updCards(x.useCardId, x.nextCardId);
                })
                .start();
        }
    }

    selHandCard(handCard: BattleCard) {
        if (!handCard.isUse()) return;
        handCard.node.setPosition(v3(handCard.defPos.x, 20));
        this.selCard = handCard;
        for (let index = 0; index < this.cardNode.children.length; index++) {
            let bCard = this.cardNode.children[index].getComponent(BattleCard);
            if (bCard != handCard) {
                bCard.node.setPosition(v3(bCard.defPos.x, 0));
                bCard.setNodeDef();
            }
        }
    }

    updPbUI() {
        if (this.allTime == 0) return;
        let curT = this.curTime > this.allTime ? this.allTime : this.curTime;
        this.powerPB0.width = curT / this.allTime * this.powerPBLength;
        this.powerPB.width = Math.floor(curT / this.singleTime) / TableGlobalConfig.cfg.max_food * this.powerPBLength;
        this.lightAct(curT >= this.allTime);

        this.curFood.string = `${Math.floor(curT / this.singleTime)}`;
        this.curFood.node.getComponentInChildren(Label).string = this.curFood.string;
    }

    lightTween: Tween<Node>;
    lightAct(anim: boolean) {
        this.maxNodeTips.active = anim;

        if (anim) {
            if (!this.lightTween) {
                this.powerLight.setPosition(0, this.powerLight.getPosition().y);
                this.lightTween = tween(this.powerLight)
                    .to(0, { position: v3(0, this.powerLight.getPosition().y) }, { easing: easing.smooth })
                    .to(3, { position: v3(700, this.powerLight.getPosition().y) }, { easing: easing.smooth })
                    .union()
                    .repeatForever()
                    .start();
                let idx = 0;
                for (const card of this.handCards) {
                    card.showAct(idx++);
                }
            }
        } else {
            if (this.lightTween) {
                this.lightTween.stop();
                this.lightTween = null;

                for (const card of this.handCards) {
                    card.hideAct();
                }
            }
            this.powerLight.setPosition(0, this.powerLight.getPosition().y);
        }
    }

    // initPower() {
    //     this.curPower = TableGlobalConfig.cfg.initial_food;
    //     this.allTime = TableGlobalConfig.cfg.max_food * TableGlobalConfig.cfg.food_add_interval_ms;;
    //     this.singleTime = TableGlobalConfig.cfg.food_add_interval_ms;
    //     this.updPbUI();
    // }
    updPower(foodInfo: core.IFoodInfo) {
        this.singleTime = foodInfo.addIntervalMs;
        this.curPower = foodInfo.currentFood;
        this.curTime = this.curPower * foodInfo.addIntervalMs + foodInfo.sinceLastUpdateMs;
        this.allTime = TableGlobalConfig.cfg.max_food * foodInfo.addIntervalMs;
        this.updPbUI();
    }

    // changeState() {
    //     if (BattleManger.getInstance().powerState == BattlePowerType.NORMAL) {
    //         this.singleTime = TableGlobalConfig.cfg.food_add_interval_ms;
    //         this.allTime = TableGlobalConfig.cfg.max_food * TableGlobalConfig.cfg.food_add_interval_ms;
    //     } else if (BattleManger.getInstance().powerState == BattlePowerType.DOUBLE) {
    //         this.singleTime = TableGlobalConfig.cfg.double_food_add_interval_ms;
    //         this.allTime = TableGlobalConfig.cfg.max_food * TableGlobalConfig.cfg.double_food_add_interval_ms;
    //     }
    // }

    showCostBg(cost: number) {
        this.costBg.width = (cost / TableGlobalConfig.cfg.max_food) * this.powerPBLength;
        this.costBg.node.active = true;
    }
    hideCostBg() {
        this.costBg.node.active = false;
    }
}