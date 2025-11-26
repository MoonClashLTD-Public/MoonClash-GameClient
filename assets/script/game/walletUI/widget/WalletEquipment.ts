import { _decorator, Component, Node, Sprite, SpriteFrame, Color, Label, Button } from 'cc';
import ListItemOptimize from '../../../core/gui/scrollView/ListItemOptimize';
import { DefLogoAttr } from '../../common/com/DefLogoAttr';
import TableCards from '../../common/table/TableCards';
import TableEquip from '../../common/table/TableEquip';
import { PlayerManger } from '../../data/playerManager';
import { ResManger } from '../../data/resManger';
import { WalletBaseEquip } from './WalletBaseEquip';
const { ccclass, property, type } = _decorator;

@ccclass('WalletEquipment')
export class WalletEquipment extends Component {
    @type(WalletBaseEquip)
    baseEquip: WalletBaseEquip = null;
    @type(Label)
    powerLbl: Label = null;
    @type([DefLogoAttr])
    iconAttrs: DefLogoAttr[] = [];
    @type([Node])
    bgItems: Node[] = [];
    equipmentInfo: core.IEquipment = null;
    start() {
        this.node.addComponent(ListItemOptimize);
    }

    update(deltaTime: number) {

    }

    init(equipment: core.IEquipment, cb?: Function) {
        // switch (card.state) {
        //     case core.NftState.NftStateBlank:
        //         break;
        //     case core.NftState.NftStateSelling:
        //         break;
        //     case core.NftState.NftStateRenting:
        //         break;
        //     case core.NftState.NftStateAssist:
        //         break;
        //     case core.NftState.NftStateLock:
        //         break;
        //     default:
        //         break;
        // };
        this.equipmentInfo = equipment;

        this.baseEquip.init(this.equipmentInfo, cb);

        let equipmentCfg = TableEquip.getInfoById(equipment.protoId);
        this.powerLbl.string = `${equipment.durability}/${equipmentCfg.durability_max}`;
        // this.jobIcon.spriteFrame = ResManger.getInstance().getCardJobSpriteFrame(equipment.jobId);
        // for (let index = 0; index < this.characterNode.children.length; index++) {
        //     this.characterNode.children[index].active = index < this.equipmentInfo.attrs.length;
        // }

        let idx = 0;
        const disItems = PlayerManger.getInstance().equipManager.playEquips.getDispostionCfgById2({ netEquipment: equipment }).list
        this.iconAttrs.forEach((attr, Idx) => {
            attr.init2(disItems[Idx])
            if (disItems[Idx]) idx++;
        })

        this.bgItems[0].active = idx >= 1;
        this.bgItems[1].active = idx >= 3;
    }

    hideAttr() {
        this.bgItems[0].parent.parent.active = false;
    }
}

