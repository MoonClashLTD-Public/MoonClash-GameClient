import { _decorator, Component, Node, Label } from 'cc';
import { LanguageLabel } from '../../../../core/gui/language/LanguageLabel';
import { IEquipDispostionCfg } from '../../../common/contants/EquipCost';
const { ccclass, property } = _decorator;
@ccclass('ETMergeOkAttrItem')
export class ETMergeOkAttrItem extends Component {
    @property(Label)
    private numLb: Label = null
    @property(LanguageLabel)
    private nameLanLb: LanguageLabel = null

    init(idx: number, cfg: IEquipDispostionCfg) {
        this.numLb.string = idx.toString()
        this.nameLanLb.dataID = cfg.name
        this.nameLanLb.getComponent(Label).color = cfg.showColor
    }

}

