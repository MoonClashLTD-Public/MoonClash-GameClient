import { _decorator, Button, Component, Event, find, Label, Node } from 'cc';
import { Message } from '../../core/common/event/MessageManager';
import { oops } from '../../core/Oops';
import { BattleEvent } from '../battle/utils/BattleEnum';
import { UIID } from '../common/config/GameUIConfig';
import { netChannel } from '../common/net/NetChannelManager';
import { PlayerManger } from '../data/playerManager';
import { CardPrefab, CardPrefabType } from '../common/common/CardPrefab';
import { EquipmentPrefab, EquipPrefabType } from '../common/equipment/EquipmentPrefab';
const { ccclass, property } = _decorator;

@ccclass('TVGameUI')
export class TVGameUI extends Component {
    @property(Node)
    redNode: Node = null;
    @property(Node)
    blueNode: Node = null;
    @property(Label)
    refereeLbl: Label = null;   
    @property(Label)
    hostLbl: Label = null;   
    @property(Button)
    inviteHostBtn: Button = null;
    @property(Button)
    startBtn: Button = null;
    @property(Button)
    closeBtn: Button = null;
    tvGameInfo: pkgsc.IScTVGameInfoPush = null;
      
    get refereeIsMe() {
        return PlayerManger.getInstance().playerSelfInfo.isUmpire && this.tvGameInfo.umpire.id == PlayerManger.getInstance().playerId;

    };
    start() {
        this.addEvent();
    }

    update(deltaTime: number) {

    }

    onDestroy() {
        this.removeEvent();
    }

    public onRemoved() {
    }

    public async onAdded(param: pkgsc.IScTVGameInfoPush) {
        this.tvGameInfo = param;
        this.ScTVGameInfoPush("", this.tvGameInfo);
    }

      
    invitePlayerClick(e: Event, customEventData: string) {
        if (this.refereeIsMe) {
            oops.gui.open(UIID.TVGameInvitePopUp, { isHost: false, team: customEventData == "red" ? core.Team.Red : core.Team.Blue });
        }
    }

      
    inviteHostClick() {
        if (this.refereeIsMe) {
            oops.gui.open(UIID.TVGameInvitePopUp, { isHost: true });
        }
    }

      
    updContestantUpd(node: Node, member: pkgsc.ScTVGameInfoPush.IMember) {
        let addNode = find("bg/icon", node);
        let uidLbl = find("uidLbl", node).getComponent(Label);
        let nameLbl = find("nameLbl", node).getComponent(Label);
        let cardNode = find("cardNode", node);
        let equipNode = find("equipNode", node);

        addNode.active = member.id == 0 && this.refereeIsMe;
        uidLbl.string = member.id > 0 ? `${member.id}` : "";
        nameLbl.string = member.name;

        for (let index = 0; index < cardNode.children.length; index++) {
            const cNode = cardNode.children[index];
            const card = member.cards[index];
            let cardPrefab = cNode.getComponent(CardPrefab);
            if (card) {
                cardPrefab.init(
                    {
                        card: card,
                        cardPrefabType: CardPrefabType.CardInfo,
                    }
                )
            } else {
                cardPrefab.init(
                    {
                        cardPrefabType: CardPrefabType.None,
                    }
                )
            }
        }

        for (let index = 0; index < equipNode.children.length; index++) {
            const eNode = equipNode.children[index];
            const equip = member.equipts[index];
            let equipPrefab = eNode.getComponent(EquipmentPrefab);
            if (equip) {
                equipPrefab.init(
                    {
                        equip: equip,
                        equipPrefabType: EquipPrefabType.NumInfoNoPower,
                    }
                )
            } else {
                equipPrefab.init(
                    {
                        equipPrefabType: EquipPrefabType.None,
                    }
                )
            }
        }
    }

    async startTVGameClick() {
        let d = await netChannel.home.reqUnique(opcode.OpCode.CsStartTVGameReq, opcode.OpCode.ScStartTVGameResp, pkgcs.CsStartTVGameReq.create())
        if (d.code == errcode.ErrCode.Ok) {
            oops.gui.toast("tip_ok", true);
        }
    }

    // async createTVGame() {
    //     let d = await netChannel.home.reqUnique(opcode.OpCode.CsCreateTVGameReq, opcode.OpCode.ScCreateTVGameResp, pkgcs.CsCreateTVGameReq.create())
    //     if (d.code != errcode.ErrCode.Ok) {
    //         this.closeUI();
    //     }
    // }

    async closeTVGame() {
        let d = await netChannel.home.reqUnique(opcode.OpCode.CsCloseTVGameReq, opcode.OpCode.ScCloseTVGameResp, pkgcs.CsCloseTVGameReq.create())
        if (d.code == errcode.ErrCode.TVGameNotFound) {
            this.closeUI();
        }
    }

    private addEvent() {
        Message.on(`${opcode.OpCode.ScTVGameInfoPush}`, this.ScTVGameInfoPush, this);
        Message.on(`${opcode.OpCode.ScCloseTVGamePush}`, this.ScCloseTVGamePush, this);
        Message.on(BattleEvent.ENTER, this.BattleEnter, this);
        // Message.on(BattleEvent.QUIT, this.BattleQuit, this);
    }
    private removeEvent() {
        Message.off(`${opcode.OpCode.ScTVGameInfoPush}`, this.ScTVGameInfoPush, this);
        Message.off(`${opcode.OpCode.ScCloseTVGamePush}`, this.ScCloseTVGamePush, this);
        Message.off(BattleEvent.ENTER, this.BattleEnter, this);
    }

    BattleEnter() {
        this.closeUI();
    }

    ScTVGameInfoPush(event: string, data: pkgsc.IScTVGameInfoPush) {
        this.tvGameInfo = data;
        this.updContestantUpd(this.redNode, data.red)
        this.updContestantUpd(this.blueNode, data.blue)

        this.refereeLbl.string = data.umpire.name;
        this.hostLbl.string = data.sayer.name;

        this.inviteHostBtn.node.active = data.sayer.id == 0 && this.refereeIsMe;
        this.startBtn.node.active = this.refereeIsMe;
        this.closeBtn.node.active = this.refereeIsMe;
    }

    ScCloseTVGamePush(event: string, data: pkgsc.ScCloseTVGamePush) {
        this.closeUI();
    }

    closeUI() {
        oops.gui.remove(UIID.TVGameUI);
    }

    closeClick() {
        if (this.refereeIsMe) {
            this.closeTVGame();
        } else {
            this.closeUI();
        }
    }
}