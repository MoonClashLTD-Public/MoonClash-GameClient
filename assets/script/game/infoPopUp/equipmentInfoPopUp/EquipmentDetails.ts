import { _decorator, Component, instantiate, Node, Label } from 'cc';
import { LanguageLabel } from '../../../core/gui/language/LanguageLabel';
import { TableEquipCfg } from '../../common/table/TableEquip';
import { PlayerManger } from '../../data/playerManager';
import { EquipAttrItem } from '../../equipmentUI/com/EquipAttrItem';
const { ccclass, property } = _decorator;
@ccclass('EquipmentDetails')
export class EquipmentDetails extends Component {
    equipmentInfo: core.IEquipment = null;

    init(param: {
        equipInfo?: core.IEquipment,   
        equipCfg?: TableEquipCfg,   
    }) {
        if (param.equipCfg) {
            param.equipInfo = core.Equipment.create({
                protoId: param.equipCfg.id,
            })
        }
        this.equipmentInfo = param.equipInfo;
        this.updInfo();
    }

    updInfo() {
        const attrs = PlayerManger.getInstance().equipManager.playEquips.getDispostionCfgById({ netEquipment: this.equipmentInfo }).list
        let idx = 0;
        for (const key in attrs) {
            const attr = attrs[key]
            let item: Node = null;
            if (idx == 0) {
                item = this.node.children[0];
            } else {
                item = instantiate(this.node.children[0]);
                this.node.addChild(item)
            }
            idx++
            // let numLbl = item.getChildByName('numLbl').getComponent(Label);
            // let nameLbl = item.getChildByName('nameLbl').getComponent(LanguageLabel);
            // let descLbl = item.getChildByName('descLbl').getComponent(LanguageLabel);

            // numLbl.string = `${idx + 1}`
            // nameLbl.dataID = attr.name
            // nameLbl.getComponent(Label).color = attr.showColor
            // descLbl.dataID = attr.desc
            // descLbl.getComponent(Label).color = attr.showColor
            item.getComponent(EquipAttrItem)?.init(idx, attr)
        }
    }
}

