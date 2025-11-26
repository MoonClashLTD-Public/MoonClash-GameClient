import { _decorator, Component, Prefab, find, Node, instantiate, Event, ScrollView, Layout, Input, EventTouch, UITransform, Widget, Sprite, tween, Label, Color } from 'cc';
import { Message } from '../../core/common/event/MessageManager';
import { LanguageData } from '../../core/gui/language/LanguageData';
import { LanguageLabel } from '../../core/gui/language/LanguageLabel';
import { tips } from '../../core/gui/prompt/TipsManager';
import { oops } from '../../core/Oops';
import { CardInfoPrefab, CardInfoPrefabBtnColor, CardInfoPrefabParam } from '../common/common/CardInfoPrefab';
import { GameEvent } from '../common/config/GameEvent';
import { UIID } from '../common/config/GameUIConfig';
import HttpHome from '../common/net/HttpHome';
import { netChannel } from '../common/net/NetChannelManager';
import { PlayerManger } from '../data/playerManager';
import { ResManger } from '../data/resManger';
import { FriendComp } from './comp/FriendComp';
import { FriendMeCardComp } from './comp/FriendMeCardComp';
import { FriendMeChooseCardComp } from './comp/FriendMeChooseCardComp';
import { FriendNewComp } from './comp/FriendNewComp';
import { FriendSerachCardComp } from './comp/FriendSerachCardComp';
import { FriendBattleInvitePopUpParam } from './FriendBattleInvitePopUp';
import { FriendSerachComp } from './uiComp/FriendSerachComp';
import { FriendInfoCard, FriendInfoCardType } from './widget/FriendInfoCard';
const { ccclass, property } = _decorator;

export enum FriendType {
    Normal,   
    Add,   
    Serach,   
    Choose,   
}

@ccclass('FriendUI')
export class FriendUI extends Component {
    @property(Node)
    bgNode: Node = null;
    @property(LanguageLabel)
    backBtnLbl: LanguageLabel = null;
    @property(ScrollView)
    sv: ScrollView = null;
    @property(Node)
    bottomNode: Node = null;
    @property(Node)
    spaceNode: Node = null;
    @property(Node)
    refreshNode: Node = null;
    @property(Node)
    noneFriendNode: Node = null;
    @property(Node)
    searchFriendNode: Node = null;
    @property(Node)
    addNewFriendNode: Node = null;
    @property(Node)
    newFriendRedNode: Node = null;

    @property(FriendMeCardComp)
    friendMeCardComp: FriendMeCardComp = null;
    @property(FriendNewComp)
    friendNewComp: FriendNewComp = null;
    @property(FriendComp)
    friendComp: FriendComp = null;
    @property(FriendSerachCardComp)
    friendSerachCardComp: FriendSerachCardComp = null;
    @property(FriendMeChooseCardComp)
    friendMeChooseCardComp: FriendMeChooseCardComp = null;

    @property(FriendSerachComp)
    friendSerachComp: FriendSerachComp = null;
    @property(Prefab)
    friendInfoCard: Prefab = null;

    curClickCard: Node = null;
    friendType: FriendType = FriendType.Normal;
    selCardInfoNode: CardInfoPrefab = null;   
    param: FriendUIParam = null;
    battleInviteData: pkgsc.ScFriendBattleInvitePush = null;
    isOpen = false;
    battleInviteAliveMs = 30000;
    onLoad() {
        this.bottomNode.children[0].active = false;
        this.addEvent();
    }

    onDestroy() {
        this.removeEvent();
    }

    start() {
    }

    update(deltaTime: number) {

    }

    async onAdded(param: FriendUIParam) {
        if (!this.selCardInfoNode) {
            this.selCardInfoNode = await ResManger.getInstance().getCardInfoPopPrefab();
            this.node.addChild(this.selCardInfoNode.node);
        }
        this.param = param;
        let friendType = FriendType.Normal;
        if (param.friendType) {
            friendType = param.friendType;
        }
        if (this.selCardInfoNode && this.selCardInfoNode.node.active) this.selCardInfoNode.hide();
        this.changeInfo(friendType);
    }

