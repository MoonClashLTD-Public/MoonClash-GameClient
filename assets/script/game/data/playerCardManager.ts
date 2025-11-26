import { Message } from "../../core/common/event/MessageManager";
import { GameEvent } from "../common/config/GameEvent";
import { DataBase } from "./dataBase";
import { PlayerCardGroup } from "./card/playerCardGroup";
import { PlayerCards } from "./card/playerCards";

export class PlayerCardManager extends DataBase {
      
    private _playCard: PlayerCards = new PlayerCards()
      
    private _playCardGroup: PlayerCardGroup = new PlayerCardGroup()
      
    questionArgs: core.IQuestionArgs = new core.QuestionArgs();
    init() {
        this._playCard.init()
        this._playCardGroup.init()
        this.addEvent();
    }

    async updData(): Promise<boolean> {
        await Promise.all<boolean>([this._playCard.updData(), this._playCardGroup.updData()])
        return true
    }

    get playCard() {
        return this._playCard
    }

    get playCardGroup() {
        return this._playCardGroup
    }

    async refreshData() {
        await this._playCard.updData()
        this.noticeData()
    }

      
    private _newCardHots: Map<number, number> = new Map()
    get cardHots() {
        return this._newCardHots
    }

      
    public async addNetCard(cards: core.ICard[]) {
        cards.forEach(card => {
            this._newCardHots.set(card.id, card.id)
        })
        await this._playCard.addNetCard(cards)
        this.noticeData()
    }

    readHot(cardId: number) {
        const ok = this._newCardHots.delete(cardId)
        if (ok) Message.dispatchEvent(GameEvent.CardHotDeleteRefresh, cardId)
    }

    readAllHot() {
        // this._newCardHots.forEach(e=>{
        //     Message.dispatchEvent(GameEvent.CardHotDeleteRefresh, e);
        // })
        this._newCardHots.clear();
        Message.dispatchEvent(GameEvent.CardHotDeleteRefresh, -1)
    }

    private async ScCardResetPowerPush(event, ret: pkgsc.ScCardResetPowerPush) {
        if (ret?.code == errcode.ErrCode.Ok) {
            await this._playCard.upMuitCards({ upCards: ret?.cards })
            this.noticeData()
        }
    }

    private async ScCardResetAttrPush(event, ret: pkgsc.ScCardResetAttrPush
        | pkgsc.ScCardResetAllPush | pkgsc.ScCardResetAttrValPush) {
        if (ret?.code == errcode.ErrCode.Ok) {
            await this._playCard.upSingleCard(ret?.card)
            Message.dispatchEvent(GameEvent.CardSingleRefresh, ret?.card)
        }
    }

    private async ScCardUpgradePush(event, ret: pkgsc.ScCardUpgradePush) {
        if (ret?.code == errcode.ErrCode.Ok) {
            const cardNftIds = ret?.syncData?.cards || []
            if (cardNftIds.length == 0) return
            await this._playCard.upMuitCards({ upCardNftIds: cardNftIds })
            await this._playCardGroup.cardUpgradePush(cardNftIds)
            this.noticeData()
        }
    }


    private async ScNftStatePush(event, ret: pkgsc.ScNftStatePush) {
        const ok = this.playCard.upNftStatus(ret?.CardState)
        if (ok) this.noticeData()
    }

    private ScPveWeekPush(event: string, ret: pkgsc.ScPveWeekPush) {
        const ok = this.playCard.upNftPveStatus(ret?.cards, ret);
        if (ok) this.noticeData()
    }

    private noticeData() {
        Message.dispatchEvent(GameEvent.CardDataRefresh)
    }

    destory() {
        this.removeEvent();
    }

    addEvent() {
        Message.on(`${opcode.OpCode.ScCardResetAttrValPush}`, this.ScCardResetAttrPush, this);
        Message.on(`${opcode.OpCode.ScCardResetAttrPush}`, this.ScCardResetAttrPush, this);
        Message.on(`${opcode.OpCode.ScPveWeekPush}`, this.ScPveWeekPush, this);
        Message.on(`${opcode.OpCode.ScCardResetAllPush}`, this.ScCardResetAttrPush, this);
        Message.on(`${opcode.OpCode.ScCardResetPowerPush}`, this.ScCardResetPowerPush, this);
        Message.on(`${opcode.OpCode.ScCardUpgradePush}`, this.ScCardUpgradePush, this);
        Message.on(`${opcode.OpCode.ScNftStatePush}`, this.ScNftStatePush, this);
    }
    removeEvent() {
        Message.off(`${opcode.OpCode.ScCardResetAttrValPush}`, this.ScCardResetAttrPush, this);
        Message.off(`${opcode.OpCode.ScCardResetAttrPush}`, this.ScCardResetAttrPush, this);
        Message.off(`${opcode.OpCode.ScPveWeekPush}`, this.ScPveWeekPush, this);
        Message.off(`${opcode.OpCode.ScCardResetAllPush}`, this.ScCardResetAttrPush, this);
        Message.off(`${opcode.OpCode.ScCardResetPowerPush}`, this.ScCardResetPowerPush, this);
        Message.off(`${opcode.OpCode.ScCardUpgradePush}`, this.ScCardUpgradePush, this);
        Message.off(`${opcode.OpCode.ScNftStatePush}`, this.ScNftStatePush, this);
    }
}