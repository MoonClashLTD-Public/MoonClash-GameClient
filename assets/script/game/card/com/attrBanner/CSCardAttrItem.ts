import { _decorator, Component, Node, Sprite, Label } from 'cc';
import { LanguageLabel } from '../../../../core/gui/language/LanguageLabel';
import { ICardAttrCfg } from '../../../common/contants/CardCost';
import { ResManger } from '../../../data/resManger';
const { ccclass, property } = _decorator;

@ccclass('CSCardAttrItem')
export class CSCardAttrItem extends Component {
    @property(Sprite)
    icon: Sprite = null;
    @property(LanguageLabel)
    nameLb: LanguageLabel = null;
    @property(LanguageLabel)
    nameAddStrLb: LanguageLabel = null;
    @property(Label)
    num1: Label = null;
    @property(Label)
    num2: Label = null;
    @property(LanguageLabel)
    sec: LanguageLabel = null;

    async init(cfg: ICardAttrCfg) {
        this.nameLb.dataID = cfg.name;
        this.num1.string = `${cfg?.num1}`;

        if (cfg.nameAddStr) {
            this.nameAddStrLb.node.active = true
            this.nameAddStrLb.dataID = cfg.nameAddStr;
        } else {
            this.nameAddStrLb.node.active = false
        }

        // if (cfg.attrType == CsPropType.PropTypeTarget) {
        // this.num1.node.active = true
        // this.nameAddStrLb.node.active = true
        // this.nameAddStrLb.dataID = cfg.nameAddStr;
        // } else {
        // this.num1.node.active = true
        // this.nameAddStrLb.node.active = false
        // }


        if (cfg.showNum2) {
            this.num2.node.active = true
            this.num2.string = `${cfg.num2}`
        } else {
              
            this.num2.node.active = false

              
            // if (cfg.showAdd && cfg?.num2 != cfg?.num1 && cfg?.num2 && !cfg.isMaxLevel) {
            //     this.num2.node.active = true;
            //     this.num2.string = `+ ${Number(cfg.num2) - Number(cfg.num1)}`
            // } else {
            //     this.num2.node.active = false
            // }
        }

        if (cfg.attrType == core.PropType.PropTypeBornCastMs
            || cfg.attrType == skill.EffectType.EffectTypeAtk) {
            this.sec.node.active = true
        } else {
            this.sec.node.active = false
        }

        this.icon.spriteFrame = await ResManger.getInstance().getCardAttrSpriteFrame(cfg.icon);
    }

}

