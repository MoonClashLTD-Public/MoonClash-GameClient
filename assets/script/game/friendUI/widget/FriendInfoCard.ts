import { _decorator, Component, Node, Label, Enum, find, SpriteFrame, Sprite, EditBox } from 'cc';
import { LanguageLabel } from '../../../core/gui/language/LanguageLabel';
import { AlertParam } from '../../../core/gui/prompt/Alert';
import { oops } from '../../../core/Oops';
import { CommonUtil } from '../../../core/utils/CommonUtil';
import { CardPrefab, CardPrefabType } from '../../common/common/CardPrefab';
import { UIID } from '../../common/config/GameUIConfig';
import HttpHome from '../../common/net/HttpHome';
import { netChannel } from '../../common/net/NetChannelManager';
import TableCards from '../../common/table/TableCards';
import { PlayerManger } from '../../data/playerManager';
import { FriendUI } from '../FriendUI';
const { ccclass, property, type } = _decorator;

export enum FriendInfoCardType {
      
    Friend,
      
    FriendRequest,
      
    FriendSerach,
}

@ccclass('FriendInfoCard')
export class FriendInfoCard extends Component {
    @type(Label)
    titleLbl: Label = null;
    @type(LanguageLabel)
    nameLbl: LanguageLabel = null;
    @type(CardPrefab)
    cardPrefab: CardPrefab = null;
    @type([SpriteFrame])
    bgSfs: SpriteFrame[] = [];
    @type(Sprite)
    bgSpr: Sprite = null;
    @type(Node)
    meNode: Node = null;
    @type(Node)
    otherNode: Node = null;
    @type(Node)
    proportionNode: Node = null;   
    @type(Node)
    earningsNode: Node = null;   
    @type(Node)
    requestBtnNode: Node = null;   
    @type(Node)
    addBtnNode: Node = null;   
    @type(EditBox)
    nameEditBox: EditBox = null;   
    @property({ type: Enum(FriendInfoCardType), serializable: true, visible: false })
    _friendInfoCardType: FriendInfoCardType = FriendInfoCardType.Friend;
    @property({ type: Enum(FriendInfoCardType) })
    get friendInfoCardType() {
        return this._friendInfoCardType;
    }
    set friendInfoCardType(val: FriendInfoCardType) {
        this._friendInfoCardType = val;
        this.updNode();
    }
    friendUI: FriendUI;
    friendInfo: wafriend.IFriend;
    start() {
        this.nameEditBox.node.on(EditBox.EventType.EDITING_DID_ENDED, this.modifyClick, this);
    }

    update(deltaTime: number) {

    }

    init(friend: wafriend.IFriend, type: FriendInfoCardType, friendUI?: FriendUI, cb?: Function) {
        let pMgr = PlayerManger.getInstance();
        let isMe = friend.id == pMgr.playerId;

        this.friendUI = friendUI;
        this.friendInfo = friend;
        this.titleLbl.string = `UID${friend.id}`;
        this.updName();

        this.bgSpr.spriteFrame = this.bgSfs[type == FriendInfoCardType.FriendRequest ? 1 : 0];

        if (friend.assistedCard) {
            let card = TableCards.getInfoByProtoIdAndLv(friend.assistedCard.protoId, friend.assistedCard.level);
            this.cardPrefab.init({
                cardId: card.Id,
                cardPrefabType: CardPrefabType.CardInfo,
                cb: cb ? () => { cb() } : null,
            })
        } else {
            this.cardPrefab.init({
                cardPrefabType: isMe ? CardPrefabType.NoneAdd : CardPrefabType.None,
                cb: cb ? () => { cb() } : null,
            })
        }

        this.friendInfoCardType = type;

        if (this.friendInfoCardType === FriendInfoCardType.Friend) {
            if (isMe) {
                this.meUpd();
            } else {
                this.otherUpd();
            }
            this.meNode.active = isMe;
            this.otherNode.active = !isMe;
        } else {
            this.meNode.active = false;
            this.otherNode.active = false;
        }

        this.nameEditBox.node.parent.active = isMe;
        this.nameLbl.node.active = !isMe;

        // this.proportionUpd();
        // this.earningsUpd();
    }

    updName() {
        let name = `${this.friendInfo.nickname ?? this.friendInfo.username}`;
        name = name.length > 10 ? name.substring(0, 10) + '...' : name;
        this.nameLbl.params = [{
            key: 'name',
            value: name,
        }]
        this.nameEditBox.string = name;
    }

    updNode() {
        this.proportionNode.active = false;
        this.earningsNode.active = false; //this.friendInfoCardType === FriendInfoCardType.Friend;
        this.requestBtnNode.active = this.friendInfoCardType === FriendInfoCardType.FriendRequest;
        this.addBtnNode.active = this.friendInfoCardType === FriendInfoCardType.FriendSerach;
    }

    meUpd() {
        let numLbl = find('kd/numLbl', this.meNode).getComponent(LanguageLabel);
        numLbl.params = [{
            key: "num",
            value: `${PlayerManger.getInstance().playerSelfInfo.assistPts}`,   
        }];
    }

