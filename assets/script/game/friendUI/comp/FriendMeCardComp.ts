import { _decorator, Component, Node, Layout, Event, Button } from 'cc';
import { oops } from '../../../core/Oops';
import { CardInfoPopUpParam } from '../../infoPopUp/cardInfoPopUp/CardInfoPopUp';
import { CardInfoPrefabBtnColor } from '../../common/common/CardInfoPrefab';
import { UIID } from '../../common/config/GameUIConfig';
import TableCards from '../../common/table/TableCards';
import { PlayerManger } from '../../data/playerManager';
import { FriendType, FriendUI } from '../FriendUI';
import { FriendInfoCard, FriendInfoCardType } from '../widget/FriendInfoCard';
import HttpHome from '../../common/net/HttpHome';
const { ccclass, property, type } = _decorator;

@ccclass('FriendMeCardComp')
export class FriendMeCardComp extends Component {
    @type(Layout)
    layout: Layout = null;
    @type(Button)
    addBtn: Button = null;
    @type(Button)
    replaceBtn: Button = null;
    @type(Button)
    delAssistBtn: Button = null;
    assistedCardId: number = 0;
    assistRewardPct: number = 0;
    get friendUI() {
        return this.node.parent.getComponent(FriendUI)
    }
    start() {

    }

    update(deltaTime: number) {

    }

    init(assistedCardId: number, assistRewardPct: number) {
        this.updInfo(assistedCardId, assistRewardPct);

        let pMgr = PlayerManger.getInstance();
        let card = pMgr.cardManager.playCard.getNetCardById(assistedCardId);
        // this.addBtn.node.active = !!!card;
        // this.replaceBtn.node.active = !!card;
        this.delAssistBtn.node.active = !!card;
    }

    updInfo(assistedCardId: number, assistRewardPct: number) {
        this.assistedCardId = assistedCardId;
        this.assistRewardPct = assistRewardPct;
        this.layout.node.active = true;
        let pMgr = PlayerManger.getInstance();
        let me = wafriend.Friend.create({
            id: pMgr.playerId,  // id
            nickname: `${PlayerManger.getInstance().playerSelfInfo.nickname ?? PlayerManger.getInstance().playerSelfInfo.userName}`,
            walletAddr: pMgr.playerSelfInfo.walletAddr,
            assistedCard: pMgr.cardManager.playCard.getNetCardById(assistedCardId),
            rewardPct: assistRewardPct,
            state: core.FriendshipState.FssNone,
        })
        this.updMeInfo(me);
    }

    updMeInfo(me: wafriend.Friend) {
        this.layout.node.active = true;
        if (me) {
            let friendInfoCard = this.layout.node.children[0].getComponent(FriendInfoCard);
            if (me.assistedCard) {
                friendInfoCard.init(
                    me,
                    FriendInfoCardType.Friend,
                    this.friendUI,
                    () => {
                        this.friendUI.friendCardSelClick(friendInfoCard.cardPrefab.node, {
                            cardId: TableCards.getInfoByProtoIdAndLv(me.assistedCard.protoId, me.assistedCard.level).Id,
                            btns: [
                                {
                                    i18nKey: "friend_btn_info",
                                    btnColor: CardInfoPrefabBtnColor.Blue,
                                    cbFlag: "info"
                                },
                            ],
                            cb: (event: Event, cbFlag: string) => {
                                this.cardInfoPopUpCB(me.assistedCard);
                            },
                        });
                    }
                );
            } else {
                friendInfoCard.init(
                    me,
                    FriendInfoCardType.Friend,
                    this.friendUI,
                    () => {
                        this.friendUI.changeInfo(FriendType.Choose);
                    }
                );
            }
        }
    }

    earningsUpd(count: number) {
        let friendInfoCard = this.layout.node.children[0].getComponent(FriendInfoCard);
        friendInfoCard.earningsUpd(count)
    }

    cardInfoPopUpCB(cardInfo: core.ICard) {
        let param: CardInfoPopUpParam = {
            card: cardInfo,
            btns: [
                {
                    i18nKey: "logining_confirm",
                    btnColor: CardInfoPrefabBtnColor.Green,
                }
            ],
            cb: () => {
                oops.gui.remove(UIID.CardInfoPopUp);
            },
        }
        oops.gui.open(UIID.CardInfoPopUp, param);
    }

    async clearAssist() {
        let d = await HttpHome.friendshipAssist(this.assistedCardId, this.assistRewardPct, false);
        if (d) {
            this.init(0, this.assistRewardPct);
            this.friendUI.friendMeChooseCardComp.selCardId = 0;
        }
    }
}

