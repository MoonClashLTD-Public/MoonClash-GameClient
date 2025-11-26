import { _decorator, Component, Node, Sprite, SpriteFrame, Color, Label, Button } from 'cc';
import ListItemOptimize from '../../../core/gui/scrollView/ListItemOptimize';
import TableCards from '../../common/table/TableCards';
import TableEquip, { TableEquipCfg } from '../../common/table/TableEquip';
import TableEquipRaity, { TableEquipRaityCfg } from '../../common/table/TableEquipRaity';
import { ResManger } from '../../data/resManger';
const { ccclass, property, type } = _decorator;

@ccclass('WalletBaseEquip')
export class WalletBaseEquip extends Component {
    @type(Sprite)
    icon: Sprite = null;
    @type(Sprite)
    bg: Sprite = null;
    cb: Function = null;
    equipmentInfo: core.IEquipment = null;
    equipmentCfg: TableEquipCfg = null;
    start() {
        this.node.addComponent(ListItemOptimize);
    }

    update(deltaTime: number) {

    }

    async init(equipment: core.IEquipment, cb?: Function) {
        this.equipmentInfo = equipment;
        this.cb = cb;
        this.node.getComponent(Button).enabled = !!this.cb;

        const equipRaityCfg = TableEquipRaity.getInfoByEquipIdAndRarity(equipment.protoId, equipment.equipRarity);
        if (equipRaityCfg) {
            this.equipmentCfg = TableEquip.getInfoById(equipRaityCfg.equip_id);
            this.icon.spriteFrame = await ResManger.getInstance().getEquipIconSpriteFrame(equipRaityCfg.res_name);
            this.bg.spriteFrame = await ResManger.getInstance().getEquipIconSpriteFrame(equipRaityCfg.rarity);
        }
    }
    cardClick() {
        this.cb && this.cb(this.equipmentInfo);
    }
}

