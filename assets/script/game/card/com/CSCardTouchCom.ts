import { _decorator, Component, Node, EventTouch, UITransform, Input, log, v3, instantiate, v2, Vec3, View, tween, easing, UIOpacity, Tween } from 'cc';
import { CardPrefab, CardPrefabType } from '../../common/common/CardPrefab';
import { CardSystemTouchFunction } from '../utils/fun';
const { ccclass, property } = _decorator;

@ccclass('CSCardTouchCom')
export class CSCardTouchCom extends Component {
    @property(Node)
    private moveNode: Node
    private canMove = false
    private copyMoveCard?: Node
    private move: CardSystemTouchFunction
    addListener(fun: CardSystemTouchFunction) {
        this.move = fun
    }
    start() {
        this.node.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
    onDestroy() {
        this.node.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
    protected onTouchStart(event: EventTouch) {
        if (this.moveNode && this.moveNode?.active) {
            const moveNode = this.moveNode
            let pos = event.getUILocation();
            let bf = moveNode?.getComponent(UITransform).getBoundingBoxToWorld().contains(pos);
            if (bf) this.canMove = true
        }
    }
    protected onTouchMove(event: EventTouch) {
        if (this.canMove && this.moveNode) {
            const moveNode = this.moveNode
            const parentNode = this.node.parent
            const parentTransform = parentNode.getComponent(UITransform)
            if (!this.copyMoveCard) {
                moveNode.active = false
                this.copyMoveCard = instantiate(moveNode)
                this.copyMoveCard.active = true
                parentNode.addChild(this.copyMoveCard)
            }
            // let pos = moveNode.getPosition();
            // let x = pos.x + event.getUIDelta().x;
            // let y = pos.y + event.getUIDelta().y;
            // moveNode.setPosition(v3(x, y));
            const eventWPos = event.getUILocation()
            const cardTram = this.copyMoveCard.getComponent(UITransform)
            let x = eventWPos.x;
            let y = eventWPos.y;
            const nPos = parentTransform.convertToNodeSpaceAR(v3(x, y))
            const pos = this.copyMoveCard.getPosition();
            this.copyMoveCard.setPosition(v3(nPos.x, nPos.y));
            if (!parentTransform.getBoundingBox().containsRect(cardTram.getBoundingBox())) {
                this.copyMoveCard.setPosition(v3(pos.x, pos.y));
            }
        }
    }
    protected onTouchEnd(event: EventTouch) {
        if (this.copyMoveCard && this.canMove) {
            if (this.move) this.move.end(this.copyMoveCard.getWorldPosition())
            // this.copyMoveCard?.destroy()
            // this.copyMoveCard = null
            // this.moveNode.active = true
        }
        this.canMove = false
    }

    setCopyNode() {
        if (this.moveNode) {
            const moveNode = this.moveNode
            const parentNode = this.node.parent
            if (!this.copyMoveCard) {
                moveNode.active = false
                this.copyMoveCard = instantiate(moveNode)
                this.copyMoveCard.active = true
                parentNode.addChild(this.copyMoveCard)
            }
        }
    }

    setMoveNodeStatus(upOk: boolean, selectNode?: Node, animTime = 0.6) {
        return new Promise<boolean>((resolve, reject) => {
            if (!upOk) {
                if (this.copyMoveCard) {
                    Tween.stopAllByTarget(this.copyMoveCard)
                    tween(this.copyMoveCard)
                        .to(animTime, { worldPosition: this.moveNode.worldPosition }, {
                            onComplete: () => {
                                this.copyMoveCard?.destroy()
                                this.copyMoveCard = null
                                this.moveNode.active = true
                                resolve(true)
                            }
                        })
                        .start();
                }
            } else {
                if (selectNode) {
                    const parentNode = this.node.parent
                    let copySelecNode = instantiate(selectNode)
                    parentNode.addChild(copySelecNode)

                    if (this.copyMoveCard) {
                        let noneNode = instantiate(selectNode)
                        const noneCardPrefab = noneNode.getComponent(CardPrefab)
                        noneCardPrefab.init({
                            id: 0,
                            cardPrefabType: CardPrefabType.None
                        })
                        parentNode.addChild(noneNode)

                        Tween.stopAllByTarget(this.copyMoveCard)
                        noneNode.setWorldPosition(selectNode.worldPosition)
                        copySelecNode.setWorldPosition(selectNode.worldPosition)
                        tween(this.copyMoveCard)
                            .to(animTime, { worldPosition: selectNode.worldPosition }, {
                                onComplete: () => noneNode?.destroy()
                            })
                            .start();
                    }

                    let cpUiOpacity = copySelecNode.getComponent(UIOpacity)
                    if (!cpUiOpacity) cpUiOpacity = copySelecNode.addComponent(UIOpacity)
                    if (cpUiOpacity) {
                        Tween.stopAllByTarget(cpUiOpacity)
                        cpUiOpacity.opacity = 255
                        tween(cpUiOpacity)
                            .to(animTime, { opacity: 0.3 })
                            .start();
                    }
                    Tween.stopAllByTarget(copySelecNode)
                    tween(copySelecNode)
                        .to(animTime, { worldPosition: this.moveNode.worldPosition }, {
                            onComplete: () => {
                                copySelecNode?.destroy()
                                copySelecNode = null
                                this.copyMoveCard?.destroy()
                                this.copyMoveCard = null
                                this.moveNode.active = true
                                resolve(true)
                            }
                        })
                        .start();

                } else {
                    resolve(true)
                    this.copyMoveCard?.destroy()
                    this.copyMoveCard = null
                    this.moveNode.active = true
                }
            }
        })
    }

    isHidden(b: boolean) {
        this.moveNode.active = !b
    }


    get canClick() {
        return this.moveNode.active
    }
}

