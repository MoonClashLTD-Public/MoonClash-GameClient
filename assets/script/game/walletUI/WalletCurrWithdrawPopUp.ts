import { _decorator, Component, Node, Graphics, Color, UITransform, Event, find, Sprite, SpriteFrame, Vec3, v3, EditBox, log } from 'cc';
import { LanguageLabel } from '../../core/gui/language/LanguageLabel';
import List from '../../core/gui/list/List';
import { tips } from '../../core/gui/prompt/TipsManager';
import { oops } from '../../core/Oops';
import { CommonUtil } from '../../core/utils/CommonUtil';
import { UIID } from '../common/config/GameUIConfig';
import { netChannel } from '../common/net/NetChannelManager';
import { PlayerManger } from '../data/playerManager';
import { WalletCurrWithdrawConfirmPopUpParam } from './WalletCurrWithdrawConfirmPopUp';
import WalletUtil, { CurrItem, CurrItems, CurrType } from './WalletUtil';
const { ccclass, property, type } = _decorator;

@ccclass('WalletCurrWithdrawPopUp')
export class WalletCurrWithdrawPopUp extends Component {
    @property(Node)
    sendNode: Node = null;
    @property(Sprite)
    sendIcon: Sprite = null;
    @property(LanguageLabel)
    sendLbl: LanguageLabel = null;
    @property(EditBox)
    sendEditbox: EditBox = null;
    sendType: CurrType;

    @property([SpriteFrame])
    icons: SpriteFrame[] = [];
    @property(Node)
    dropDownNode: Node = null;
    dropDownItems: CurrItem[] = [];
    start() {

    }

    update(deltaTime: number) {

    }

    async onAdded() {
        this.updSend(CurrItems[CurrType.GDNA]);
    }

    sendAllClick() {
        let num = WalletUtil.getCurrByType(this.sendType);
        this.sendEditbox.string = CommonUtil.weiToEther(num).toFixed();
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

    textChangedCheckNumber(text: string, e: EditBox, customEventData: string) {
        e.string = WalletUtil.checkNumber(text, customEventData);
    }

    // dropDownClick(e: Event, customEventData: string) {
    //     this.dropDownItems = [];
    //     for (const key in CurrItems) {
    //         let item = CurrItems[key];
    //         if (item.icon != this.receiveIcon.spriteFrame.name) {
      
    //                 this.dropDownItems.push(item);
    //         }
    //     }
    //     this.updDropDown(true, e.currentTarget.getWorldPosition());
    // }

    // selectedEvent(item: Node, idx: number) {
    //     let info = this.dropDownItems[idx];
    //     this.updDropDown(false);
    //     this.updSend(info);
    // }
    // renderEvent(item: Node, idx: number) {
    //     let info = this.dropDownItems[idx];
    //     let icon = find('icon', item).getComponent(Sprite);
    //     let name = find('Label', item).getComponent(LanguageLabel);
    //     icon.spriteFrame = this.icons.find((v, k) => v.name == info.icon);
    //     name.dataID = `${info.i18Key}`;
    // }

      
    // updDropDown(bf: boolean, wPos?: Vec3) {
    //     this.dropDownNode.active = bf;
    //     if (bf) {
    //         let list = this.dropDownNode.getComponentInChildren(List);
    //         list.numItems = this.dropDownItems.length;
    //         list.node.setWorldPosition(v3(wPos.x - 100, wPos.y - 30, 0));
    //     }
    // }

    async okClick() {
        oops.gui.open<WalletCurrWithdrawConfirmPopUpParam>(UIID.WalletCurrWithdrawConfirmPopUp, { isConfirmWithdraw: true, num: this.sendEditbox.string });
    }

    closeClick() {
        oops.gui.removeByNode(this.node, true);
    }
}

