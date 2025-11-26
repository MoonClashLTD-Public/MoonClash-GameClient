import { _decorator, Component, Node, Layout, Event, Label } from 'cc';
import { oops } from '../../../core/Oops';
import { CardInfoPopUpParam } from '../../infoPopUp/cardInfoPopUp/CardInfoPopUp';
import { CardInfoPrefabBtnColor } from '../../common/common/CardInfoPrefab';
import { UIID } from '../../common/config/GameUIConfig';
import HttpHome from '../../common/net/HttpHome';
import TableCards from '../../common/table/TableCards';
import { FriendUI } from '../FriendUI';
import { FriendInfoCard, FriendInfoCardType } from '../widget/FriendInfoCard';
import { AlertParam } from '../../../core/gui/prompt/Alert';
const { ccclass, property, type } = _decorator;

@ccclass('FriendComp')
export class FriendComp extends Component {
    @type(Node)
    titleNode: Node = null;
    @type(Label)
    numLbl: Label = null;
    @type(Layout)
    layout: Layout = null;
    get friendUI() {
        return this.node.parent.getComponent(FriendUI)
    }

    friends: wafriend.IFriend[] = [];
    start() {

    }

    update(deltaTime: number) {

    }

    init(friends: wafriend.IFriend[]) {
        this.friends = friends;
        this.updFriendList();
    }

    updFriendList() {
        this.titleNode.active = true;
        this.layout.node.active = true;

        this.numLbl.string = `${this.friends.length}/20`;

        this.layout.node.destroyAllChildren();
        for (let index = 0; index < this.friends.length; index++) {
            let f = this.friends[index];
            if (f.assistedCard) {
                this.friendUI.addFriendNode(this.layout.node, f, FriendInfoCardType.Friend,
                    {
                        cardId: TableCards.getInfoByProtoIdAndLv(f.assistedCard.protoId, f.assistedCard.level).Id,
                        btns: [
                            {
                                i18nKey: "friend_btn_info",
                                btnColor: CardInfoPrefabBtnColor.Blue,
                                cbFlag: "info"
                            },
                            // {
                            //     i18nKey: "friend_btn_remove",
                            //     btnColor: CardInfoPrefabBtnColor.Red,
                            //     cbFlag: "remove"
                            // },
                        ],
                        cb: (event: Event, cbFlag: string) => {
                            if (cbFlag == 'info') {
                                this.cardInfoPopUpCB(f.assistedCard);
                            } else if (cbFlag == 'remove') {
                                this.removeFriend(f.id);
                            }
                        },
                    }
                );
            } else {
                this.friendUI.addFriendNode(this.layout.node, f, FriendInfoCardType.Friend, null);
                // this.friendUI.addFriendNode(this.layout.node, f, FriendInfoCardType.Friend,
                //     {
                //         // cardId: TableCards.getInfoByProtoIdAndLv(f.assistedCard.protoId, f.assistedCard.level).Id,
                //         btns: [
                //             // {
                //             //     i18nKey: "friend_btn_info",
                //             //     btnColor: CardInfoPrefabBtnColor.Blue,
                //             //     cbFlag: "info"
                //             // },
                //             {
                //                 i18nKey: "friend_btn_remove",
                //                 btnColor: CardInfoPrefabBtnColor.Red,
                //                 cbFlag: "remove"
                //             },
                //         ],
                //         cb: async (event: Event, cbFlag: string) => {
                //             if (cbFlag == 'info') {
                //                 this.cardInfoPopUpCB(f.assistedCard);
                //             } else if (cbFlag == 'remove') {
                //                 this.removeFriend(f.id);
                //             }
                //         },
                //     }
                // );
            }
        }
    }

    removeFriend(friendId: number) {
        let okCB = async () => {
            let d = await HttpHome.friendshipRemove(friendId);
            if (d) {
                let fNode = this.layout.node.children.find((v, k) => v.getComponent(FriendInfoCard).friendInfo.id == friendId);
                fNode?.destroy();
                this.friendUI.selCardInfoNode.hide();
            }
        }

        oops.gui.open<AlertParam>(UIID.Alert, {
            i18DataID: 'friend_tips_remove',
            okCB: () => { okCB(); },
            cancelCB: () => { },
        });
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
}

