import { _decorator, Component, Node } from 'cc';
import { LanguageLabel } from '../../../core/gui/language/LanguageLabel';
import TableNfts, { NftCfg } from '../../common/table/TableNfts';
const { ccclass, property } = _decorator;

@ccclass('MaterialDetails')
export class MaterialDetails extends Component {
    materialInfo: core.IMaterial = null;
    nft: NftCfg = null;
    init(param: {
        materialInfo?: core.IMaterial,   
        nftCfg?: NftCfg,   
    }) {
        if (param.nftCfg) {
            param.materialInfo = core.Material.create({
                tokenType: param.nftCfg.material_type,
                locking: 0,
                total: param.nftCfg.count,
            })
            this.nft = param.nftCfg;
        } else if (param.materialInfo) {
            this.nft = TableNfts.getInfoByMaterialType(param.materialInfo.tokenType);
        }
        this.materialInfo = param.materialInfo;
        this.updInfo();
    }

    updInfo() {
        let descLbl = this.node.getChildByName('Label').getComponent(LanguageLabel);
        descLbl.dataID = `${this.nft.description}`;
    }
}

