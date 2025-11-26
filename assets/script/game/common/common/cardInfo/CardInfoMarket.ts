import { Label, _decorator } from "cc";
import { CardInfoBase } from "./CardInfoBase";

const { ccclass, property } = _decorator;

@ccclass('CardInfoMarket')
export class CardInfoMarket extends CardInfoBase {
    @property(Label)
    idLbl: Label = null;
    @property(Label)
    rewardPctLbl: Label = null;
    start() { }
    init() {
        const cardPrefab = this.cardInfoPrefab
        const nftid = cardPrefab?.param?.friendCard?.assistedCard.nftId ?? 0;
        const rewardPct = cardPrefab?.param?.friendCard?.rewardPct / 100 ?? 0;
        this.idLbl.string = `#${nftid}`;
        this.rewardPctLbl.string = `${rewardPct}%`;
    }
}