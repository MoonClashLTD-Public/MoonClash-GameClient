import { _decorator, Component, Sprite, Label, RichText } from 'cc';
import { LanguageLabel } from '../../../core/gui/language/LanguageLabel';
import { IDispostionCfg } from '../contants/CardCost';
const { ccclass, property } = _decorator;


@ccclass('PropAttrItem')
export class PropAttrItem extends Component {
    @property(Sprite)
    icon: Sprite = null
    @property(LanguageLabel)
    nameLb: LanguageLabel = null
    @property(RichText)
    descLb: RichText = null


    init(cfg: IDispostionCfg) {
        if (this.nameLb) this.nameLb.dataID = cfg?.name
        if (this.descLb) {
            let str = ''
            this.descLb.string = str
        }
    }
}



