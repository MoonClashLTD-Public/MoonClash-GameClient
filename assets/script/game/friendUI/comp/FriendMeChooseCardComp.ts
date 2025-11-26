import { _decorator, Component, Node, Layout, instantiate, Slider, Label, Button } from 'cc';
import { oops } from '../../../core/Oops';
import { CardInfoPopUpParam } from '../../infoPopUp/cardInfoPopUp/CardInfoPopUp';
import { CardInfoPrefabBtnColor } from '../../common/common/CardInfoPrefab';
import { CardPrefab, CardPrefabType } from '../../common/common/CardPrefab';
import { UIID } from '../../common/config/GameUIConfig';
import HttpHome from '../../common/net/HttpHome';
import TableCards from '../../common/table/TableCards';
import { PlayerManger } from '../../data/playerManager';
import { ResManger } from '../../data/resManger';
import { FriendUI } from '../FriendUI';
import { FriendInfoCardType } from '../widget/FriendInfoCard';
const { ccclass, property, type } = _decorator;

@ccclass('FriendMeChooseCardComp')
export class FriendMeChooseCardComp extends Component {
    @type(Node)
    titleNode: Node = null;
    @type(Node)
    quantityNode: Node = null;
    @type(Slider)
    quantitySlider: Slider = null;
    @type(Label)
    quantityLbl: Label = null;
    @type(Layout)
    layout: Layout = null;
    @type(Label)
    numLbl: Label = null;
    @type(Button)
    saveBtn: Button = null;
    selCardId = 0;
    get friendUI() {
        return this.node.parent.getComponent(FriendUI)
    }
    quantity: number = 0;   
    start() {

    }

    update(deltaTime: number) {

    }

    init() {
        // this.updChooseGroupInfo();
        this.updChooseAllInfo();
        this.selCardId = this.friendUI.friendMeCardComp.assistedCardId;
        this.saveBtn.node.active = false;
    }

    async updChooseGroupInfo() {
        this.titleNode.active = true;
        this.quantityNode.active = false;//true;
        this.layout.node.active = true;
        this.layout.node.destroyAllChildren();
        let pMgr = PlayerManger.getInstance().cardManager.playCard
        let num = 0;
        for (const cardGType of pMgr.cardTypeGroupList) {
            let card = pMgr.getNetCardById(cardGType.showCardId);
            let cardNode = instantiate(await ResManger.getInstance().getCardPrefab());
            this.layout.node.addChild(cardNode);
            cardNode.getComponent(CardPrefab).init({
                id: card.id,
                cardProtoId: card.protoId,
                cardPrefabType: CardPrefabType.classifyInfo,
                cb: () => {
                    this.meSperadCardSelClick(card, cardNode);
                },
            })
            num++;
        }

        this.numLbl.string = `${num}/${TableCards.cfg.length / 10}`;
    }

    async updChooseAllInfo() {
        this.titleNode.active = true;
        this.quantityNode.active = false;//true;
        this.layout.node.active = true;
        this.layout.node.destroyAllChildren();
        let pMgr = PlayerManger.getInstance().cardManager.playCard
        let cards = pMgr.pveShowNetCards;

        for (let index = 0; index < cards.length; index++) {
            let card = pMgr.getNetCardById(cards[index].showCardId);
            if (card.state == core.NftState.NftStateBlank) {
                let cardNode = instantiate(await ResManger.getInstance().getCardPrefab());
                this.layout.node.addChild(cardNode);
                cardNode.getComponent(CardPrefab).init({
                    // id: card.id,
                    card: card,
                    cardPrefabType: CardPrefabType.NewInfoNoPower,
                    cb: () => {
                        this.meCardSelClick(card, cardNode);
                    },
                })
            }
        }
        this.numLbl.string = `${cards.length}`;
    }

