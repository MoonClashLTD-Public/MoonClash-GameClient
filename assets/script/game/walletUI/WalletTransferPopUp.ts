import { _decorator, Component, Node, math, EditBox, Label, find } from 'cc';
import { LanguageData } from '../../core/gui/language/LanguageData';
import { LanguageLabel } from '../../core/gui/language/LanguageLabel';
import { AlertParam } from '../../core/gui/prompt/Alert';
import { tips } from '../../core/gui/prompt/TipsManager';
import { oops } from '../../core/Oops';
import { CommonUtil } from '../../core/utils/CommonUtil';
import { NativeUtil } from '../../core/utils/NativeUtil';
import { UIID } from '../common/config/GameUIConfig';
import HttpHome from '../common/net/HttpHome';
import TableCards from '../common/table/TableCards';
import TableEquipRaity from '../common/table/TableEquipRaity';
import { NftCfg } from '../common/table/TableNfts';
import WalletUtil from './WalletUtil';
import { WalletCard } from './widget/WalletCard';
import { WalletEquipment } from './widget/WalletEquipment';
import { WalletMaterial } from './widget/WalletMaterial';
const { ccclass, property, type } = _decorator;

@ccclass('WalletTransferPopUp')
export class WalletTransferPopUp extends Component {
    @type(LanguageLabel)
    nameLbl: LanguageLabel = null;
    @type(EditBox)
    editBox: EditBox = null;
    @type(EditBox)
    numEditBox: EditBox = null;
    @type(WalletCard)
    walletCard: WalletCard = null;
    @type(WalletEquipment)
    walletEquipment: WalletEquipment = null;
    @type(WalletMaterial)
    walletMaterial: WalletMaterial = null;
    @type(Node)
    setUpNode: Node = null;   
    @type(Node)
    confirmNode: Node = null;   
    param: WalletTransferPopUpParam = null;
    tradeId: number = 0;
    nftType: core.NftType;
    start() {

    }

    update(deltaTime: number) {

    }

    onAdded(param: WalletTransferPopUpParam) {
        this.walletCard.node.active = false;
        this.walletEquipment.node.active = false;
        this.walletMaterial.node.active = false;
        this.param = param;
        if (this.param.card) {
            this.tradeId = this.param.card.nftId;
            this.nftType = core.NftType.NftTypeCard;
            this.walletCard.init(this.param.card);
            this.walletCard.node.active = true;
            this.nameLbl.dataID = this.walletCard.baseCard.cardCfg.name;
        } else if (this.param.equipment) {
            this.tradeId = this.param.equipment.nftId;
            this.nftType = core.NftType.NftTypeEquipment;
            this.walletEquipment.init(this.param.equipment);
            this.walletEquipment.node.active = true;
            let name = TableEquipRaity.getInfoByEquipIdAndRarity(this.param.equipment.protoId, this.param.equipment.equipRarity)?.name;
            this.nameLbl.dataID = name;
        } else if (this.param.material) {
            this.tradeId = this.param.material.tokenType;
            this.nftType = core.NftType.NftTypeItem;
            this.walletMaterial.init(this.param.material);
            this.walletMaterial.node.active = true;
            this.nameLbl.dataID = this.walletMaterial.baseMaterial.nftCfg.display_name;
        }

        this.numEditBox.node.active = !!this.param.material;
        this.setUpNode.active = true;
        this.confirmNode.active = false;
    }

      
    async confimClick() {
        // 0x2Baf8FA8F897ad998872f62035b16f374d39eA42
        let nftId = this.tradeId;
        let walletAddr = this.editBox.string;
        let materialType = core.NftMaterialType.MaterialNone;
        let cnt = 0;

        if (!walletAddr) {
            oops.gui.toast('market_tips_err', true);
            return
        }

        if (this.numEditBox.node.active) {
            materialType = this.param.material.tokenType;
            cnt = Number(this.numEditBox.string);
            if (isNaN(cnt) || cnt <= 0 || cnt > this.param.material.total - this.param.material.locking) {
                oops.gui.toast('market_tips_err', true);
                return
            }
        }

        let gas = "0";
        let usd = "0";
        let _d = await HttpHome.queryGas("NftTransferReq", watrade.NftTransferReq.create({
            opt: this.nftType,
            toWallet: walletAddr,
            nftId: nftId,
            materialType: materialType,
            cnt: cnt,
        }));
        if (_d) {
            gas = `${CommonUtil.weiToEther(_d.gas).toFixed()}`;
            usd = _d.usd;
        } else {
            return;
        }

        this.setUpNode.active = false;
        this.confirmNode.active = true;

        find('countNode/num', this.confirmNode).getComponent(Label).string = `${cnt}`;
        find('poundageNode/num', this.confirmNode).getComponent(Label).string = `${gas}`;
        find('poundageNode/poundageLbl', this.confirmNode).getComponent(LanguageLabel).params = [
            {
                key: 'num1',
                value: `${1}`,
            },
            {
                key: 'num2',
                value: `${usd}`,
            }
        ];

        find('countNode', this.confirmNode).active = this.nftType == core.NftType.NftTypeItem;
    }

    textChangedCheckNumber(text: string, e: EditBox, customEventData: string) {
        e.string = WalletUtil.checkNumber(text, customEventData);
    }

      
    transferClick() {
        let nftId = this.tradeId;
        let walletAddr = this.editBox.string;
        let materialType = core.NftMaterialType.MaterialNone;
        let cnt = 0;
        if (this.numEditBox.node.active) {
            materialType = this.param.material.tokenType;
            cnt = Number(this.numEditBox.string)
        }

        let closeCB = () => {
            this.closeClick();
            oops.gui.remove(UIID.CardInfoPopUp);
            oops.gui.remove(UIID.EquipmentInfoPopUp);
            oops.gui.remove(UIID.MaterialInfoPopUp);
        }

        HttpHome.nftTransfer(this.nftType, walletAddr, nftId, materialType, cnt)
            .then((d: watrade.NftTransferResp) => {
            }).catch(async (e: { code: errcode.ErrCode, data: watrade.NftTransferResp }) => {
                if (e.code == errcode.ErrCode.WaitComplete) {
                    let _d = await tips.showNetLoadigMask<pkgsc.ScNftTransferPush>({
                        content: "tip_trade",
                        closeEventName: `${opcode.OpCode.ScNftTransferPush}`,
                    })

                    closeCB();

                    if (_d?.code == errcode.ErrCode.Ok) {
                        oops.gui.open<AlertParam>(UIID.Alert, {
                            content: LanguageData.getLangByIDAndParams('wallet_tips2', [
                                // {
                                //     key: "id",
                                //     value: `${id}`
                                // }
                            ]),
                            okCB: () => { },
                        });

                    }
                }
            });
    }

    async scanCodeClick() {
        let str = await NativeUtil.scanQRCode();
        if (str) {
            this.editBox.string = str;
        }
    }

    closeClick() {
        oops.gui.removeByNode(this.node, true);
    }
}

export type WalletTransferPopUpParam = {
    card?: core.ICard,
    equipment?: core.IEquipment,
    material?: core.IMaterial,
}