import { _decorator, Component, Node, Event, Label, Button, setDisplayStats, isDisplayStats, Sprite } from 'cc';
import { LanguageData } from '../../core/gui/language/LanguageData';
import List from '../../core/gui/list/List';
import { tips } from '../../core/gui/prompt/TipsManager';
import { oops } from '../../core/Oops';
import { BattleManger } from '../battle/BattleManger';
import { UIID } from '../common/config/GameUIConfig';
import { netChannel } from '../common/net/NetChannelManager';
import TableCards from '../common/table/TableCards';
import TableEquip from '../common/table/TableEquip';
import TableEquipRaity from '../common/table/TableEquipRaity';
import { CardUtils } from '../common/utils/CardUtils';
import { AwsManger } from '../data/awsManger';
import { PlayerManger } from '../data/playerManager';
const { ccclass, property } = _decorator;

@ccclass('GMUI')
export class GMUI extends Component {
    @property(List)
    list: List = null;

    start() {
        this.list.numItems = TableCards.cfg.length;
    }

    update(deltaTime: number) {

    }

    renderEvent(node: Node, idx: number) {
        // let info = TableCards.cfg[idx];
        // node.getChildByName("id").getComponent(Label).string = `${info.Id}`;
        // node.getChildByName("name").getComponent(Label).string = `${info.inn_name}`;
        // node.getChildByName("level").getComponent(Label).string = `lv:${info.level}`;
        // node.getComponent(Button).clickEvents[0].customEventData = `${info.Id}`;
    }

    // static cardId: number = 0;
    // cardClick(event: Event, customEventData: string) {
    //     GMUI.cardId = Number(customEventData);
      
    //         let data = pkgcs.CsSetCardReq.create();
    //         data.cardId = GMUI.cardId;
    //         let d = await netChannel.home.reqUnique(opcode.OpCode.CsSetCardReq, opcode.OpCode.ScSetCardResp, data)
    //         if (d.code == errcode.ErrCode.Ok)
      
    //         else
    //             oops.gui.toast(`${d.code}`);
    //     })

    // }

    async selfInfoClick() {
        // await netChannel.home.reqUnique(opcode.OpCode.CsSelfInfoReq, opcode.OpCode.ScSelfInfoResp, pkgcs.CsSelfInfoReq.create({ testResetPve: true }));
        // PlayerManger.getInstance().playerSelfInfo.pveBattleId = 0;
    }

    fpsClick() {
        if (BattleManger.getInstance().isTest) {
            oops.storage.set("battleTest", '0');
        } else {
            oops.storage.set("battleTest", '1');
        }
        setDisplayStats(BattleManger.getInstance().isTest);
    }

    close() {
        oops.gui.remove(UIID.GMUI);
    }

    async deleteUser() {
        await tips.showLoadingMask()
        await AwsManger.getInstance().onDeleteUser()
        tips.hideLoadingMask()
        PlayerManger.getInstance().returnToLogin()
    }

    printLogger() {
        const cards = PlayerManger.getInstance().cardManager.playCard.netCards
        const newCards = cards.map(card => {
            const cardCgf = TableCards.getInfoByProtoIdAndLv(card.protoId, card.level)
            const aa = { cardId: card.id, cardName: LanguageData.getLangByID(cardCgf.name) }
            const dis = CardUtils.getDispostionItems({ netCard: card })
            // const cc: any[] = []
            let ind = 1
            for (const d in dis) {
                dis[d].name = LanguageData.getLangByID(dis[d].name)
                // cc.push(dis[d])
                aa[`attId${ind}`] = dis[d].attrId
                aa[`attName${ind}`] = dis[d].name
                // aa[`att${ind}`] = dis[d].desc
            }
            return aa
        })

        console.table(newCards)
    }


    printEquipLogger() {
        const equips = PlayerManger.getInstance().equipManager.playEquips.equips
        const newEquips = equips.map(_equipData => {
            const _equipCfg = TableEquip.getInfoById(_equipData?.protoId)
            const _equipRaityCfg = TableEquipRaity.getInfoByEquipIdAndRarity(_equipData?.protoId, _equipData?.equipRarity)
            const aa = { cardId: _equipData.id, cardName: LanguageData.getLangByID(_equipRaityCfg.name) }
            const dis = PlayerManger.getInstance().equipManager.playEquips.getDispostionCfgById({ netEquipment: _equipData }).list
            // const cc: any[] = []
            let ind = 1
            for (const d in dis) {
                dis[d].name = LanguageData.getLangByID(dis[d].name)
                // cc.push(dis[d])
                aa[`attId${ind}`] = dis[d].attrId
                aa[`attName${ind}`] = dis[d].name
                // aa[`att${ind}`] = dis[d].desc
            }
            return aa
        })

        console.table(newEquips)
    }
}