    async updChooseInfo(protoId: number) {
        this.titleNode.active = true;
        this.quantityNode.active = false;//true;
        this.layout.node.active = true;
        this.layout.node.destroyAllChildren();
        let pMgr = PlayerManger.getInstance().cardManager.playCard
        let cards = pMgr.getCardTypeGroupSortByGId(protoId)

        for (let index = 0; index < cards.length; index++) {
            let card = pMgr.getNetCardById(cards[index]);
            if (card.state == core.NftState.NftStateBlank) {
                let cardNode = instantiate(await ResManger.getInstance().getCardPrefab());
                this.layout.node.addChild(cardNode);
                cardNode.getComponent(CardPrefab).init({
                    id: card.id,
                    cardPrefabType: CardPrefabType.NumInfoNoPower,
                    cb: () => {
                        this.meCardSelClick(card, cardNode);
                    },
                })
            }
        }
        this.numLbl.string = `${cards.length}`;
    }

    slideEvent(slider: Slider, customEventData: string) {
        let num = 5;   
        slider.progress = Math.round(Math.round(slider.progress * 100 / num) * num) / 100;
        this.quantity = Math.round(slider.progress * 100);
        this.quantityLbl.string = `${this.quantity}%`;
        if (this.selCardId) {
            this.saveBtn.node.active = true;
        }
    }

    meSperadCardSelClick(cardInfo: core.ICard, cardNode: Node) {
        let cb = (): void => {
            this.updChooseInfo(cardInfo.protoId);
            this.friendUI.selCardInfoNode.hide();
        }
        let cardCfg = TableCards.getInfoByProtoIdAndLv(cardInfo.protoId, cardInfo.level);
        this.friendUI.selCardInfoNode.show(
            {
                cardId: cardCfg.Id,
                btns: [
                    {
                        i18nKey: "cardsys_btn_sperad",
                        btnColor: CardInfoPrefabBtnColor.Green,
                    }
                ],
                cb: () => {
                    cb()
                },
            },
            cardNode,
            this.friendUI.sv
        );
    }
    meCardSelClick(cardInfo: core.ICard, cardNode: Node) {
        if (true) {
            if (this.selCardId != cardInfo.id) {
                this.selCardId = cardInfo.id;
                this.saveBtn.node.active = true;
                this.friendUI.friendMeCardComp.init(this.selCardId, this.getQuantity());
            }
            return;
        }


        let footer = this.friendUI.bottomNode.getChildByName("footer");
        footer.active = false;
        let cb = (): void => {
            this.friendUI.selCardInfoNode.hide();
            this.cardInfoPopUpCB(cardInfo, async () => {
                if (this.selCardId != cardInfo.id) {
                    this.selCardId = cardInfo.id;
                    this.saveBtn.node.active = true;
                    this.friendUI.friendMeCardComp.init(this.selCardId, this.getQuantity());
                }
            });
        }
        let cardCfg = TableCards.getInfoByProtoIdAndLv(cardInfo.protoId, cardInfo.level);
        this.friendUI.selCardInfoNode.show(
            {
                cardId: cardCfg.Id,
                btns: [
                    {
                        i18nKey: "friend_btn_played",
                        btnColor: CardInfoPrefabBtnColor.Yellow,
                    }
                ],
                cb: () => {
                    cb()
                },
                hideCB: () => {
                    footer.active = true;
                }
            },
            cardNode,
            this.friendUI.sv
        );
    }

    cardInfoPopUpCB(cardInfo: core.ICard, cb: Function) {
        let param: CardInfoPopUpParam = {
            card: cardInfo,
            btns: [
                {
                    i18nKey: "common_prompt_ok",
                    btnColor: CardInfoPrefabBtnColor.Yellow,
                    cbFlag: "string"
                }
            ],
            cb: () => {
                oops.gui.remove(UIID.CardInfoPopUp);
                cb()
            },
        }
        oops.gui.open(UIID.CardInfoPopUp, param);
    }

    getQuantity() {
        return this.quantity * 100;
    }

    async saveClick() {
        if (this.selCardId) {
            let quantity = this.getQuantity();
            let d = await HttpHome.friendshipAssist(this.selCardId, quantity, true);
            if (d) {
                this.friendUI.friendMeCardComp.init(this.selCardId, quantity);
                this.saveBtn.node.active = false;
            }
        }
    }
}

