import { _decorator, Component, Node, Sprite, SpriteFrame, Color, Label, Button } from 'cc';
import ListItemOptimize from '../../../core/gui/scrollView/ListItemOptimize';
import { DefLogoAttr } from '../../common/com/DefLogoAttr';
import TableCards from '../../common/table/TableCards';
import { CardUtils } from '../../common/utils/CardUtils';
import { ResManger } from '../../data/resManger';
import { WalletBaseCard } from './WalletBaseCard';
const { ccclass, property, type } = _decorator;

@ccclass('WalletCard')
export class WalletCard extends Component {
    @type(WalletBaseCard)
    baseCard: WalletBaseCard = null;
    @type(Sprite)
    jobIcon: Sprite = null;
    @type(Label)
    costNumLbl: Label = null;
    @type(Label)
    lvLb: Label = null;
    @type(Node)
    characterNode: Node = null;   
    @type([DefLogoAttr])
    iconAttrs: DefLogoAttr[] = [];
    @type([Node])
    bgItems: Node[] = [];
    cardInfo: core.ICard = null;
    start() {
        this.node.addComponent(ListItemOptimize);
    }

    update(deltaTime: number) {

    }

    async init(card: core.ICard, cb?: Function) {
        // switch (card.state) {
        //     case core.NftState.NftStateBlank:
        //         break;
        //     case core.NftState.NftStateSelling:
        //         break;
        //     case core.NftState.NftStateRenting:
        //         break;
        //     case core.NftState.NftStateAssist:
        //         break;
        //     case core.NftState.NftStateLock:
        //         break;
        //     default:
        //         break;
        // };
        this.cardInfo = card;

        this.baseCard.init(this.cardInfo, cb);

        let cardCfg = TableCards.getInfoByProtoIdAndLv(card.protoId, card.level);
        this.costNumLbl.string = `${cardCfg.cost}`;
        this.jobIcon.spriteFrame = await ResManger.getInstance().getCardJobSpriteFrame(card.jobId);
        for (let index = 0; index < this.characterNode.children.length; index++) {
            this.characterNode.children[index].active = index < this.cardInfo.attrs.length;
        }
        this.lvLb.string = `Lv.${card?.level || 0}`

        const disItems = CardUtils.getDispostionIconNameItems({ netCard: card })
        let itemCount = 0
        this.iconAttrs.forEach((attr, Idx) => {
            const disItem = disItems[Idx]
            if (disItem) itemCount++
            attr.init(disItem)
        })
        this.bgItems.forEach((c, idx) => {
            if (idx == 0) {
                c.active = itemCount != 0
            } else if (idx == 1) {
                c.active = itemCount > 2
            } else {
                c.active = false
            }
        })
    }
}

