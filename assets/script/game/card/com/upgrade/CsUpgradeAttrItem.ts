import { _decorator, Component, Node, instantiate, Prefab, Vec3, log, Label, Sprite, tween, Tween, Color, v3 } from 'cc';
import { LanguageLabel } from '../../../../core/gui/language/LanguageLabel';
import { ICardAttrCfg } from '../../../common/contants/CardCost';
import { ResManger } from '../../../data/resManger';
const { ccclass, property } = _decorator;
@ccclass('CsUpgradeAttrItem')
export class CsUpgradeAttrItem extends Component {
    @property(Sprite)
    private icon: Sprite = null;
    @property(LanguageLabel)
    private nameLb: LanguageLabel = null;
    @property(Label)
    private num1: Label = null;
    @property(Label)
    private num2: Label = null;

    async init(cfg: ICardAttrCfg) {
        this.nameLb.dataID = cfg.name;
        const diff = Number(cfg.num2) - Number(cfg.num1)
        const prevNum = Number(cfg.num1) - diff
        this.updateNumberAnim(prevNum, Number(cfg.num1))
          
        if (cfg?.num2 != cfg?.num1 && cfg?.num2 && !cfg.isMaxLevel) {
            this.num2.node.active = true;
            this.num2.string = `+ ${Number(cfg.num2) - Number(cfg.num1)}`
        } else {
            this.num2.node.active = false
        }
        this.icon.spriteFrame = await ResManger.getInstance().getCardAttrSpriteFrame(cfg.icon);
    }

    private updateNumberAnim(prevNum: number, curNum: number) {
        this.num1.string = prevNum.toString()
        Tween.stopAllByTarget(this.num1.node);
        tween(this.num1.node).delay(0.5).to(1, { scale: v3(1, 1, 1) }, {
            progress: (start: number, end: number, current: number, t) => {
                this.num1.string = Math.ceil(prevNum + (curNum - prevNum) * t).toString()
                return start + (end - start) * t
            }
        }).start()
    }
}



