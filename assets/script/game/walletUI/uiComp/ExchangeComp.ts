import { _decorator, Component, Node, Graphics, Color, UITransform, Event, find, Sprite, SpriteFrame, Vec3, v3, EditBox, log, Label } from 'cc';
import { LanguageLabel } from '../../../core/gui/language/LanguageLabel';
import List from '../../../core/gui/list/List';
import { tips } from '../../../core/gui/prompt/TipsManager';
import { oops } from '../../../core/Oops';
import { CommonUtil } from '../../../core/utils/CommonUtil';
import HttpHome from '../../common/net/HttpHome';
import { netChannel } from '../../common/net/NetChannelManager';
import WalletUtil, { CurrItem, CurrItems, CurrType } from '../WalletUtil';
import { AlertParam } from '../../../core/gui/prompt/Alert';
import { UIID } from '../../common/config/GameUIConfig';
import { LanguageData } from '../../../core/gui/language/LanguageData';
const { ccclass, property, type } = _decorator;

enum DropDownType {
    Send = '0',
    Receive = '1',
}

@ccclass('ExchangeComp')
export class ExchangeComp extends Component {
    @property(Node)
    sendNode: Node = null;
    @property(LanguageLabel)
    sendLbl: LanguageLabel = null;
    @property(EditBox)
    sendEditbox: EditBox = null;
    sendType: CurrType;

    @property(Node)
    receiveNode: Node = null;
    @property(LanguageLabel)
    receiveLbl: LanguageLabel = null;
    @property(EditBox)
    receiveEditbox: EditBox = null;
    receiveType: CurrType;

    @property([SpriteFrame])
    icons: SpriteFrame[] = [];
    @property(Sprite)
    sendIcon: Sprite = null;
    @property(Sprite)
    receiveIcon: Sprite = null;
    @property(Node)
    rateNode: Node = null;
    sendMax = "0";
    changeType = CurrType.GDNA;
    start() {

    }

    update(deltaTime: number) {

    }

    async init() {
        this.changeFun(false);
    }

    sendAllClick() {
        let num = WalletUtil.getCurrByType(this.sendType);
        if (new BigNumber(num).lte(CommonUtil.etherToWei("1"))) return;
        this.sendEditbox.string = CommonUtil.weiToEtherStr(num);
        this.editingDidEndClick(null, DropDownType.Send);
    }

    changeClick() {
        this.changeFun();
    }

    changeFun(isChange = true) {
        if (isChange == false) {
            if (this.changeType == CurrType.GDNA) {
                this.updSend(CurrItems[CurrType.GDNA]);
                this.updReceive(CurrItems[CurrType.GDGG]);
            } else {
                this.updSend(CurrItems[CurrType.GDGG]);
                this.updReceive(CurrItems[CurrType.GDNA]);
            }
        } else {
            if (this.changeType == CurrType.GDNA) {
                this.changeType = CurrType.GDGG;
                this.updSend(CurrItems[CurrType.GDGG]);
                this.updReceive(CurrItems[CurrType.GDNA]);
            } else {
                this.changeType = CurrType.GDNA;
                this.updSend(CurrItems[CurrType.GDNA]);
                this.updReceive(CurrItems[CurrType.GDGG]);
            }
        }

        this.showNull();
    }

      
    updSend(info: CurrItem) {
        this.sendIcon.spriteFrame = this.icons.find((v, k) => v.name == info.iconStroke);;
        let icon = this.rateNode.getChildByName('sendIcon').getComponent(Sprite);
        icon.spriteFrame = this.sendIcon.spriteFrame;

        this.sendLbl.params = [
            {
                key: 'num',
                value: `${CommonUtil.weiToEtherStr(WalletUtil.getCurrByType(info.currType))}`
            }
        ]
        this.sendMax = CommonUtil.weiToEtherStr(WalletUtil.getCurrByType(info.currType));
        this.sendType = info.currType;
    }

      
    updReceive(info: CurrItem) {
        this.receiveIcon.spriteFrame = this.icons.find((v, k) => v.name == info.iconStroke);;
        let icon = this.rateNode.getChildByName('receiveIcon').getComponent(Sprite);
        icon.spriteFrame = this.receiveIcon.spriteFrame;

        this.receiveLbl.params = [
            {
                key: 'num',
                value: `${CommonUtil.weiToEtherStr(WalletUtil.getCurrByType(info.currType))}`
            }
        ]
        this.receiveType = info.currType;
    }

