import { _decorator, Component, Node, tween, easing, UIOpacity, Tween, instantiate, Widget, UITransform, Vec3 } from 'cc';
import { Message } from '../../../../core/common/event/MessageManager';
import { BattleManger } from '../../BattleManger';
import { BattleEvent, BattleTowerType } from '../../utils/BattleEnum';
const { ccclass, property } = _decorator;

@ccclass('BattleTouchFighterCmp')
export class BattleTouchFighterCmp extends Component {
    @property(UIOpacity)
    nodeOpacity: UIOpacity
    @property(Node)
    blockNode: Node
    @property(Node)
    leftBlockNode: Node
    @property(Node)
    rightBlockNode: Node
    @property(Node)
    allBlockNode: Node

    mapNode: Node
    start() {

    }

    registers() {
        Message.on(BattleEvent.BLUETOWERREDUCE, this.BLUETOWERREDUCE, this)
        Message.on(BattleEvent.REDTOWERREDUCE, this.REDTOWERREDUCE, this)
    }
    unRegisters() {
        Message.off(BattleEvent.BLUETOWERREDUCE, this.BLUETOWERREDUCE, this)
        Message.off(BattleEvent.REDTOWERREDUCE, this.REDTOWERREDUCE, this)
    }

    update(deltaTime: number) {

    }

    init() {
        if (!this.mapNode) {
            let n = this.node.getChildByName('mapNode');
            this.mapNode = instantiate(n);
            this.mapNode.getComponent(Widget).enabled = false;
            BattleManger.getInstance().BattleMap.bg.addChild(this.mapNode);
            let pos = n.getComponent(UITransform).convertToWorldSpaceAR(Vec3.ZERO);
            let _pos = this.mapNode.parent.getComponent(UITransform).convertToNodeSpaceAR(pos);
            this.mapNode.setPosition(_pos);
            n.active = false;

            this.blockNode = this.mapNode.getChildByName(this.blockNode.name);
            this.leftBlockNode = this.mapNode.getChildByName(this.leftBlockNode.name);
            this.rightBlockNode = this.mapNode.getChildByName(this.rightBlockNode.name);
            this.allBlockNode = this.mapNode.getChildByName(this.allBlockNode.name);

            this.nodeOpacity = this.mapNode.addComponent(UIOpacity);
        }
        this.mapNode.active = true;
        this.node.active = true;
        this.blockNode.active = false;
        this.leftBlockNode.active = false;
        this.rightBlockNode.active = false;
        this.allBlockNode.active = false;
    }

    BLUETOWERREDUCE(eventName: string, args: BattleTowerType) {
        if (BattleManger.getInstance().enemyTeam == core.Team.Blue) {
              
            this.show(args, true);
        } else {
              
        }
    }
    REDTOWERREDUCE(eventName: string, args: BattleTowerType) {
        if (BattleManger.getInstance().enemyTeam == core.Team.Red) {
              
            this.show(args, true);
        } else {
              
        }
    }

    show(args: BattleTowerType, anim: boolean = false) {
        this.init();

        if (args.centerTower != 0) {
            if (args.leftTower == 0 && args.rightTower == 0) {
                this.allBlockNode.active = true;
            } else if (args.leftTower == 0) {
                this.leftBlockNode.active = true;
            } else if (args.rightTower == 0) {
                this.rightBlockNode.active = true;
            } else {
                this.blockNode.active = true;
            }
        }

        Tween.stopAllByTarget(this.nodeOpacity);
        this.nodeOpacity.opacity = 255;
        if (anim) {
            this.nodeOpacity.opacity = 0;
            tween(this.nodeOpacity)
                .to(0.3, { opacity: 255 }, { easing: easing.fade })
                .to(0.3, { opacity: 0 }, { easing: easing.fade })
                .to(0.3, { opacity: 255 }, { easing: easing.fade })
                .to(0.3, { opacity: 0 }, { easing: easing.fade })
                .call(() => {
                    this.hide();
                })
                .start();
        }
    }
    hide() {
        if (this.mapNode)
            this.mapNode.active = false;
        this.node.active = false;
    }
}

