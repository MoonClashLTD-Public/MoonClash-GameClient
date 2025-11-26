import { _decorator, Component, Node, EventTouch, Vec3, UITransform, Sprite, SpriteFrame, tween, Label, math, v3, Tween, Widget } from 'cc';
import { BBoxCardCfg } from '../common/blindBox/BBoxTableCards';
const { ccclass, property } = _decorator;
export type RoleFunction = (card: ETCard) => void;
@ccclass('ETCard')
export class ETCard extends Component {
    @property(Node)
    mainCard: Node = null
    @property(Sprite)
    cardSprite: Sprite = null
    @property(Label)
    durableLb: Label = null
    @property(Node)
    noCardNode: Node = null
    @property(Node) s
    progressNode: Node = null
    openBelong = false
    openClick = true

    isClicking = false
    clickWaitTimer = 0.2
    cardInfo?: BBoxCardCfg
    ind = -1
    itemListener: RoleFunction
    init(indx: number, card?: BBoxCardCfg) {
        this.ind = indx
        this.cardInfo = card
        this.initCardInfo()
    }

    hasCard() {
        const id = this.cardInfo?.Id || 0
        return id != 0 && id != -1
    }

    private initCardInfo() {
        const hasCard = this.hasCard()
        if (this.mainCard) this.mainCard.active = hasCard
        if (this.noCardNode) this.noCardNode.active = !hasCard
        if (!this.cardInfo) return
        const card = this.cardInfo
        if (this.durableLb) this.durableLb.string = `${card.durable}/10`
        // const cardsf = ResManger.getInstance().getIconSpriteFrame(card.res_name)
        // if (cardsf) this.cardSprite.spriteFrame = cardsf
        if (this.progressNode) {
            const progressW = this.progressNode.getComponent(UITransform).width
            this.progressNode.getChildByName('progress').getComponent(Widget).right = ((10 - card.durable) / 10) * progressW
        }
    }

    addItemClickListener(fun: RoleFunction) {
        this.itemListener = fun
    }

    private itemClick(e: EventTouch) {
        if (this.isClicking || !this.hasCard() || !this.openClick) return;
        this.isClicking = true;
        if (this.clickWaitTimer > 0) {
            this.scheduleOnce(() => {
                this.isClicking = false;
            }, this.clickWaitTimer);
            this.updateListener()
        } else {
            this.isClicking = false;
            this.updateListener()
        }

    }

    private updateListener() {
        if (this.ind != -1 && this.itemListener) {
            this.itemListener(this)
        }
    }

    setActiveCom(actived: boolean) {
        // if (this.cardSp) this.cardSp.spriteFrame = !actived ? this.sfs[0] : this.sfs[1]
    }

    getTopWorldPostion() {
        const wPos = this.node.getWorldPosition()
        const cardH = this.node.getComponent(UITransform).height
        return v3(wPos.x, wPos.y + cardH / 2, wPos.z)
    }

    rumAnim() {
        this._runAnim(this.node)
    }

    onDestroy() {
        Tween.stopAllByTarget(this.node)
    }

      
    private _runAnim(animNode: Node) {
        Tween.stopAllByTarget(animNode)
        tween(animNode)
            .to(0.3, { angle: -3 })
            .to(0.3, { angle: 3 })
            .union()
            .repeat(6)
            .call(() => {
                animNode.angle = 0
            })
            .start()
    }
}

