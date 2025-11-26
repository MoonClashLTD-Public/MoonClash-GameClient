import { _decorator, Component, Node, math, Event, Button, SpriteFrame, Sprite, warn, Label } from 'cc';
import { LanguageData } from '../../../core/gui/language/LanguageData';
import { LanguageLabel } from '../../../core/gui/language/LanguageLabel';
import { oops } from '../../../core/Oops';
import { CardSystemUtils } from '../../card/utils/cardSystemUtils';
import { CardInfoBtnPrefabInfo } from '../../common/common/CardInfoPrefab';
import { CardPrefab, CardPrefabType } from '../../common/common/CardPrefab';
import TableCards from '../../common/table/TableCards';
import WalletUtil from '../../walletUI/WalletUtil';
import { CardDetails } from './CardDetails';
const { ccclass, property, type } = _decorator;

@ccclass('CardInfoPopUp')
export class CardInfoPopUp extends Component {
    @type(LanguageLabel)
    cardNameLbl: LanguageLabel = null;
    @type(LanguageLabel)
    cardLevelLbl: LanguageLabel = null;
    @type(Label)
    idLbl: Label = null;
    @type(Label)
    pvpLbl: Label = null;
    @type(Label)
    pveLbl: Label = null;
    @type(CardPrefab)
    cardPrefab: CardPrefab = null;
    @type(CardDetails)
    cardDetails: CardDetails = null;
    @type(Node)
    btnNode: Node = null;   
    @type([SpriteFrame])
    btnSfs: SpriteFrame[] = [];   
    @property(Button)
    pvePowerBtn: Button = null;
    cardInfo: core.ICard = null;
    @property(Label)
    descLbl: Label = null;
    cb: CbFunc = null;
    start() {

    }

    update(deltaTime: number) {

    }

    onAdded(param: CardInfoPopUpParam) {
        let card = param.card;
        this.cb = param.cb;
        this.cardInfo = param.card;

        this.idLbl.string = `#${card.nftId}`;

        let cardCfg = TableCards.getInfoByProtoIdAndLv(card.protoId, card.level);
        if (cardCfg) {
            this.cardPrefab.init({
                cardId: cardCfg.Id,
                cardPrefabType: CardPrefabType.CardInfo,
            });
            this.cardNameLbl.dataID = cardCfg.name;
            this.cardLevelLbl.params = [{ key: "level", value: `${card.level}` }];
            this.cardDetails.init({ cardInfo: card });

            const currPower = card?.power || 0
            const maxPower = cardCfg?.max_power || 0
            this.pvpLbl.string = `${currPower}/${maxPower}`
            this.pveLbl.string = `${CardSystemUtils.isPlayPve(card) ? 0 : 1}/1`
        } else {
             
        }

        let btnWidth = 0
        switch (param.btns.length) {
            case 1:
                btnWidth = 200;
                break;
            case 2:
                btnWidth = 180;
                break;
            case 3:
                btnWidth = 155;
            case 4:
                btnWidth = 140;
                break;
            case 5:
                btnWidth = 120;
                break;
            default:
                btnWidth = 200;
                break;
        }
        for (let index = 0; index < this.btnNode.children.length; index++) {
            const btn = this.btnNode.children[index].getComponent(Button);
            btn.node.active = index < param.btns.length;
            let btnInfo = param.btns[index];
            if (btnInfo) {
                btn.node.getComponentInChildren(LanguageLabel).dataID = btnInfo.i18nKey;
                btn.clickEvents[0].customEventData = btnInfo.cbFlag;
                btn.node.getComponent(Sprite).spriteFrame = this.btnSfs[btnInfo.btnColor];
            }
        }

        this.descLbl.string = '';
        if (param.btns.length == 0 && card.localBound) {
              
            this.descLbl.string = LanguageData.getLangByID("wallet_desc_bound");
        }

        let info = this.calcPvePower(card.pvePower.toString());
        this.pvePowerBtn.node.active = param.btns.length == 0 && info.t > 0;
        this.pvePowerBtn.getComponentInChildren(LanguageLabel).dataID = "wallet_btn_date";
        this.pvePowerBtn.getComponentInChildren(LanguageLabel).params = [
            {
                key: "day",
                value: `${info.d}`,
            },
            {
                key: "hour",
                value: `${info.h}`,
            }
        ];
    }

      
    calcPvePower(time: string, n: number = 1) {
        let t = WalletUtil.calcPvePower(time);
        let d = Math.floor(t / 60 / 60 / 24);
        let h = Math.floor(t / 60 / 60 % 24);
        return { h: h, d: d, t: t }
    }

    btnClick(e: Event, customEventData: string) {
        this.cb && this.cb(e, customEventData);
    }

    closeClick() {
        oops.gui.removeByNode(this.node, true);
    }
}

type CbFunc = (event: Event, cbFlag: string) => void;
export type CardInfoPopUpParam = {
    card: core.ICard,
    btns: CardInfoBtnPrefabInfo[],
      
    cb?: CbFunc
}