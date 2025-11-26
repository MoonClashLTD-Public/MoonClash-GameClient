import { _decorator, Component, Node, find, Label, instantiate, Sprite, SpriteFrame, Event, Button, NodeEventType, EventTouch, Tween, tween, v3 } from 'cc';
import { Message } from '../../../core/common/event/MessageManager';
import { LanguageLabel } from '../../../core/gui/language/LanguageLabel';
import { tips } from '../../../core/gui/prompt/TipsManager';
import { oops } from '../../../core/Oops';
import { CommonUtil } from '../../../core/utils/CommonUtil';
import { UIID } from '../../common/config/GameUIConfig';
import { netChannel } from '../../common/net/NetChannelManager';
import { DataEvent } from '../../data/dataEvent';
import { PlayerManger } from '../../data/playerManager';
import { SettingPopUp } from '../../settingPopUp/SettingPopUp';
import { WalletCurrTransferPopUpParam } from '../WalletCurrTransferPopUp';
import WalletUtil, { CurrItem, CurrItems, CurrType } from '../WalletUtil';
import { ExchangeComp } from '../uiComp/ExchangeComp';
const { ccclass, property, type } = _decorator;

@ccclass('WalletComp')
export class WalletComp extends Component {
    @type(ExchangeComp)
    exchangeComp: ExchangeComp = null;
    @type(Label)
    addressLbl: Label = null;
    @type(LanguageLabel)
    bnbLbl: LanguageLabel = null;
    @type(Node)
    svNodes: Node[] = [];
    @type(Node)
    gameNode: Node = null;   
    @type(Node)
    walletNode: Node = null;   
    @type([SpriteFrame])
    icons: SpriteFrame[] = []
    @type([Node])
    currNodes: Node[] = []
    isShow = false;

    @property(SettingPopUp)
    settingPopUp: SettingPopUp = null;

    start() {
        this.addEvent();
    }

    update(deltaTime: number) {

    }

    onDestroy() {
        this.removeEvent();
    }

    show() {
        this.isShow = true;

        this.svNodes.forEach(e => e.active = true);
        this.init();

        this.settingPopUp.onAdded();
    }

    hide() {
        this.isShow = false;

        this.svNodes.forEach(e => e.active = false);
    }

    init() {
        this.updInfo();
        this.updGame();
        this.updWallet();
        // this.updRate();
        this.exchangeComp.init();
    }

    async updRate() {
        let data = pkgcs.CsQueryBuyErc20RateReq.create();
        let d = await netChannel.home.reqUnique(opcode.OpCode.CsQueryBuyErc20RateReq, opcode.OpCode.ScQueryBuyErc20RateResp, data);
        if (d.code == errcode.ErrCode.Ok) {
            CurrItems[CurrType.BNB].rates = {
                [CurrType.DNA]: CommonUtil.weiToEther(d.dnaRate).toFixed(),
                [CurrType.DGG]: CommonUtil.weiToEther(d.dggRate).toFixed(),
            }
            this.updInfo();
        }
        this.unschedule(this.updRate);
        this.scheduleOnce(this.updRate, 5);
    }

    updAll() {
        if (this.isShow == false) return;
        this.init();
    }

    iconActInit(n: Node) {
        let _n = (n as Node).children.find(e => e.name.startsWith("icon_"));
        if (!_n) return;
        _n.parent.off(NodeEventType.TOUCH_START, this.iconActStart, this);
        _n.parent.off(NodeEventType.TOUCH_END, this.iconActEnd, this);
        _n.parent.off(NodeEventType.TOUCH_CANCEL, this.iconActEnd, this);

        _n.parent.on(NodeEventType.TOUCH_START, this.iconActStart, this);
        _n.parent.on(NodeEventType.TOUCH_END, this.iconActEnd, this);
        _n.parent.on(NodeEventType.TOUCH_CANCEL, this.iconActEnd, this);
    }

    iconActStart(e: Event) {
        let n = (e.target as Node).children.find(e => e.name.startsWith("icon_"));
        if (n) {
            Tween.stopAllByTarget(n);
            tween(n).to(0.1, { scale: v3(0.9, 0.9, 0.9) }).start();
        }
    }

    iconActEnd(e: EventTouch) {
        let n = (e.target as Node).children.find(e => e.name.startsWith("icon_"));
        if (n) {
            Tween.stopAllByTarget(n);
            tween(n).to(0.1, { scale: v3(1, 1, 1) }).start();
        }
    }

