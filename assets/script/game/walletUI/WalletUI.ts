import { _decorator, Component, Node, Button, Color, UITransform, ScrollView, Event, Toggle, Sprite, Label, tween, Tween, sys } from 'cc';
import { oops } from '../../core/Oops';
import { CommonUtil } from '../../core/utils/CommonUtil';
import { UIID } from '../common/config/GameUIConfig';
import { PlayerManger } from '../data/playerManager';
import { WalletCardComp } from './comp/WalletCardComp';
import { WalletComp } from './comp/WalletComp';
import { WalletEquipmentComp } from './comp/WalletEquipmentComp';
import { WalletItemComp } from './comp/WalletItemComp';
import { QRCodeComp } from './uiComp/QRCodeComp';
import { WalletCurrWithdrawConfirmPopUpParam } from './WalletCurrWithdrawConfirmPopUp';
import WalletUtil from './WalletUtil';
const { ccclass, property, type } = _decorator;

export enum WalletPageType {
      
    Wallet = 0,
      
    Card,
      
    Equipment,
      
    Item,
}

@ccclass('WalletUI')
export class WalletUI extends Component {
    @type(QRCodeComp)
    qrCodeComp: QRCodeComp = null
    @type(Node)
    topNode: Node = null;
    @type(ScrollView)
    sv: ScrollView = null;
    @type(WalletComp)
    walletComp: WalletComp = null;
    @type(WalletCardComp)
    cardComp: WalletCardComp = null;
    @type(WalletEquipmentComp)
    equipmentComp: WalletEquipmentComp = null;
    @type(WalletItemComp)
    itemComp: WalletItemComp = null;
    walletPageType: WalletPageType = WalletPageType.Wallet;

    @type(Node)
    withdrawTimeTipsNode: Node = null;
    @type(Button)
    withdrawBtn: Button = null;
    @type(Node)
    topBtnNode: Node = null;
    start() {
        this.topBtnNode.active = false;
        this.sv.node.on(ScrollView.EventType.SCROLLING, () => {
            this.topBtnNode.active = this.sv.getScrollOffset().y > 1400;
        }, this);
    }

    update(deltaTime: number) {

    }

    onAdded() {
        this.updatePage(this.walletPageType);

        this.withdrawTimeTipsNode.active = false;
        this.updWithdrawInfo();
        this.unschedule(this.updWithdrawInfo);
        this.schedule(this.updWithdrawInfo, 1);

        // PlayerManger.getInstance().playerSelfInfo.refreshData();
    }

    pageInit() {
        this.onAdded();
    }

    pageOuit() {
        WalletUtil.walletFlag++;
        this.cardComp.cardItemNode.destroyAllChildren();
    }

    checkEvent(tog: Toggle, customEventData: string) {
        this.updatePage(Number(tog.node.name));
    }

    updatePage(type: WalletPageType) {
        this.walletPageType = type;
        this.cardComp.cardItemNode.destroyAllChildren();
        this.walletComp.hide();
        this.cardComp.hide();
        this.equipmentComp.hide();
        this.itemComp.hide();

        type == WalletPageType.Wallet && this.walletComp.show();
        type == WalletPageType.Card && this.cardComp.show();
        type == WalletPageType.Equipment && this.equipmentComp.show();
        type == WalletPageType.Item && this.itemComp.show();
    }

      
    receiveClick() {
        this.qrCodeComp.show();
    }
      
    transferClick() {
        oops.gui.open(UIID.WalletCurrTransferPopUp);
    }
      
    withdrawClick() {
        let inviteNum = PlayerManger.getInstance().playerSelfInfo.inviteTimesSinceLastWithdraw;
        let time = PlayerManger.getInstance().playerSelfInfo.withdrawCdMs;
        if (time > 0) {
            this.withdrawTimeTipsNode.active = true;
            let d = CommonUtil.countDownDays(time / 1000);
            let str = `${d.d}D,${d.h}H:${d.m}M:${d.s}S`;
            this.withdrawTimeTipsNode.getComponentInChildren(Label).string = `${str}`;
            Tween.stopAllByTarget(this.withdrawTimeTipsNode);
            tween(this.withdrawTimeTipsNode)
                .delay(3)
                .call(() => {
                    this.withdrawTimeTipsNode.active = false;
                })
                .start();
        } else if (inviteNum <= 0) {
            oops.gui.open<WalletCurrWithdrawConfirmPopUpParam>(UIID.WalletCurrWithdrawConfirmPopUp, { isShareTips: true });
        } else {
            oops.gui.open(UIID.WalletCurrWithdrawPopUp);
        }
    }
      
    exchangeClick() {
        oops.gui.open(UIID.WalletCurrExchangePopUp);
    }

    topClick() {
        this.sv.scrollToTop(0.3);
    }
    closeClick() {
        oops.gui.removeByNode(this.node, true);
    }

    updWithdrawInfo() {
        let time = PlayerManger.getInstance().playerSelfInfo.withdrawCdMs;
        this.withdrawBtn.node.getComponent(Sprite).grayscale = time > 0;
    }
}

