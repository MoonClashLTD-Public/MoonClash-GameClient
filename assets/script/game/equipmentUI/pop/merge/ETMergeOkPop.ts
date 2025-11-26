import { _decorator, Component, Node, instantiate, Label, Sprite } from 'cc';
import { oops } from '../../../../core/Oops';
import TableEquip from '../../../common/table/TableEquip';
import TableEquipRaity from '../../../common/table/TableEquipRaity';
import { PlayerManger } from '../../../data/playerManager';
import { ResManger } from '../../../data/resManger';
import { ETMergeOkAttrItem } from '../../com/merge/ETMergeOkAttrItem';
const { ccclass, property } = _decorator;

@ccclass('ETMergeOkPop')
export class ETMergeOkPop extends Component {
    @property(Label)
    private powerLb: Label = null
    @property(Sprite)
    private iconBg: Sprite = null
    @property(Sprite)
    private icon: Sprite = null
    @property(Node)
    private attrNode: Node = null
    private attrItem: Node
    @property(Node)
    private lightNode: Node = null

    private get resManger() {
        return ResManger.getInstance()
    }
    onLoad() {
        if (!this.attrItem) this.attrItem = instantiate(this.attrNode.children[0])
    }

    private config: IInitMergeOkCfg
    async onAdded(params: IInitMergeOkCfg) {
        if (!params?.equip) throw new Error(`params equip null -- ${params?.equip}`);
        this.config = params
        const equip = params.equip
        const _equipCfg = TableEquip.getInfoById(equip?.protoId)
        const _equipRaityCfg = TableEquipRaity.getInfoByEquipIdAndRarity(equip?.protoId, equip?.equipRarity)
        const durability = equip?.durability || 0
        const maxDurability = _equipCfg?.durability_max || 0
        this.powerLb.string = `${durability}/${maxDurability}`
        this.initAttrs()
        if (_equipRaityCfg) {
            this.icon.spriteFrame = await this.resManger.getEquipIconSpriteFrame(_equipRaityCfg?.res_name)
            this.iconBg.spriteFrame = await this.resManger.getEquipIconSpriteFrame(_equipRaityCfg?.rarity)
        }
    }

    private initAttrs() {
        this.attrNode.destroyAllChildren()
        const attrs = PlayerManger.getInstance().equipManager.playEquips.getDispostionCfgById({ netEquipment: this.config.equip })?.list || {}
        let i = 1
        for (const key in attrs) {
            const attr = attrs[key]
            const item = instantiate(this.attrItem)
            this.attrNode.addChild(item)
            item.getComponent(ETMergeOkAttrItem)?.init(i, attr)
            i++
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

export interface IInitMergeOkCfg {
    equip: core.IEquipment
}