    updInfo() {
        // let totalBnb = CommonUtil.weiToEther(WalletUtil.getTotalCurrByType(CurrType.BNB));
        // let totalDgg = CommonUtil.weiToEther(WalletUtil.getTotalCurrByType(CurrType.DGG));
        // let totalDna = CommonUtil.weiToEther(WalletUtil.getTotalCurrByType(CurrType.DNA));
        // let dnaRates = CurrItems[CurrType.BNB].rates[CurrType.DNA];
        // let dggRates = CurrItems[CurrType.BNB].rates[CurrType.DGG];

        // let dgg = dggRates ? totalDgg.div(dggRates) : 0;
        // let dna = dnaRates ? totalDna.div(dnaRates) : 0;
        // let bnb = totalBnb;
        // let num = bnb.plus(dna).plus(dgg).toFixed(6);
        // this.bnbLbl.params = [
        //     {
        //         key: "num",
        //         value: `${num}`
        //     }
        // ]

        this.addressLbl.string = PlayerManger.getInstance().playerSelfInfo.walletAddr;
        this.bnbLbl.params = [
            {
                key: "num",
                value: `${CommonUtil.weiToEtherStr(WalletUtil.getTotalCurrByType(CurrType.BNB))}`
            }
        ]

        this.iconActInit(this.addressLbl.node.parent);

        this.currNodes.forEach(e => {
            let currType = Number(e.getComponent(Button).clickEvents[0].customEventData);
            let curr = WalletUtil.getCurrByType(currType);
            e.getChildByName("icon").getComponent(Sprite).spriteFrame = this.icons.find(e => e.name == CurrItems[currType].iconStroke);
            e.getChildByName("nameLbl").getComponent(LanguageLabel).dataID = `${CurrItems[currType].i18Key}`;
            e.getChildByName("numLbl").getComponent(Label).string = `${CommonUtil.weiToEtherStr(curr)}`;

            this.iconActInit(e);
        })
    }

      
    updGame() {
        let parentNode = this.gameNode;
        let tmpItem = parentNode.children[1];
        tmpItem.active = false;
        let arr: CurrItem[] = [];
        arr.push(CurrItems[CurrType.GDGG]);
        arr.push(CurrItems[CurrType.GDNA]);
        for (let index = 0; index < parentNode.children.length; index++) {
            if (index > 1) {
                parentNode.children[index].destroy();
            }
        }

        for (const item of arr) {
            let itemNode = instantiate(tmpItem);
            parentNode.addChild(itemNode);
            itemNode.active = true;
            this.updItem(itemNode, item);
        }
    }

      
    updWallet() {
        let parentNode = this.walletNode;
        let tmpItem = parentNode.children[1];
        tmpItem.active = false;
        let arr: CurrItem[] = [];
        arr.push(CurrItems[CurrType.DGG]);
        arr.push(CurrItems[CurrType.DNA]);
        arr.push(CurrItems[CurrType.BNB]);
        for (let index = 0; index < parentNode.children.length; index++) {
            if (index > 1) {
                parentNode.children[index].destroy();
            }
        }

        for (const item of arr) {
            let itemNode = instantiate(tmpItem);
            parentNode.addChild(itemNode);
            itemNode.active = true;
            this.updItem(itemNode, item);
        }
    }

    updItem(node: Node, itemParam: CurrItem) {
        let titleLbl = find('titleLbl', node).getComponent(LanguageLabel);
        let currIcon = find('curr/icon', node).getComponent(Sprite);
        let numLbl = find('Label', node).getComponent(Label);
        titleLbl.dataID = itemParam.i18Key;
        numLbl.string = `${CommonUtil.weiToEther(WalletUtil.getCurrByType(itemParam.currType)).toFixed(6)}`;
        currIcon.spriteFrame = this.icons.find((v, k) => v.name == itemParam.icon);
    }

    async refeshClick() {
        tips.showNetLoadigMask();
        await CommonUtil.waitCmpt(this, 0.3);
        PlayerManger.getInstance().playerSelfInfo.refreshData().then(() => {
            tips.hideNetLoadigMask();
        });
    }

    copyClick() {
        CommonUtil.copyToClipboard(PlayerManger.getInstance().playerSelfInfo.walletAddr);
        oops.gui.toast('aws_code_copy', true);
    }

      
    transferClick(e: Event, customEventData: string) {
        if (Number(customEventData) == CurrType.BNB) {
            oops.gui.open<WalletCurrTransferPopUpParam>(UIID.WalletCurrTransferPopUp, { currType: CurrType.BNB });
        } else if (Number(customEventData) == CurrType.GDNA) {
            oops.gui.open<WalletCurrTransferPopUpParam>(UIID.WalletCurrTransferPopUp, { currType: CurrType.GDNA });
        } else if (Number(customEventData) == CurrType.DGGV2) {
            oops.gui.open<WalletCurrTransferPopUpParam>(UIID.WalletCurrTransferPopUp, { currType: CurrType.DGGV2 });
        } else {
            oops.gui.toast("share_desc_0_1", true)
        }
    }

    addEvent() {
        Message.on(`${opcode.OpCode.ScBuyErc20TokenPush}`, this.ScBuyErc20TokenPush, this);
        Message.on(DataEvent.DATA_CURRENCY_CHANGE, this.updAll, this);
    }
    removeEvent() {
        Message.off(`${opcode.OpCode.ScBuyErc20TokenPush}`, this.ScBuyErc20TokenPush, this);
        Message.off(DataEvent.DATA_CURRENCY_CHANGE, this.updAll, this);
    }

    ScBuyErc20TokenPush(event: string, data: string) {
        if (this.isShow)
            this.init();
    }
}