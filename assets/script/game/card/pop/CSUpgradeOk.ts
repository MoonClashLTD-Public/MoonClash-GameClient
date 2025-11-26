import { _decorator, Component, Sprite, tween, instantiate, Node, Label, Tween, UIOpacity } from 'cc';
import { oops } from '../../../core/Oops';
import TableCards from '../../common/table/TableCards';
import { CardUtils } from '../../common/utils/CardUtils';
import { PlayerManger } from '../../data/playerManager';
import { ResManger } from '../../data/resManger';
import { CsUpgradeAttrItem } from '../com/upgrade/CsUpgradeAttrItem';
const { ccclass, property } = _decorator;

@ccclass('CSUpgradeOk')
export class CSUpgradeOk extends Component {
    @property(Label)
    private powerLb: Label = null
    @property(Sprite)
    private icon: Sprite = null
    @property(Node)
    private attrNode: Node = null
    private attrItem: Node
    @property(Node)
    private lightNode: Node = null
    @property(Node)
    private animNode: Node = null
    onLoad() {
        if (!this.attrItem) this.attrItem = instantiate(this.attrNode.children[0])
    }

    private config: IInitUpgradeCfg
    async onAdded(params: IInitUpgradeCfg) {
        if (!params?.card) throw new Error(`params card null -- ${params?.card}`);
        this.config = params
        const card = params.card
        const cardCgf = TableCards.getInfoByProtoIdAndLv(card.protoId, card.level)
        this.powerLb.string = `${card?.power || 0}/${cardCgf?.max_power || 0}`
        this.initAttrs()
        this.animNode.active = false
        this.icon.spriteFrame = await ResManger.getInstance().getIconSpriteFrame(cardCgf?.proto_id)
        this.animNode.active = true
        
        let uio =  this.animNode.getComponent(UIOpacity) ??  this.animNode.addComponent(UIOpacity);
        Tween.stopAllByTarget(uio);
        uio.opacity = 0;
        tween(uio)
            .to(0.5, { opacity: 255 })
            .start()
        
    }

    private initAttrs() {
        this.attrNode.destroyAllChildren()
        const attrCfgs = CardUtils.getCardAttrItems({ netCard: this.config.card })
        if (attrCfgs.length != 0) {
            for (const attr of attrCfgs) {
                if (attr.num1 == '0' || !attr.showAdd) continue
                const copyAttrNode = instantiate(this.attrItem)
                this.attrNode.addChild(copyAttrNode)
                copyAttrNode.active = true
                copyAttrNode.getComponent(CsUpgradeAttrItem)?.init(attr)
            }
        }
    }

    private onCancel() {
        oops.gui.removeByNode(this.node, true)
    }


    private loading_rotate: number = 0;
    update(dt: number) {
        this.loading_rotate += dt * 40;
        this.lightNode!.setRotationFromEuler(0, 0, -this.loading_rotate % 360)
        if (this.loading_rotate > 360) {
            this.loading_rotate -= 360;
        }
    }
}

export interface IInitUpgradeCfg {
    card: core.ICard
}
