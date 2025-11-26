import { _decorator, Component, Node, math, EditBox, Label, find } from 'cc';
import { LanguageData } from '../../core/gui/language/LanguageData';
import { LanguageLabel } from '../../core/gui/language/LanguageLabel';
import { AlertParam } from '../../core/gui/prompt/Alert';
import { tips } from '../../core/gui/prompt/TipsManager';
import { oops } from '../../core/Oops';
import { CommonUtil } from '../../core/utils/CommonUtil';
import { UIID } from '../common/config/GameUIConfig';
import HttpHome from '../common/net/HttpHome';
import TableNfts, { NftCfg } from '../common/table/TableNfts';
import { TradeState } from '../data/constant';
import { PlayerManger } from '../data/playerManager';
import WalletUtil, { TradeFlagState } from './WalletUtil';
import { WalletMaterial } from './widget/WalletMaterial';
const { ccclass, property, type } = _decorator;

@ccclass('WalletItemSellPopUp')
export class WalletItemSellPopUp extends Component {
    @type(LanguageLabel)
    nameLbl: LanguageLabel = null;
    @type(EditBox)
    editBox: EditBox = null;
    @type(EditBox)
    numEditBox: EditBox = null;
    @type(WalletMaterial)
    walletMaterial: WalletMaterial = null;
    @type(Node)
    setUpNode: Node = null;   
    @type(Node)
    confirmNode: Node = null;   
    param: WalletItemSellPopUpParam = null;
    tradeId: number = 0;
    tokenType: core.NftMaterialType = 0;
    start() {

    }

    update(deltaTime: number) {

    }

    onAdded(param: WalletItemSellPopUpParam) {
        this.param = param;
        this.tokenType = this.param.material.tokenType;
        this.walletMaterial.init(this.param.material);
        this.nameLbl.dataID = this.walletMaterial.baseMaterial.nftCfg.display_name;

        this.setUpNode.active = true;
        this.confirmNode.active = false;

        if (param.state == TradeFlagState.READY) {
            this.walletMaterial.setNum(this.param.material.total - this.param.material.locking);
        } else {
            this.walletMaterial.setNum(this.param.material.locking);
        }
    }

      
    async confimClick() {
        let num = Number(this.numEditBox.string);
        let price = CommonUtil.etherToWei(this.editBox.string);
        if (num <= 0 || price.lte(0) || num > this.param.material.total - this.param.material.locking) {
            oops.gui.toast('market_tips_err', true);
            return;
        }

        let gas = "0";
        let usd = "0";
        let _d = await HttpHome.queryGas("MaterialTradeSellReq", watrade.MaterialTradeSellReq.create({
            tokenType: this.tokenType,
            cnt: num,
            bnbPrice: price.toFixed(),
        }));
        if (_d) {
            gas = `${CommonUtil.weiToEther(_d.gas).toFixed()}`;
            usd = _d.usd;
        } else {
            return;
        }

        this.setUpNode.active = false;
        this.confirmNode.active = true;

        find('priceNode/num', this.confirmNode).getComponent(Label).string = `${this.editBox.string}`;
        find('numNode/num', this.confirmNode).getComponent(Label).string = `${this.numEditBox.string}`;
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
    }

    textChangedCheckNumber(text: string, e: EditBox, customEventData: string) {
        e.string = WalletUtil.checkNumber(text, customEventData);

        let p = e.string;
        let d = p.split(".");
        if (d[1]) {
            d[1] = d[1].substring(0, 5);
            p = d[0] + "." + d[1];
        }
        e.string = p
    }

      
    async sellClick() {
        let price = this.editBox.string;
        let num = this.numEditBox.string;
        let nftId = this.tradeId;

        let closeCB = () => {
            this.closeClick();
            oops.gui.remove(UIID.MaterialInfoPopUp);
        }

        HttpHome.materialTradeSell(this.tokenType, Number(num), CommonUtil.etherToWei(price).toFixed())
            .then((d: watrade.MaterialTradeSellResp) => {
            }).catch(async (e: { code: errcode.ErrCode, data: watrade.MaterialTradeSellResp }) => {

                let cb = async () => {
                    let d = await HttpHome.materialTradeState(e.data.subTradeId);
                    if (d.state == TradeState.StateOk) {
                        let materialType = this.walletMaterial.baseMaterial.nftCfg.material_type;
                        PlayerManger.getInstance().playerSelfInfo.addMaterials([{ tokenType: materialType, cnt: -Number(num) }]);

                        closeCB();

                        oops.gui.open<AlertParam>(UIID.Alert, {
                            content: LanguageData.getLangByIDAndParams('wallet_tips1', [
                                {
                                    key: "id",
                                    value: `${materialType}`
                                }
                            ]),
                            okCB: () => { },
                        });

                        tips.hideNetLoadigMask();
                    } else if (d.state == TradeState.StateFailed) {
                          
                        oops.gui.toast('market_fail1', true);
                        tips.hideNetLoadigMask();
                    } else {
                        this.scheduleOnce(cb, 10);
                    }
                }

                if (e.code == errcode.ErrCode.WaitComplete) {
                    tips.showNetLoadigMask({
                        content: "netInstableOpen",
                        isShowCloseCD: true,
                        cb: () => {
                            this.unschedule(cb);
                            closeCB();
                        }
                    })
                    this.scheduleOnce(cb, 10);
                } else {
                    tips.hideNetLoadigMask();
                }
            });
    }

    closeClick() {
        oops.gui.removeByNode(this.node, true);
    }
}

export type WalletItemSellPopUpParam = {
    material?: core.IMaterial,
    state: TradeFlagState,
}