    pageInit() {
        this.isOpen = true;
        this.onAdded({});
        this.openBattleInvite();
    }

    pageOuit() {
        this.isOpen = false;
    }

    async changeInfo(type: FriendType) {
        let footer = this.bottomNode.getChildByName("footer");
        if (this.param.friendType != null) {
            footer.getComponent(Widget).bottom = 0;
            footer.getComponent(Sprite).enabled = true;
            this.bgNode.active = true;
            this.bottomNode.children[0].active = true;
        } else {
            footer.getComponent(Widget).bottom = 131;
            footer.getComponent(Sprite).enabled = false;
            this.bgNode.active = false;
            this.bottomNode.children[0].active = type != FriendType.Normal;
        }
        this.refreshNode.active = type == FriendType.Normal;

        if (this.friendType != type) {
            this.friendType = type;
            this.friendSerachComp.hide();
            this.sv.content.children.forEach(e => e.active = e.name == "serachNode");
        }
          
        let newFriend = await HttpHome.friendshipQuery(2, core.FriendshipState.FssRequest);
          
        let friend = await HttpHome.friendshipQuery(0, core.FriendshipState.FssAccept);
        if (!newFriend || !friend) return;
          
        this.noneFriendNode.active = false;
        this.addNewFriendNode.active = false;
        this.searchFriendNode.active = false;
        this.newFriendRedNode.active = newFriend.friends.length > 0;
        this.newFriendRedNode.getComponentInChildren(Label).string = `${newFriend.friends.length}`;
        if (this.friendType == FriendType.Normal) {
            this.friendMeCardComp.init(newFriend.assistedCardId, newFriend.assistRewardPct);
            this.friendMeCardComp.earningsUpd(friend.assistedWeekReward);
            this.friendComp.init(friend.friends);
            this.noneFriendNode.active = friend.friends.length == 0;
        } else if (this.friendType == FriendType.Add) {
            this.friendNewComp.init(newFriend.friends);
            this.addNewFriendNode.active = newFriend.friends.length == 0;
        } else if (this.friendType == FriendType.Serach) {
            this.friendSerachComp.show((key: string) => {
                this.friendSerachCardComp.init(key);
            });
            this.friendSerachCardComp.init(this.friendSerachComp.editBox.string);
        } else if (this.friendType == FriendType.Choose) {
            this.friendMeCardComp.init(newFriend.assistedCardId, newFriend.assistRewardPct);
            this.friendMeCardComp.earningsUpd(newFriend.assistedWeekReward);
            this.friendMeChooseCardComp.init();
        }

        let uit = this.sv.content.getComponent(UITransform);
        let svUit = this.sv.node.getComponent(UITransform);
        let spaceUit = this.spaceNode.getComponent(UITransform);
        if (this.friendType == FriendType.Normal) {
            this.refreshNode.active = true;
            spaceUit.node.active = false;
            this.scheduleOnce(() => {
                spaceUit.height = svUit.height - uit.height;
                spaceUit.node.active = spaceUit.height > 0;
            }, 0)
        }

        this.setRefreshNodeGary(true);
    }

    eventMap = {
        'scroll-to-top': 0,
        'scroll-to-bottom': 1,
        'scroll-to-left': 2,
        'scroll-to-right': 3,
        scrolling: 4,
        'bounce-bottom': 6,
        'bounce-left': 7,
        'bounce-right': 8,
        'bounce-top': 5,
        'scroll-ended': 9,
        'touch-up': 10,
        'scroll-ended-with-threshold': 11,
        'scroll-began': 12,
    };
    isRefresh = false;
    scrollEvent(scrollview: ScrollView, eventType: number, customEventData: string) {
        if (this.friendType == FriendType.Normal) {
            let moveY = 60;
            let maxY = scrollview.getMaxScrollOffset().y;
            if (eventType == this.eventMap['scroll-began']) {
                this.isRefresh = false;
            } else if (eventType == this.eventMap['scrolling']) {
                let pos = scrollview.getScrollOffset();
                if (pos.y < -moveY || pos.y > maxY + moveY || this.isRefresh) {
                    this.setRefreshNodeGary(false);
                } else {
                    this.setRefreshNodeGary(true);
                }
            } else if (eventType == this.eventMap['touch-up']) {
                let pos = scrollview.getScrollOffset();
                if (pos.y < -moveY || pos.y > maxY + moveY) {
                    tips.showLoadingMask();
                    this.isRefresh = true;
                }
            } else if (eventType == this.eventMap['scroll-ended']) {
                if (this.isRefresh) {
                    tips.hideLoadingMask();
                    this.changeInfo(this.friendType);
                }
            }
        }
    }

