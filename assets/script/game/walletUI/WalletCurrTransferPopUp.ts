import { _decorator, Component, Node, Graphics, Color, UITransform, EditBox, find, Sprite, SpriteFrame, v3, Event, Vec3, Label } from 'cc';
import { LanguageData } from '../../core/gui/language/LanguageData';
import { LanguageLabel } from '../../core/gui/language/LanguageLabel';
import List from '../../core/gui/list/List';
import { AlertParam } from '../../core/gui/prompt/Alert';
import { tips } from '../../core/gui/prompt/TipsManager';
import { oops } from '../../core/Oops';
import { CommonUtil } from '../../core/utils/CommonUtil';
import { NativeUtil } from '../../core/utils/NativeUtil';
import { UIID } from '../common/config/GameUIConfig';
import HttpHome from '../common/net/HttpHome';
import { netChannel } from '../common/net/NetChannelManager';
import TableGlobalConfig from '../common/table/TableGlobalConfig';
import { PlayerManger } from '../data/playerManager';

import WalletUtil, { CurrItem, CurrItems, CurrType } from './WalletUtil';
const { ccclass, property, type } = _decorator;

@ccclass('WalletCurrTransferPopUp')
export class WalletCurrTransferPopUp extends Component {
    @property(Node)
    dropDownNode: Node = null;
    @property(EditBox)
    priceEditbox: EditBox = null;
    @property(EditBox)
    addrEditbox: EditBox = null;
    @property(Sprite)
    transferIcon: Sprite = null;
    @property(LanguageLabel)
    transferLbl: LanguageLabel = null;
    @property(Node)
    transferNode: Node = null;
    @property([SpriteFrame])
    icons: SpriteFrame[] = [];

    transferType: CurrType;
    currItems: CurrItem[] = [];
    @type(Node)
    setUpNode: Node = null;
    @type(Node)
    confirmNode: Node = null;

    start() {

    }

    update(deltaTime: number) {

    }

    async onAdded(param: WalletCurrTransferPopUpParam) {
        this.setUpNode.active = true;
        this.confirmNode.active = false;

        this.currItems = [
            CurrItems[CurrType.BNB],
            // CurrItems[CurrType.DGG],
            CurrItems[CurrType.GDNA],
            CurrItems[CurrType.DGGV2],
        ];
        if (param) {
            this.updTransfer(CurrItems[param.currType]);
        } else {
            this.updTransfer(CurrItems[CurrType.BNB]);
        }
    }

      
    updTransfer(info: CurrItem) {
        this.transferIcon.spriteFrame = this.icons.find((v, k) => v.name == info.icon);;
        this.transferLbl.dataID = `${info.i18Key}`;

        let balanceNum = find('Label-001', this.transferNode).getComponent(LanguageLabel);
        balanceNum.params = [
            {
                key: 'num',
                value: `${CommonUtil.weiToEther(WalletUtil.getCurrByType(info.currType)).toFixed()}`
            }
        ]

        this.transferType = info.currType;
    }

    allClick() {
        this.priceEditbox.string = CommonUtil.weiToEther(WalletUtil.getCurrByType(this.transferType)).toFixed();
    }


    dropDownClick(e: Event, customEventData: string) {
        this.updDropDown(true, e.currentTarget.getWorldPosition());
    }
    dropDownHideClick() {
        this.updDropDown(false);
    }
    selectedEvent(item: Node, idx: number) {
        let info = this.currItems[idx];
        this.updDropDown(false);
        this.updTransfer(info);
    }
    renderEvent(item: Node, idx: number) {
        let info = this.currItems[idx];
        let icon = find('icon', item).getComponent(Sprite);
        let name = find('Label', item).getComponent(LanguageLabel);
        icon.spriteFrame = this.icons.find((v, k) => v.name == info.icon);
        name.dataID = `${info.i18Key}`;
    }

      
    updDropDown(bf: boolean, wPos?: Vec3) {
        this.dropDownNode.active = bf;
        if (bf) {
            let list = this.dropDownNode.getComponentInChildren(List);
            list.numItems = this.currItems.length;
            list.node.setWorldPosition(v3(wPos.x - 100, wPos.y - 30, 0));
        }
    }

    async scanQRCodeClick() {
        let str = await NativeUtil.scanQRCode();
        if (str) {
            this.addrEditbox.string = str;
        }
    }

