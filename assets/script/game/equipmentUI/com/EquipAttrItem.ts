import { _decorator, Component, Node, Label, color, Toggle, Sprite } from 'cc';
import { LanguageLabel } from '../../../core/gui/language/LanguageLabel';
import { IEquipDispostionCfg } from '../../common/contants/EquipCost';
import { ResManger } from '../../data/resManger';
const { ccclass, property } = _decorator;
@ccclass('EquipAttrItem')
export class EquipAttrItem extends Component {
    @property(Label)
    private numLb: Label = null;
    @property(LanguageLabel)
    private nameLb: LanguageLabel = null
    @property(LanguageLabel)
    private descLb: LanguageLabel = null
    @property(Node)
    private toogleNode: Node = null
    @property(Node)
    private checkToggle: Node = null

    @property(Sprite)
    private iconSP: Sprite = null
    private isCheck = false

    private cfg: IEquipDispostionCfg
    init(idx: number, equipCfg: IEquipDispostionCfg) {
        this.cfg = equipCfg
        this.numLb.string = `${idx}`
        this.nameLb.dataID = equipCfg.name
        this.nameLb.getComponent(Label).color = equipCfg.showColor
        this.descLb.dataID = equipCfg.desc
        this.descLb.getComponent(Label).color = equipCfg.showColor

        const iconStr = equipCfg?.icon ?? ''
        if (iconStr.trim().length != 0 && this.iconSP) {
            this.iconSP.node.active = iconStr.trim().length != 0
            ResManger.getInstance().getCardAttr1SpriteFrame(iconStr).then((sf) => {
                this.iconSP.spriteFrame = sf
            })
        }
    }

    private cb: EquipAttFunction

    openToogle(change: EquipAttFunction) {
        this.toogleNode.active = true
        this.cb = change
    }

    setSelect(isSelect: boolean) {
        this.isCheck = isSelect
        this.checkToggle.active = isSelect
    }

    private onItemClick() {
        this.cb && this.cb(this.isCheck, this.cfg?.attrId)
    }

    onDestroy() {
        this.cb = null
    }
}
export type EquipAttFunction = (b: boolean, attId: number) => void;

