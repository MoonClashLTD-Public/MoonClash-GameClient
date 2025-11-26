import { _decorator, Component, Node, Sprite, Label, RichText, Toggle } from 'cc';
import { LanguageLabel } from '../../../../core/gui/language/LanguageLabel';
import { IDispostionCfg } from '../../../common/contants/CardCost';
import { ResManger } from '../../../data/resManger';
const { ccclass, property } = _decorator;

@ccclass('CSCardDispositionItem')
export class CSCardDispositionItem extends Component {
    @property(Label)
    private numLb: Label = null;
    @property(LanguageLabel)
    private nameLb: LanguageLabel = null;
    @property(RichText)
    private desLb: RichText = null;
    @property(Node)
    private toogleNode: Node = null
    @property(Node)
    private checkToggle: Node = null
    @property(Sprite)
    private iconSp: Sprite = null
    private isCheck = false

    private cfg: IDispostionCfg

    init(idx: number, cfg: IDispostionCfg) {
        this.cfg = cfg
        this.numLb.string = `${idx}`
        if (this.nameLb) this.nameLb.dataID = cfg?.name || ''
        if (this.desLb) {
            this.desLb.string = cfg.desc;
        }
        const iconStr = cfg?.icon ?? ''
        if (iconStr.trim().length != 0 && this.iconSp) {
            this.iconSp.node.active = iconStr.trim().length != 0
            ResManger.getInstance().getCardAttr1SpriteFrame(iconStr).then((c) => {
                this.iconSp.spriteFrame = c
            })
        }
    }

    private cb: DisFunction

    openToogle(change: DisFunction) {
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
export type DisFunction = (b: boolean, attId: number) => void;