    async confimClick() {
        let price = new BigNumber(this.priceEditbox.string);
        let walletAddr = this.addrEditbox.string;
        if (!walletAddr || price.lte(0) || price.isNaN()) {
            oops.gui.toast('market_tips_err', true);
            return
        }

          
        let poundageGasNode = find('poundageGasNode', this.confirmNode);
          
        let poundageNode = find('poundageNode', this.confirmNode);
        poundageGasNode.active = false;
        poundageNode.active = false;

        if (this.transferType == CurrType.GDNA || this.transferType == CurrType.DGGV2) {
            let cost = price.times(TableGlobalConfig.cfg.transfer_in_game_tax_rate / 10000).toFixed();   

            this.setUpNode.active = false;
            this.confirmNode.active = true;
            poundageNode.active = true;

            find('priceNode/icon', this.confirmNode).getComponent(Sprite).spriteFrame = this.transferIcon.spriteFrame;
            find('priceNode/num', this.confirmNode).getComponent(Label).string = `${price.toFixed()}`;
            find('poundageNode/icon', this.confirmNode).getComponent(Sprite).spriteFrame = this.transferIcon.spriteFrame;
            find('poundageNode/num', this.confirmNode).getComponent(Label).string = `${cost}`;
            find('poundageNode/poundageLbl', this.confirmNode).getComponent(LanguageLabel).params = [
                {
                    key: 'num1',
                    value: `${1}`,
                },
                {
                    key: 'num2',
                    value: `${cost}`,
                }
            ];
        } else {
            let gas = "0";
            let usd = "0";

            let _d = await HttpHome.queryGas("TransferReq", nft.TransferReq.create({
                toWalletAddr: this.addrEditbox.string,
                tokenType: CurrItems[this.transferType].serverName,
                price: CommonUtil.etherToWei(price.toFixed()).toFixed(),
            }));
            if (_d) {
                gas = `${CommonUtil.weiToEther(_d.gas).toFixed()}`;
                usd = _d.usd;
            } else {
                return;
            }

            this.setUpNode.active = false;
            this.confirmNode.active = true;
            poundageGasNode.active = true;

            find('priceNode/icon', this.confirmNode).getComponent(Sprite).spriteFrame = this.transferIcon.spriteFrame;
            find('priceNode/num', this.confirmNode).getComponent(Label).string = `${price.toFixed()}`;
            find('poundageGasNode/num', this.confirmNode).getComponent(Label).string = `${gas}`;
            find('poundageGasNode/poundageLbl', this.confirmNode).getComponent(LanguageLabel).params = [
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
    }

    textChangedCheckNumber(text: string, e: EditBox, customEventData: string) {
        e.string = WalletUtil.checkNumber(text, customEventData);
    }

    async okClick() {
        //test 0x220FBEc5b9B3d84706d8aB9D6A7128994B2d6417

        let addr = this.addrEditbox.string;
        let price = this.priceEditbox.string;
        let info = CurrItems[this.transferType];


          
        if (this.transferType == CurrType.GDNA || this.transferType == CurrType.DGGV2) {
            this.newOK(price, addr);
            return;
        }

          
        let gas = find('poundageGasNode/num', this.confirmNode).getComponent(Label).string;
        if (CommonUtil.etherToWei(price).plus(CommonUtil.etherToWei(gas)).gt(WalletUtil.getCurrByType(info.currType))) {
            oops.gui.toast("not_enough_" + CurrType[info.currType].toLowerCase(), true);
            return
        }
        HttpHome.transfer(addr, info.serverName, CommonUtil.etherToWei(price).toFixed())
            .then((d: nft.TransferResp) => {
            }).catch(async (e: { code: errcode.ErrCode, data: watrade.TradeSellResp }) => {
                if (e.code == errcode.ErrCode.WaitComplete) {
                    let _d = await tips.showNetLoadigMask<pkgsc.ScTransferPush>({
                        content: "wallet_transfer_tips",
                        closeEventName: `${opcode.OpCode.ScTransferPush}`,
                    })
                    this.closeClick();
                    if (_d?.code == errcode.ErrCode.Ok) {
                        this.succTips(price, addr, this.transferType);
                    } else {
                        tips.hideNetLoadigMask();
                    }
                }
            });
    }

    newOK(price: string, walletAddr: string) {
        // 0x65612E25FCBe842Ea8Faa65a18d9980ddd2B2D6e
        let info = CurrItems[this.transferType];

        // let cost = find('poundageNode/num', this.confirmNode).getComponent(Label).string;
        if (CommonUtil.etherToWei(price).gt(WalletUtil.getCurrByType(info.currType))) {
            oops.gui.toast("not_enough_" + CurrType[info.currType].toLowerCase(), true);
            return
        }

          
        if ((info.currType == CurrType.GDNA || info.currType == CurrType.DGGV2) && new BigNumber(price).lt(10)) {
            oops.gui.toast("wallet_tips_gdna_transfer_limit", true);
            return
        }

        let data = pkgcs.CsTransferInGameReq.create();
        data.amount = CommonUtil.etherToWei(price).toFixed();
        data.tokenType = CurrItems[this.transferType].serverName.toLocaleLowerCase();
        data.toWallet = walletAddr;

        tips.showNetLoadigMask<pkgsc.ScTransferInGamePush>({
            content: "blind_page_alert_0",
            closeEventName: [
                `${opcode.OpCode.ScTransferInGamePush}`,
            ],
        }, async () => {
            let d = await netChannel.home.reqUnique(opcode.OpCode.CsTransferInGameReq, opcode.OpCode.ScTransferInGameResp, data);
            if (d.code == errcode.ErrCode.WaitComplete || d.code == errcode.ErrCode.Ok) {
                this.closeClick();
            } else {
                tips.hideNetLoadigMask();
            }
        }).then(_d => {
            if (_d?.code == errcode.ErrCode.Ok) {
                this.succTips(price, walletAddr, this.transferType);
            }
        })
    }

    succTips(price: string, walletAddr: string, transferType: CurrType) {
        oops.gui.open<AlertParam>(UIID.Alert, {
            content: LanguageData.getLangByIDAndParams('wallet_tips', [
                {
                    key: "num",
                    value: price
                },
                {
                    key: "name",
                    value: LanguageData.getLangByID(CurrItems[transferType].i18Key)
                },
                {
                    key: "addr",
                    value: walletAddr
                },
            ]),
            okCB: () => { },
        });
    }

    closeClick() {
        oops.gui.removeByNode(this.node, true);
    }
}

export type WalletCurrTransferPopUpParam = {
    currType: CurrType
}