    otherUpd() {
        let totalLbl = find('kd/totalLbl', this.otherNode).getComponent(Label);
        let weekLbl = find('kd-001/weekLbl', this.otherNode).getComponent(Label);
        totalLbl.string = `${this.friendInfo.totalAssistPts}`;   
        weekLbl.string = `${this.friendInfo.weekAssistPts}`;   
    }

      
    proportionUpd() {
        find('numLbl', this.proportionNode).getComponent(Label).string = `${this.friendInfo.rewardPct / 100}%`
    }
      
    earningsUpd(count: number) {
        this.earningsNode.active = false;
        find('numLbl', this.earningsNode).getComponent(Label).string = `${count == 0 ? 0 : count.toFixed(6)}`;
    }

      
    async copyClick() {
        CommonUtil.copyToClipboard(this.friendInfo.id.toString());
        oops.gui.toast('aws_code_copy', true);
    }

      
    async exchangeClick() {
    }

      
    async modifyClick() {
        let bf = true;
        if (CommonUtil.getBytesLength(this.nameEditBox.string) > 14) {
            oops.gui.toast("setting_editbox_tips", true);
            bf = false;
        }
        if (bf && this.nameEditBox.node.active && this.nameEditBox.string) {
            if (this.nameEditBox.string == this.friendInfo.nickname) {
                // this.nameEditBox.node.active = false;
                // this.nameLbl.node.active = true;
                return;
            }

            if (!CommonUtil.nickNamePrefixLimit(this.nameEditBox.string)) {
                oops.gui.toast("friend_tips_limit", true);
                this.nameEditBox.string = this.friendInfo.nickname ?? this.friendInfo.username;
                return
            }

            let data = pkgcs.CsChangeNicknameReq.create();
            data.nickname = this.nameEditBox.string;
            let d = await netChannel.home.reqUnique(opcode.OpCode.CsChangeNicknameReq, opcode.OpCode.ScChangeNicknameResp, data)
            if (d.code == errcode.ErrCode.Ok) {
                PlayerManger.getInstance().playerSelfInfo.nickname = this.nameEditBox.string;
                // this.nameEditBox.node.active = false;
                // this.nameLbl.node.active = true;
                this.friendInfo.nickname = data.nickname;
                this.updName();
            }
        } else {
            // this.nameEditBox.node.active = true;
            // this.nameLbl.node.active = false;
            this.nameEditBox.string = this.friendInfo.nickname ?? this.friendInfo.username;
        }
    }

      
    async deleteClick() {
        let friendId = this.friendInfo.id;
        let okCB = async () => {
            let d = await HttpHome.friendshipRemove(friendId);
            if (d) {
                this.node.destroy();
            }
        }

        oops.gui.open<AlertParam>(UIID.Alert, {
            i18DataID: 'friend_tips_remove',
            okCB: () => { okCB(); },
            cancelCB: () => { },
        });
    }

      
    async cutUpClick() {
        let cards = PlayerManger.getInstance().cardManager.playCardGroup.getCurrCardGroupCards().filter((v, k) => v.id != 0);
        cards = cards.map(v => {
            let d = PlayerManger.getInstance().cardManager.playCard.netCards.find(e => e.id == v.id);
            return d ? d : v;
        })
        if (cards.length < 6) {
            oops.gui.toast('match_tips_5', true);
            return;
        }

        let cardGroupId = PlayerManger.getInstance().cardManager.playCardGroup.currCardGroupId;
        let equipGroupId = PlayerManger.getInstance().equipManager.playEquipGroup.currEquipGroupId;
        let d = await netChannel.home.reqUnique(opcode.OpCode.CsFriendBattleInviteReq, opcode.OpCode.ScFriendBattleInviteResp, pkgcs.CsFriendBattleInviteReq.create({ target: this.friendInfo.id, cardGroupId, equipGroupId }));
        if (d.code == errcode.ErrCode.Ok) {
            this.friendUI.battleInviteAliveMs = d.aliveMs;
            // oops.gui.open<AlertParam>(UIID.Alert, {
            //     i18DataID: 'friend_battle_invite_wait',
            //     isAutoClose: false,
            //     cancelCB: async () => {
            //         let _d = await netChannel.home.reqUnique(opcode.OpCode.CsFriendBattleCancelReq, opcode.OpCode.ScFriendBattleCancelResp, pkgcs.CsFriendBattleCancelReq.create({ reqId: d.reqId }));
            //         if (_d.code == errcode.ErrCode.Ok) {
            //             oops.gui.remove(UIID.Alert)
            //         }
            //     },
            // })
        }
    }

      
    async refuseClick() {
        let d = await HttpHome.friendshipAccept(this.friendInfo.id, false);
        if (d) {
            this.friendUI.refresh();
        }
    }
      
    async passClick() {
        let d = await HttpHome.friendshipAccept(this.friendInfo.id, true);
        if (d) {
            this.friendUI.refresh();
        }
    }
      
    async addClick() {
        let d = await HttpHome.friendshipAdd(this.friendInfo.id);
        if (d) {
            oops.gui.toast('friend_add_tips', true)
            this.node.destroy();
        }
    }
}