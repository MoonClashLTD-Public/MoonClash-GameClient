import { _decorator, Component, Node, v2, v3, UITransform, EventTouch, Vec2, size, Tween, tween, Vec3, log } from 'cc';
import { BattleManger } from '../BattleManger';
import { Flighter } from './Flighter';
import { FlighterAnim } from './FlighterAnim';
import { FlighterAnimatorType } from './FlighterViewAnimator';
const { ccclass, property } = _decorator;

@ccclass('FlighterMove')
export class FlighterMove extends Component {
    flighter: Flighter

    start() {
        // this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        // this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        // this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        // this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    update(deltaTime: number) {
        // let targetPos = this.flighter.targetPos;
        // // let targetPos: cc.Vec2 = this.target.getPosition();
        // let pos: Vec2 = v2(this.node.position.x, this.node.position.y);
        // let normalize: Vec2 = targetPos.subtract(pos).normalize();

        // // this.node.setPosition(v3(bulletPos.x + normalizeVec3.x * this.flighter.speed * deltaTime,
        // //     bulletPos.y + normalizeVec3.y * this.flighter.speed * deltaTime, 0));

          
        // let angle = v2(0, 1).signAngle(v2(normalize.x, normalize.y)) * 180 / Math.PI;
        // // this.node.angle = angle;
        // this.flighterAnim.setAngle(angle);

        // console.log(this.node.getPosition().x, this.node.getPosition().y);
        // let idx = this.node.getPosition().y;

        // this.node.name = `${idx}`
        // this.node.setSiblingIndex(idx);
        // this.setChildrenNodeSortByZIndex(this.node.parent);
        // console.log(this.node.uuid, idx, this.node.getSiblingIndex());
    }

      
    // public setChildrenNodeSortByZIndex(parent: Node): void {
    //     if (!parent) {
    //         return;
    //     }

    //     let children = parent.children.concat();
    //     children.sort((a, b): number => {
    //         let zIndexA = Number(a.name);
    //         let zIndexB = Number(b.name);
    //         if (isNaN(zIndexA)) zIndexA = 0;
    //         if (isNaN(zIndexB)) zIndexB = 0;
    //         return zIndexB - zIndexA;
    //     });
    //     let maxIndex = children.length;
    //     for (const node of children) {
    //         node.setSiblingIndex(maxIndex);
    //     }
    // }

    init(f: Flighter) {
        this.flighter = f;
        // test
        // this.node.getComponent(UITransform).setContentSize(size(100, 100));
    }

    protected onTouchStart(event: EventTouch) {
        let pos = this.node.parent.getComponent(UITransform).convertToNodeSpaceAR(v3(event.getUILocation().x, event.getUILocation().y));
        this.flighter.targetPos = v3(pos.x, pos.y);

        this.calcAngle();

        // this.flighter.animator.setTrigger(FlighterAnimatorType.Run);
        // this.flighter.animator.play(FlighterAnimatorType.Attack);
    }
    onTouchMove(event: EventTouch) {
        let _pos = this.node.getPosition();
        let x = _pos.x + event.getUIDelta().x;
        let y = _pos.y + event.getUIDelta().y;
        this.node.setPosition(v3(x, y));

        let pos = this.node.parent.getComponent(UITransform).convertToNodeSpaceAR(v3(event.getUILocation().x, event.getUILocation().y));
        this.flighter.targetPos = v3(pos.x, pos.y);

        this.calcAngle();
    }
    protected onTouchEnd(event: EventTouch) {
    }

    calcAngle(startPos?: Vec2, endPos?: Vec2) {
        let targetPos = startPos ?? v2(this.flighter.targetPos.x, this.flighter.targetPos.y);
        let pos: Vec2 = endPos ?? v2(this.node.position.x, this.node.position.y);
        let normalize: Vec2 = targetPos.subtract(pos).normalize();

        // this.node.setPosition(v3(bulletPos.x + normalizeVec3.x * this.flighter.speed * deltaTime,
        //     bulletPos.y + normalizeVec3.y * this.flighter.speed * deltaTime, 0));

          
        let angle = v2(0, 1).signAngle(v2(normalize.x, normalize.y)) * 180 / Math.PI;
        // this.node.angle = angle;
        this.flighter.flighterAnim?.setAngle(angle);
    }

    moveTween: Tween<Node> = null;
    moveDstPos: Vec3 = null;
      
      
    syncPosWithEntity() {
        this.node.setPosition(this.flighter.targetPos);
    }

      
    smoothSyncPosWithEntity() {
          
          
          
        if (this.moveDstPos != null && this.moveDstPos.equals(this.flighter.targetPos)) {
            // cc.log("here");
            return;
        }

        this.moveDstPos = this.flighter.targetPos.clone();

        if (this.moveTween != null) {
            this.moveTween.stop();
        }

          
        // let duration = this.game.dLogicDt.toNumber();
          
        let mgr = BattleManger.getInstance();
        let duration = mgr.frameRecvDt || 0;
          
        duration = Math.max(
            duration,
            mgr.dLogicDt
        );
          
        duration = Math.min(
            duration,
            mgr.dLogicDt * 3
        );

        // cc.log('duration:', duration);

          
        this.moveTween = tween(this.node)
            .to(duration, {
                position: this.moveDstPos
            }).start()
    }

}

