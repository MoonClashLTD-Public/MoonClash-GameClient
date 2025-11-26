import { _decorator, Component, Label } from 'cc';
import ListItemOptimize from '../../../core/gui/scrollView/ListItemOptimize';
const { ccclass, property, type } = _decorator;

@ccclass('WalletBlindBox')
export class WalletBlindBox extends Component {
    // @type(WalletBaseMaterial)
    // baseMaterial: WalletBaseMaterial = null;
    @type(Label)
    numLbl: Label = null;
    count: number = 0;
    // materialInfo: core.IMaterial = null;
    start() {
        this.node.addComponent(ListItemOptimize);
    }

    update(deltaTime: number) {

    }

    init(blindBox: {
        [k: string]: number;
    }, cb?: Function) {
        let count = 0;
        for (const key in blindBox) {
            count += blindBox[key];
        }
        this.setNum(count);
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
        // this.materialInfo = material;

        // this.baseMaterial.init(this.materialInfo, cb);
        // this.setNum(material.total - material.locking);
        // let equipmentCfg = TableEquip.getInfoById(material.protoId);
        // this.powerLbl.string = `${material.durability}/${equipmentCfg.durability_max}`;
        // this.jobIcon.spriteFrame = ResManger.getInstance().getCardJobSpriteFrame(equipment.jobId);
        // for (let index = 0; index < this.characterNode.children.length; index++) {
        //     this.characterNode.children[index].active = index < this.equipmentInfo.attrs.length;
        // }
    }

    setNum(num: number) {
        this.count = num;
        this.numLbl.string = `${num}`;
    }

    hideNum() {
        this.numLbl.node.parent.active = false;
    }
}

