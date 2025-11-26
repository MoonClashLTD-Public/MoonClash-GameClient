import { _decorator, Component, Node, CCInteger, Widget, CCBoolean, UITransform, SpriteFrame, Sprite, Button, Label } from 'cc';
import { ResManger } from '../../data/resManger';
import { IDispostionCfg } from '../contants/CardCost';
import { IEquipDispostionCfg } from '../contants/EquipCost';
const { ccclass, property } = _decorator;

@ccclass('DefLogoAttr')
export class DefLogoAttr extends Component {
    @property(Sprite)
    private icon: Sprite = null;
    @property(Label)
    private numLb: Label = null;

    init(item: IDispostionCfg) {
        if (!item) {
            this.node.active = false
            return
        }
        this.node.active = true
        ResManger.getInstance().getCardAttr1SpriteFrame(item.icon).then((c) => {
            this.icon.spriteFrame = c
        })
        this.numLb.string = item.num ?? ''
    }

    init2(item: IEquipDispostionCfg) {
        if (!item) {
            this.node.active = false
            return
        }
        this.node.active = true
        ResManger.getInstance().getCardAttr1SpriteFrame(item.icon).then((c) => {
            this.icon.spriteFrame = c
        })
        this.numLb.string = item.num ?? ''
    }
}

