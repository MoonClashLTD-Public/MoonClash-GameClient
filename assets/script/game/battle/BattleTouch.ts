import { _decorator, Component, EventTouch, UITransform, Input } from 'cc';
import { BattleManger } from './BattleManger';
const { ccclass, property } = _decorator;

@ccclass('BattleTouch')
export class BattleTouch extends Component {
    start() {
        this.node.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    update(deltaTime: number) {

    }

    protected onTouchStart(event: EventTouch) {
        // BattleManger.getInstance().Battle.battleInfo.battleScoreCmp.showMe(2);
        // BattleManger.getInstance().Battle.battleInfo.battleTimeTipsCmp.show120();


        event.preventSwallow = true;

        let bm = BattleManger.getInstance();
        let pos = event.getUILocation();
        for (const handCard of bm.Battle.battleCards.handCards) {
            let bf = handCard.node.getComponent(UITransform).getBoundingBoxToWorld().contains(pos);
            if (bf) {
                bm.Battle.battleCards.selHandCard(handCard);
                break;
            }
        }

        if (bm.Battle.battleCards.selCard) {
            let bm = BattleManger.getInstance();
            let selCard = bm.Battle.battleCards.selCard;
            selCard.onTouchStart(event);
            // let pos = event.getUILocation();
            // let _pos = selCard.node.parent.getComponent(UITransform).convertToNodeSpaceAR(v3(pos.x, pos.y));
            // tween(selCard.node)
            //     .to(0.1, {
            //         position: _pos
            //     }, {
            //         onUpdate: (target: Node) => {
            //             let pos = target.getComponent(UITransform).convertToWorldSpaceAR(Vec3.ZERO);
            //             selCard.onTouchMove(v2(pos.x - _pos.x, pos.x - _pos.y), v2(pos.x, pos.y));
            //         }
            //     }).start();
        } else {
            if (BattleManger.getInstance().gameState >= core.BattleState.BattleFighting && BattleManger.getInstance().gameState < core.BattleState.BattleSettle) {
                  
                BattleManger.getInstance().Battle.battleInfo.battleNoCardTipsCmp.show();
            }
        }
    }
    protected onTouchMove(event: EventTouch) {
        event.preventSwallow = true;

        let bm = BattleManger.getInstance();
        // bm.Battle.battleCards.selCard?.onTouchMove(event.getUIDelta(), event.getUILocation());
        bm.Battle.battleCards.selCard?.onTouchMove(event);
    }
    protected onTouchEnd(event: EventTouch) {
        event.preventSwallow = true;

        let bm = BattleManger.getInstance();
        bm.Battle.battleCards.selCard?.onTouchEnd(event);
    }
}

