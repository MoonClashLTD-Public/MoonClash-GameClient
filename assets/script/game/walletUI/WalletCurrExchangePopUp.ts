import { _decorator, Component, Node, Graphics, Color, UITransform, Event, find, Sprite, SpriteFrame, Vec3, v3, EditBox, log, Label } from 'cc';
import { LanguageLabel } from '../../core/gui/language/LanguageLabel';
import List from '../../core/gui/list/List';
import { tips } from '../../core/gui/prompt/TipsManager';
import { oops } from '../../core/Oops';
import { CommonUtil } from '../../core/utils/CommonUtil';
import HttpHome from '../common/net/HttpHome';
import { netChannel } from '../common/net/NetChannelManager';
import { PlayerManger } from '../data/playerManager';
import WalletUtil, { CurrItem, CurrItems, CurrType } from './WalletUtil';
const { ccclass, property, type } = _decorator;

enum DropDownType {
    Send = '0',
    Receive = '1',
}

@ccclass('WalletCurrExchangePopUp')
export class WalletCurrExchangePopUp extends Component {
    @property(Node)
    sendNode: Node = null;
    @property(Sprite)
    sendIcon: Sprite = null;
    @property(LanguageLabel)
    sendLbl: LanguageLabel = null;
    @property(EditBox)
    sendEditbox: EditBox = null;
    sendType: CurrType;

    @property(Node)
    receiveNode: Node = null;
    @property(Sprite)
    receiveIcon: Sprite = null;
    @property(LanguageLabel)
    receiveLbl: LanguageLabel = null;
    @property(EditBox)
    receiveEditbox: EditBox = null;
    receiveType: CurrType;

    @property([SpriteFrame])
    icons: SpriteFrame[] = [];
    @property(Node)
    dropDownNode: Node = null;
    dropDownType: DropDownType
    dropDownItems: CurrItem[] = [];
    @type(Node)
    setUpNode: Node = null;
    @type(Node)
    confirmNode: Node = null;
    start() {

    }

    update(deltaTime: number) {

    }

    async onAdded() {
        this.setUpNode.active = true;
        this.confirmNode.active = false;

        this.updSend(CurrItems[CurrType.BNB]);
        this.updReceive(CurrItems[CurrType.DGG]);
        tips.showLoadingMask();
        let idx = 0;
        let cb = async () => {
            let data = pkgcs.CsQueryBuyErc20RateReq.create();
            let d = await netChannel.home.reqUnique(opcode.OpCode.CsQueryBuyErc20RateReq, opcode.OpCode.ScQueryBuyErc20RateResp, data);
            if (d?.code == errcode.ErrCode.Ok) {
                // 1bnb（ether) => xdna(wei)
                CurrItems[CurrType.BNB].rates = {
                    [CurrType.DNA]: CommonUtil.weiToEther(d.dnaRate).toFixed(),
                    [CurrType.DGG]: CommonUtil.weiToEther(d.dggRate).toFixed(),
                }
                CurrItems[CurrType.DNA].rates = {
                    [CurrType.BNB]: new BigNumber(1).div(d.dnaRate).toFixed(),
                }
                CurrItems[CurrType.DGG].rates = {
                    [CurrType.BNB]: new BigNumber(1).div(d.dggRate).toFixed(),
                }
                tips.hideLoadingMask();
            } else {
                if (idx > 5) {
                    oops.gui.toast('wallet_tips3', true);
                    return this.closeClick();
                }
                this.scheduleOnce(cb, 1);
                idx++;
            }
        }
        cb();
    }

    sendAllClick() {
        let num = WalletUtil.getCurrByType(this.sendType);
        this.sendEditbox.string = CommonUtil.weiToEther(num).toFixed();
        this.editingDidEndClick(null, DropDownType.Send);
    }

      
    updSend(info: CurrItem) {
        this.sendIcon.spriteFrame = this.icons.find((v, k) => v.name == info.icon);;
        this.sendLbl.dataID = `${info.i18Key}`;

        let balanceNum = find('Label-001', this.sendNode).getComponent(LanguageLabel);
        balanceNum.params = [
            {
                key: 'num',
                value: `${CommonUtil.weiToEther(WalletUtil.getCurrByType(info.currType)).toFixed()}`
            }
        ]

        this.sendType = info.currType;
    }

      
    updReceive(info: CurrItem) {
        this.receiveIcon.spriteFrame = this.icons.find((v, k) => v.name == info.icon);;
        this.receiveLbl.dataID = `${info.i18Key}`;

        let balanceNum = find('Label-001', this.receiveNode).getComponent(LanguageLabel);
        balanceNum.params = [
            {
                key: 'num',
                value: `${CommonUtil.weiToEther(WalletUtil.getCurrByType(info.currType)).toFixed()}`
            }
        ]
        this.receiveType = info.currType;
    }

