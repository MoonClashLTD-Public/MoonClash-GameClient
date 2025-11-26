import { _decorator, Component, Node, Sprite, EventTouch, Button, Label } from 'cc'
import ListItemOptimize from '../../../core/gui/scrollView/ListItemOptimize'
import TableMaterialBoxContent from '../../common/table/TableMaterialBoxContent'
import TableNfts, { NftCfg } from '../../common/table/TableNfts'
import { ResManger } from '../../data/resManger'
const { ccclass, property } = _decorator

@ccclass('WalletBaseMaterial')
export class WalletBaseMaterial extends Component {
    @property(Sprite)
    private icon: Sprite = null;
    @property(Sprite)
    private bg: Sprite = null;
    nftCfg: NftCfg;
    cb: Function
    start() {
        this.node.addComponent(ListItemOptimize);
    }

    update(deltaTime: number) {

    }

    async init(material: core.IMaterial, cb?: Function) {
        let nftCfg = TableNfts.getInfoByMaterialType(material.tokenType);
        this.initNft(nftCfg)
    }

    async initNft(nft: NftCfg, cb?: Function) {
        this.cb = cb;
        this.node.getComponent(Button).enabled = !!this.cb;

        this.nftCfg = nft;
        this.icon.spriteFrame = await ResManger.getInstance().getIconSpriteFrame(nft.Id)
        this.bg.spriteFrame = await ResManger.getInstance().getEquipIconSpriteFrame(Number(nft.bgcolor));
    }

    cardClick() {
        this.cb && this.cb(this.nftCfg);
    }

}


