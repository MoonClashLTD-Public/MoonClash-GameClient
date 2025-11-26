import { _decorator, Component, Node, Sprite, SpriteFrame, Color, Label, Button } from 'cc';
import ListItemOptimize from '../../../core/gui/scrollView/ListItemOptimize';
import TableCards, { CardCfg } from '../../common/table/TableCards';
import { ResManger } from '../../data/resManger';
const { ccclass, property, type } = _decorator;

@ccclass('WalletBaseCard')
export class WalletBaseCard extends Component {
    @type(Sprite)
    icon: Sprite = null;
    cb: Function = null;
    cardInfo: core.ICard = null;
    cardCfg: CardCfg = null;
    start() {
        this.node.addComponent(ListItemOptimize);
    }

    update(deltaTime: number) {

    }

    async init(card: core.ICard, cb?: Function) {
        this.cardInfo = card;
        this.cb = cb;
        this.node.getComponent(Button).enabled = !!this.cb;

        let cardCfg = TableCards.getInfoByProtoIdAndLv(card.protoId, card.level);
        this.cardCfg = cardCfg;
        this.icon.spriteFrame = await ResManger.getInstance().getIconSpriteFrame(cardCfg.proto_id);
    }

    cardClick() {
        this.cb && this.cb(this.cardInfo);
    }
}