    editingDidEndClick(e: Event, customEventData: string) {
        let dropDownType = customEventData as DropDownType;
        if (dropDownType == DropDownType.Send) {
            let sendNum = this.sendEditbox.string;
            let rate = new BigNumber(CurrItems[this.sendType].rates[this.receiveType]);
            this.receiveEditbox.string = new BigNumber(sendNum).times(rate).toFixed();
        } else if (dropDownType == DropDownType.Receive) {
            let receiveNum = this.receiveEditbox.string;
            let rate = new BigNumber(CurrItems[this.sendType].rates[this.receiveType]);
            this.sendEditbox.string = new BigNumber(receiveNum).div(rate).toFixed();
        }
    }

    dropDownClick(e: Event, customEventData: string) {
        this.dropDownType = customEventData as DropDownType;
        if (customEventData == DropDownType.Send) {
            this.dropDownItems = [];
            for (const key in CurrItems) {
                let item = CurrItems[key];
                if (item.icon != this.receiveIcon.spriteFrame.name) {
                    if (item.currType == CurrType.BNB)   
                        this.dropDownItems.push(item);
                }
            }
        } else if (customEventData == DropDownType.Receive) {
            this.dropDownItems = [];
            for (const key in CurrItems) {
                let item = CurrItems[key];
                if (item.icon != this.sendIcon.spriteFrame.name) {
                    if (item.currType == CurrType.BNB
                        || item.currType == CurrType.DGG
                        || item.currType == CurrType.DNA
                    )
                        this.dropDownItems.push(item);
                }
            }
        }
        this.updDropDown(true, e.currentTarget.getWorldPosition());
    }
    dropDownHideClick() {
        this.updDropDown(false);
    }

    selectedEvent(item: Node, idx: number) {
        let info = this.dropDownItems[idx];
        this.updDropDown(false);
        switch (this.dropDownType) {
            case DropDownType.Send:
                this.updSend(info);
                break;
            case DropDownType.Receive:
                this.updReceive(info);
                break;
            default:
                break;
        }
    }
    renderEvent(item: Node, idx: number) {
        let info = this.dropDownItems[idx];
        let icon = find('icon', item).getComponent(Sprite);
        let name = find('Label', item).getComponent(LanguageLabel);
        icon.spriteFrame = this.icons.find((v, k) => v.name == info.icon);
        name.dataID = `${info.i18Key}`;
    }

      
    updDropDown(bf: boolean, wPos?: Vec3) {
        this.dropDownNode.active = bf;
        if (bf) {
            let list = this.dropDownNode.getComponentInChildren(List);
            list.numItems = this.dropDownItems.length;
            list.node.setWorldPosition(v3(wPos.x - 100, wPos.y - 30, 0));
        }
    }

    async confimClick() {
        let price = new BigNumber(this.sendEditbox.string);
        if (price.isNaN() || price.lte(0)) {
            oops.gui.toast('market_tips_err', true);
            return
        }

        let gas = "0";
        let usd = "0";
        let _d = await HttpHome.queryGas("CsBuyErc20TokenReq", pkgcs.CsBuyErc20TokenReq.create(
            {
                bnb: CommonUtil.etherToWei(price.toFixed()).toFixed(),
                tokenType: CurrItems[this.receiveType].serverName,
            }
        ));
        if (_d) {
            gas = `${CommonUtil.weiToEther(_d.gas).toFixed()}`;
            usd = _d.usd;
        } else {
            return;
        }

        this.setUpNode.active = false;
        this.confirmNode.active = true;

        find('priceNode/icon', this.confirmNode).getComponent(Sprite).spriteFrame = this.sendIcon.spriteFrame;
        find('priceNode/num', this.confirmNode).getComponent(Label).string = `${price.toFixed()}`;
        // find('poundageNode/icon', this.confirmNode).getComponent(Sprite).spriteFrame = this.receiveIcon.spriteFrame;
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
    }

    async okClick() {
        let data = pkgcs.CsBuyErc20TokenReq.create(
            {
                bnb: CommonUtil.etherToWei(this.sendEditbox.string).toFixed(),
                tokenType: CurrItems[this.receiveType].serverName,
            }
        );
        let d = await netChannel.home.reqUnique(opcode.OpCode.CsBuyErc20TokenReq, opcode.OpCode.ScBuyErc20TokenResp, data);
        if (d.code == errcode.ErrCode.WaitComplete) {
            let _d = await tips.showNetLoadigMask<pkgsc.ScBuyErc20TokenPush>({
                content: "wallet_desc_9",
                closeEventName: `${opcode.OpCode.ScBuyErc20TokenPush}`,
            })
            this.closeClick();
            if (_d?.code == errcode.ErrCode.Ok) {

                // oops.gui.open<AlertParam>(UIID.Alert, {
                //     content: LanguageData.getLangByIDAndParams('wallet_tips', [
                //         {
                //             key: "num1",
                //             value: price
                //         },
                //         {
                //             key: "num2",
                //             value: "0"
                //         },
                //         {
                //             key: "addr",
                //             value: addr
                //         },
                //     ]),
                // });
            }
        }
    }

    closeClick() {
        oops.gui.removeByNode(this.node, true);
    }
}