    showNull() {
        this.sendEditbox.string = "";
        this.receiveEditbox.string = "";
        this.updRateNode("0", "0");
    }

    updRateNode(fromAmount: string, toAmount: string) {
        this.rateNode.getChildByName("sendLab").getComponent(Label).string = fromAmount == "0" ? "0" : "1";
        this.rateNode.getChildByName("receiveLab").getComponent(Label).string = "≈" + (toAmount == "0" ? "0" : CommonUtil.weiToEtherStr(CommonUtil.etherToWei(new BigNumber(toAmount).div(fromAmount).toFixed()).toFixed()));
    }

    async editingDidEndClick(e: Event, customEventData: string) {
        let dropDownType = customEventData as DropDownType;
        if (dropDownType == DropDownType.Send) {
            if (this.sendEditbox.string == "" || this.sendEditbox.string == "0") {
                this.showNull();
                return
            }
            if (new BigNumber(this.sendEditbox.string).gt(this.sendMax)) {
                oops.gui.toast("exchange_tips_max", true);
                return
            }

            let d = await HttpHome.calcExchangeRate(CurrItems[this.sendType].serverName, CommonUtil.etherToWei(this.sendEditbox.string).toFixed());
            if (d) {
                this.sendEditbox.string = CommonUtil.weiToEtherStr(d.fromAmount);
                this.receiveEditbox.string = CommonUtil.weiToEtherStr(d.toAmount);
                this.updRateNode(d.fromAmount, d.toAmount);
            }
        } else if (dropDownType == DropDownType.Receive) {
            if (this.receiveEditbox.string == "" || this.receiveEditbox.string == "0") {
                this.showNull();
                return
            }

            let d = await HttpHome.calcExchangeRate(CurrItems[this.sendType].serverName, CommonUtil.etherToWei(this.receiveEditbox.string).toFixed());
            if (d) {
                this.receiveEditbox.string = CommonUtil.weiToEtherStr(d.fromAmount);
                this.sendEditbox.string = CommonUtil.weiToEtherStr(d.toAmount);
                this.updRateNode(d.fromAmount, d.toAmount);
            }
        }

        this.rateNode.active = true;
    }

    textChangedCheckNumber(text: string, e: EditBox, customEventData: string) {
        e.string = WalletUtil.checkNumber(text, "double");
    }

    async okClick() {
        if (new BigNumber(this.sendEditbox.string).lt(1)) {
            oops.gui.toast(LanguageData.getLangByIDAndParams("exchange_tips_min", [
                { key: "name", value: LanguageData.getLangByID(CurrItems[this.sendType].i18Key) }
            ]), true);
            return
        }
        if (new BigNumber(this.sendEditbox.string).gt(this.sendMax)) {
            oops.gui.toast("exchange_tips_max", true);
            return
        }

        let data = pkgcs.CsExchangeTokenReq.create(
            {
                fromType: CurrItems[this.sendType].serverName,
                fromAmount: CommonUtil.etherToWei(this.sendEditbox.string).toFixed(),
                minToAmount: CommonUtil.etherToWei("1").toFixed(),
            }
        );

        tips.showNetLoadigMask<pkgsc.ScExchangeTokenPush>({
            content: "wallet_desc_9",
            closeEventName: [
                `${opcode.OpCode.ScExchangeTokenPush}`,
            ],
        }, async () => {
            let d = await netChannel.home.reqUnique(opcode.OpCode.CsExchangeTokenReq, opcode.OpCode.ScExchangeTokenResp, data);
            if (d.code == errcode.ErrCode.WaitComplete || d.code == errcode.ErrCode.Ok) {
            } else {
                tips.hideNetLoadigMask();
            }
        }).then(_d => {
            if (_d?.code == errcode.ErrCode.Ok) {
                let str = LanguageData.getLangByIDAndParams("exchange_tips_succ", [
                    {
                        key: "num1",
                        value: CommonUtil.weiToEtherStr(_d.fromAmount)
                    },
                    {
                        key: "num2",
                        value: CommonUtil.weiToEtherStr(_d.toAmount)
                    },
                    { key: "name1", value: LanguageData.getLangByID(CurrItems[this.sendType].i18Key) },
                    { key: "name2", value: LanguageData.getLangByID(CurrItems[this.receiveType].i18Key) },
                ]);

                oops.gui.open<AlertParam>(UIID.Alert, {
                    content: str,
                    okCB: () => { },
                });
            }
        })
    }
}

