import { _decorator, Component, Node, Graphics, Color, UITransform, Event, find, Sprite, SpriteFrame, Vec3, v3, EditBox, log, Label } from 'cc';
import { LanguageLabel } from '../../core/gui/language/LanguageLabel';
import List from '../../core/gui/list/List';
import { tips } from '../../core/gui/prompt/TipsManager';
import { oops } from '../../core/Oops';
import { CommonUtil } from '../../core/utils/CommonUtil';
import { UIID } from '../common/config/GameUIConfig';
import HttpHome from '../common/net/HttpHome';
import { netChannel } from '../common/net/NetChannelManager';
import { PlayerManger } from '../data/playerManager';
import WalletUtil, { CurrItem, CurrItems, CurrType } from './WalletUtil';
const { ccclass, property, type } = _decorator;

@ccclass('WalletCurrWithdrawConfirmPopUp')
export class WalletCurrWithdrawConfirmPopUp extends Component {
    @property(Node)
    confirmTips: Node = null;   
    @property(Node)
    withdrawSuccTips: Node = null;   
    @property(Node)
    shareTips: Node = null;   
    @property(Label)
    numLbl: Label = null;
    @property(Label)
    gasLbl: Label = null;
    @property(Node)
    confirmNode: Node = null;
    start() {

    }

    update(deltaTime: number) {

    }

    async onAdded(param: WalletCurrWithdrawConfirmPopUpParam) {
        let gas = "0";
        let usd = "0";
        let _d = await HttpHome.queryGas("CsWithdrawReq", pkgcs.CsWithdrawReq.create({
            tokenType: 'DNA',
            price: CommonUtil.etherToWei(this.numLbl.string).toFixed(),
        }));
        if (_d) {
            gas = `${CommonUtil.weiToEther(_d.gas).toFixed()}`;
            usd = _d.usd;
        } else {
            return;
        }

        this.confirmTips.active = false;
        this.shareTips.active = false;
        this.withdrawSuccTips.active = false;
        if (param.isShareTips) {
            this.shareTips.active = true;
        } else {
            this.numLbl.string = `${param.num}`;
            this.gasLbl.string = `${gas}`;

            this.confirmTips.active = true;
        }

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

    async okClick() {
        let data = pkgcs.CsWithdrawReq.create({
            tokenType: 'DNA',
            price: CommonUtil.etherToWei(this.numLbl.string).toFixed(),
        });

        let closeCB = () => {
            this.confirmTips.active = false;
            oops.gui.remove(UIID.WalletCurrWithdrawPopUp);
        }

        let d = await netChannel.home.reqUnique(opcode.OpCode.CsWithdrawReq, opcode.OpCode.ScWithdrawResp, data);
        if (d.code == errcode.ErrCode.WaitComplete) {
            let _d = await tips.showNetLoadigMask<pkgsc.ScWithdrawPush>({
                content: "wallet_desc_10",
                closeEventName: `${opcode.OpCode.ScWithdrawPush}`,
            })
            closeCB();
            if (_d?.code == errcode.ErrCode.Ok) {
                this.withdrawSuccTips.active = true;
            } else {
                this.closeClick();
            }
        } else if (d.code == errcode.ErrCode.NoEnoughInviteTimes) {
            this.confirmTips.active = false;
            this.shareTips.active = true;
        }
    }

    shareClick() {
        oops.gui.open(UIID.SharePopUp);
        this.closeClick();
    }

    closeClick() {
        oops.gui.removeByNode(this.node, true);
    }
}

export type WalletCurrWithdrawConfirmPopUpParam = {
    isConfirmWithdraw?: boolean
    num?: string
    isShareTips?: boolean
}