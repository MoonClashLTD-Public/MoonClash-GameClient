import { _decorator, Component, Node, math, Event, Button, SpriteFrame, Sprite, warn, Label } from 'cc';
import { LanguageLabel } from '../../../core/gui/language/LanguageLabel';
import { oops } from '../../../core/Oops';
import { CardInfoBtnPrefabInfo } from '../../common/common/CardInfoPrefab';
import { NftCfg } from '../../common/table/TableNfts';
import { TradeFlagState } from '../../walletUI/WalletUtil';
import { WalletBaseMaterial } from '../../walletUI/widget/WalletBaseMaterial';
import { MaterialDetails } from './MaterialDetails';
const { ccclass, property, type } = _decorator;

@ccclass('MaterialInfoPopUp')
export class MaterialInfoPopUp extends Component {
    @type(LanguageLabel)
    nameLbl: LanguageLabel = null;
    @type(Label)
    idLbl: Label = null;
    @type(MaterialDetails)
    materialDetails: MaterialDetails = null;
    @type(WalletBaseMaterial)
    walletBaseMaterial: WalletBaseMaterial = null;
    @type(Node)
    btnNode: Node = null;   
    @type([SpriteFrame])
    btnSfs: SpriteFrame[] = [];   
    materialInfo: core.IMaterial = null;
    nftInfo: NftCfg = null;
    cb: CbFunc = null;
    start() {

    }

    update(deltaTime: number) {

    }

    onAdded(param: MaterialInfoPopUpParam) {
        let material = param.material;
        let nft = param.nft;
        this.cb = param.cb;
        this.materialInfo = param.material;
        this.nftInfo = param.nft;

        if (material) {
            this.walletBaseMaterial.init(material);
            let materialCfg = this.walletBaseMaterial.nftCfg;
            this.nameLbl.dataID = materialCfg.display_name;
            this.idLbl.string = `#${materialCfg.material_type}`;

            this.materialDetails.init({ materialInfo: param.material });
        } else if (nft) {
            this.walletBaseMaterial.initNft(nft);
            let nftCfg = this.walletBaseMaterial.nftCfg;
            this.nameLbl.dataID = nftCfg.display_name;
            this.idLbl.string = `#${nftCfg.Id}`;

            this.materialDetails.init({ nftCfg: param.nft });
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
export type MaterialInfoPopUpParam = {
    nft?: NftCfg,
    material?: core.IMaterial,
    btns: CardInfoBtnPrefabInfo[],
      
    cb?: CbFunc
}