    setRefreshNodeGary(bf: boolean) {
        if (bf) {
            this.refreshNode.getComponentInChildren(Sprite).color = Color.GRAY;
            this.refreshNode.getComponentInChildren(Label).color = Color.GRAY;
        } else {
            this.refreshNode.getComponentInChildren(Sprite).color = Color.WHITE;
            this.refreshNode.getComponentInChildren(Label).color = Color.WHITE;
        }
    }

      
    addFriendNode(p: Node, f: wafriend.IFriend, ft: FriendInfoCardType, param: CardInfoPrefabParam) {
        let cardNode = instantiate(this.friendInfoCard);
        p.addChild(cardNode);
        let friendCard = cardNode.getComponent(FriendInfoCard);
        friendCard.init(f, ft, this, () => {
            this.friendCardSelClick(friendCard.cardPrefab.node, param);
        });
    }

    friendCardSelClick(cardNode: Node, param: CardInfoPrefabParam) {
        if (param)
            this.selCardInfoNode.show(
                param,
                cardNode,
                this.sv
            );
    }

    addClick() {
        this.changeInfo(FriendType.Add);
    }

    serachClick() {
        this.changeInfo(FriendType.Serach);
    }

    recordClick() {
        oops.gui.open(UIID.FriendAssistedRecordPopUp);
    }

    replaceClick() {
        this.changeInfo(FriendType.Choose);
    }

    refresh() {
        this.changeInfo(this.friendType);
    }

    closeClick() {
        if (this.param.friendType != null) {
            oops.gui.removeByNode(this.node, true);   
            return
        }
        if (this.selCardInfoNode) this.selCardInfoNode.hide();
        switch (this.friendType) {
            case FriendType.Normal:
                oops.gui.removeByNode(this.node, true);   
                break;
            case FriendType.Add:
                this.changeInfo(FriendType.Normal);   
            case FriendType.Serach:
                this.changeInfo(FriendType.Normal);   
                break;
            case FriendType.Choose:
                this.changeInfo(FriendType.Normal);   
                break;
            default:
                break;
        }
    }

