import { _decorator, Component, Node, Layout, Event, Label } from 'cc';
import { oops } from '../../../core/Oops';
import { CardInfoPopUpParam } from '../../infoPopUp/cardInfoPopUp/CardInfoPopUp';
import { CardInfoPrefabBtnColor } from '../../common/common/CardInfoPrefab';
import { UIID } from '../../common/config/GameUIConfig';
import HttpHome from '../../common/net/HttpHome';
import TableCards from '../../common/table/TableCards';
import { PlayerManger } from '../../data/playerManager';
import { FriendUI } from '../FriendUI';
import { FriendInfoCardType } from '../widget/FriendInfoCard';
const { ccclass, property, type } = _decorator;

@ccclass('FriendNewComp')
export class FriendNewComp extends Component {
    @type(Node)
    titleNode: Node = null;
    @type(Label)
    numLbl: Label = null;
    @type(Layout)
    layout: Layout = null;;
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
        this.updNewFriendList();
    }

    updNewFriendList() {
        this.titleNode.active = false; // this.friends.length > 0;
        this.layout.node.active = this.friends.length > 0;
        this.numLbl.string = `${this.friends.length}`;
        this.layout.node.destroyAllChildren();
        for (let index = 0; index < this.friends.length; index++) {
            let f = this.friends[index];
            if (f.assistedCard) {
                this.friendUI.addFriendNode(this.layout.node, f, FriendInfoCardType.FriendRequest, {
                    cardId: TableCards.getInfoByProtoIdAndLv(f.assistedCard.protoId, f.assistedCard.level).Id,
                    btns: [
                        {
                            i18nKey: "friend_btn_info",
                            btnColor: CardInfoPrefabBtnColor.Blue,
                            cbFlag: "info"
                        },
                        {
                            i18nKey: "friend_btn_remove",
                            btnColor: CardInfoPrefabBtnColor.Red,
                            cbFlag: "remove"
                        },
                    ],
                    cb: (event: Event, cbFlag: string) => {
                        if (cbFlag == 'info') {
                            this.cardInfoPopUpCB(f.assistedCard);
                        }
                    },
                })
            } else {
                this.friendUI.addFriendNode(this.layout.node, f, FriendInfoCardType.FriendRequest, null)
            }
        }
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

