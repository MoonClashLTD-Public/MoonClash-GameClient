import { _decorator, Component, Node, Sprite, SpriteFrame, Color, Label, Button } from 'cc';
import ListItemOptimize from '../../../core/gui/scrollView/ListItemOptimize';
import TableEquip from '../../common/table/TableEquip';
import { NftCfg } from '../../common/table/TableNfts';
import { ResManger } from '../../data/resManger';
import { WalletBaseEquip } from './WalletBaseEquip';
import { WalletBaseMaterial } from './WalletBaseMaterial';
const { ccclass, property, type } = _decorator;

@ccclass('WalletMaterial')
export class WalletMaterial extends Component {
    @type(WalletBaseMaterial)
    baseMaterial: WalletBaseMaterial = null;
    @type(Label)
    numLbl: Label = null;
    materialInfo: core.IMaterial = null;
    start() {
        this.node.addComponent(ListItemOptimize);
    }

    update(deltaTime: number) {

    }

    init(material: core.IMaterial, cb?: Function) {
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
        this.materialInfo = material;

        this.baseMaterial.init(this.materialInfo, cb);
        this.setNum(material.total - material.locking);
        // let equipmentCfg = TableEquip.getInfoById(material.protoId);
        // this.powerLbl.string = `${material.durability}/${equipmentCfg.durability_max}`;
        // this.jobIcon.spriteFrame = ResManger.getInstance().getCardJobSpriteFrame(equipment.jobId);
        // for (let index = 0; index < this.characterNode.children.length; index++) {
        //     this.characterNode.children[index].active = index < this.equipmentInfo.attrs.length;
        // }
    }

    setNum(num: number) {
        this.numLbl.string = `${num}`;
    }

    hideNum() {
        this.numLbl.node.parent.active = false;
    }
}