    openBattleInvite() {
        if (this.isOpen && this.battleInviteData) {
            let battleInviteData = this.battleInviteData;
            let isMe = battleInviteData.from == PlayerManger.getInstance().playerId;
            oops.gui.remove(UIID.FriendBattleInvitePopUp, true);
            if (isMe) {
                oops.gui.open<FriendBattleInvitePopUpParam>(UIID.FriendBattleInvitePopUp, {
                    content: LanguageData.getLangByIDAndParams("friend_battle_invite_wait", [{ key: "name", value: battleInviteData.targetNickname }]),
                    cd: Math.floor(this.battleInviteAliveMs / 1000),
                    cancelI18Lbl: "common_prompt_cancal",
                    cancelCB: async () => {
                        let _d = await netChannel.home.reqUnique(opcode.OpCode.CsFriendBattleCancelReq, opcode.OpCode.ScFriendBattleCancelResp, pkgcs.CsFriendBattleCancelReq.create({ reqId: battleInviteData.reqId }));
                        // if (_d.code == errcode.ErrCode.Ok) {
                        //     return true;
                        // }
                        // return false;
                        return true;
                    }
                });
            } else {
                oops.gui.open<FriendBattleInvitePopUpParam>(UIID.FriendBattleInvitePopUp, {
                    content: LanguageData.getLangByIDAndParams("friend_battle_invite", [{ key: "name", value: battleInviteData.fromNickname }]),
                    isEditNode: true,
                    cancelI18Lbl: "friend_btn_refuse",
                    okCB: async () => {
                        let cards = PlayerManger.getInstance().cardManager.playCardGroup.getCurrCardGroupCards().filter((v, k) => v.id != 0);
                        cards = cards.map(v => {
                            let d = PlayerManger.getInstance().cardManager.playCard.netCards.find(e => e.id == v.id);
                            return d ? d : v;
                        })
                        if (cards.length < 6) {
                            oops.gui.toast('match_tips_5', true);
                            return false;
                        }

                        let cardGroupId = PlayerManger.getInstance().cardManager.playCardGroup.currCardGroupId;
                        let equipGroupId = PlayerManger.getInstance().equipManager.playEquipGroup.currEquipGroupId;
                        let _d = await netChannel.home.reqUnique(opcode.OpCode.CsFriendBattleAcceptReq, opcode.OpCode.ScFriendBattleAcceptResp, pkgcs.CsFriendBattleAcceptReq.create({ reqId: battleInviteData.reqId, accept: true, cardGroupId, equipGroupId }));
                        if (_d.code == errcode.ErrCode.Ok) {
                            return true;
                        }
                        return false;
                    },
                    cancelCB: async () => {
                        let _d = await netChannel.home.reqUnique(opcode.OpCode.CsFriendBattleAcceptReq, opcode.OpCode.ScFriendBattleAcceptResp, pkgcs.CsFriendBattleAcceptReq.create({ reqId: battleInviteData.reqId, accept: false }));
                        // if (_d.code == errcode.ErrCode.Ok) {
                        //     return true;
                        // }
                        // return false;
                        return true;
                    }
                });
            }
        }
    }

    addEvent() {
        Message.on(`${opcode.OpCode.ScFriendBattleInvitePush}`, this.ScFriendBattleInvitePush, this);
    }
    removeEvent() {
        Message.off(`${opcode.OpCode.ScFriendBattleInvitePush}`, this.ScFriendBattleInvitePush, this);
    }

    ScFriendBattleInvitePush(event: string, data: pkgsc.ScFriendBattleInvitePush) {
        let isRemove = false;
        if (data.op == core.FriendBattleOp.FriendBattleOpNew) {
            this.battleInviteData = data;
            this.openBattleInvite();
        } else if (this.battleInviteData && this.battleInviteData.from == data.from && this.battleInviteData.target == data.target) {
            let isMe = this.battleInviteData.from == PlayerManger.getInstance().playerId;
            switch (data.op) {
                case core.FriendBattleOp.FriendBattleOpAccept:
                    if (isMe)
                        oops.gui.toast("friend_battle_agree", true);
                    break;
                case core.FriendBattleOp.FriendBattleOpCancel:
                    if (!isMe)
                        oops.gui.toast("friend_battle_cancel", true);
                    break;
                case core.FriendBattleOp.FriendBattleOpReject:
                    if (isMe)
                        oops.gui.toast("friend_battle_refuse", true);
                    break;
                case core.FriendBattleOp.FriendBattleOpTimeout:
                    // oops.gui.toast("friend_battle_timeout", true);
                    break;
                default:
                    break;
            }
            isRemove = true;
        }

        if (data.op == core.FriendBattleOp.FriendBattleOpAccept) {
            isRemove = true;
        }

        if (isRemove) {
            this.battleInviteData = null;
            if (oops.gui.has(UIID.FriendBattleInvitePopUp)) {
                oops.gui.remove(UIID.FriendBattleInvitePopUp, true);
            }
        }

        Message.dispatchEvent(GameEvent.FriendHotDeleteRefresh, !!this.battleInviteData);
    }
}

export type FriendUIParam = {
    friendType?: FriendType
}
