import { _decorator, Component, Node, math, Event, Button, SpriteFrame, Sprite, warn, Label } from 'cc';
import { LanguageLabel } from '../../../core/gui/language/LanguageLabel';
import { oops } from '../../../core/Oops';
import { CardInfoBtnPrefabInfo } from '../../common/common/CardInfoPrefab';
import TableEquip from '../../common/table/TableEquip';
import TableEquipRaity from '../../common/table/TableEquipRaity';
import { NftCfg } from '../../common/table/TableNfts';
import { EquipSystemUtils } from '../../equipmentUI/utils/equipSystemUtils';
import { WalletBaseEquip } from '../../walletUI/widget/WalletBaseEquip';
import { WalletBaseMaterial } from '../../walletUI/widget/WalletBaseMaterial';
import { EquipmentDetails } from './EquipmentDetails';
const { ccclass, property, type } = _decorator;

@ccclass('EquipmentInfoPopUp')
export class EquipmentInfoPopUp extends Component {
    @type(LanguageLabel)
    nameLbl: LanguageLabel = null;
    @type(Label)
    idLbl: Label = null;
    @type(Label)
    pvpLbl: Label = null;
    @type(Label)
    pveLbl: Label = null;
    @type(WalletBaseEquip)
    walletBaseEquip: WalletBaseEquip = null;
    @type(EquipmentDetails)
    equipmentDetails: EquipmentDetails = null;
    @type(Node)
    btnNode: Node = null;   
    @type([SpriteFrame])
    btnSfs: SpriteFrame[] = [];   
    equipmentInfo: core.IEquipment = null;
    cb: CbFunc = null;
    start() {

    }

    update(deltaTime: number) {

    }

    onAdded(param: EquipmentInfoPopUpParam) {
        let equipment = param.equipment;
        this.cb = param.cb;
        this.equipmentInfo = param.equipment;

        this.idLbl.string = `#${equipment.nftId}`;

        if (equipment) {
            // let equipmentCfg = TableEquip.getInfoById(equipment.protoId);
            this.walletBaseEquip.init(equipment);
            this.equipmentDetails.init({ equipInfo: equipment });
            let name = TableEquipRaity.getInfoByEquipIdAndRarity(equipment.protoId, equipment.equipRarity)?.name;
            this.nameLbl.dataID = name;
            const maxPower = TableEquip.getInfoById(equipment?.protoId)?.durability_max || 0
            const currPower = equipment?.durability || 0
            this.pvpLbl.string = `${currPower}/${maxPower}`
            this.pveLbl.string = `${EquipSystemUtils.isPlayPve(equipment) ? 0 : 1}/1`
        } else {
             
        }

        let btnWidth = 0
        switch (param.btns.length) {
            case 1:
                btnWidth = 200;
                break;
            case 2:
                btnWidth = 180;
                break;
            case 3:
                btnWidth = 155;
            case 4:
                btnWidth = 140;
                break;
            case 5:
                btnWidth = 120;
                break;
            default:
                btnWidth = 200;
                break;
        }
        for (let index = 0; index < this.btnNode.children.length; index++) {
            const btn = this.btnNode.children[index].getComponent(Button);
            btn.node.active = index < param.btns.length;
            let btnInfo = param.btns[index];
            if (btnInfo) {
                btn.node.getComponentInChildren(LanguageLabel).dataID = btnInfo.i18nKey;
                btn.clickEvents[0].customEventData = btnInfo.cbFlag;
                btn.node.getComponent(Sprite).spriteFrame = this.btnSfs[btnInfo.btnColor];
            }
        }
    }

    btnClick(e: Event, customEventData: string) {
        this.cb && this.cb(e, customEventData);
    }

    closeClick() {
        oops.gui.removeByNode(this.node, true);
    }
}

type CbFunc = (event: Event, cbFlag: string) => void;
export type EquipmentInfoPopUpParam = {
    equipment: core.IEquipment,
    btns: CardInfoBtnPrefabInfo[],
      
    cb?: CbFunc
}