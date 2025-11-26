import { _decorator, Component, Node, Label, Animation, tween, v3, easing, RichText } from 'cc';
import { oops } from '../../../../core/Oops';
import { CommonUtil } from '../../../../core/utils/CommonUtil';
import { UIID } from '../../../common/config/GameUIConfig';
import { netChannel } from '../../../common/net/NetChannelManager';
import { PlayerManger } from '../../../data/playerManager';
import { AudioMusicRes, AudioSoundRes } from '../../../data/resManger';
import { MathcUIParam } from '../../../matchUI/MatchUI';
import { BattleManger } from '../../BattleManger';
const { ccclass, property } = _decorator;

@ccclass('BattleSettlementTVGameCmp')
export class BattleSettlementTVGameCmp extends Component {
    @property(Node)
    redWinNode: Node = null;
    @property(Node)
    blueWinNode: Node = null;
    @property(Label)
    redNameLbl: Label = null;
    @property(Label)
    blueNameLbl: Label = null;
    @property(Label)
    redUidLbl: Label = null;
    @property(Label)
    blueUidLbl: Label = null;
    @property(Animation)
    anim: Animation = null;

    @property(Node)
    crownBlueNode: Node = null;
    @property(Node)
    crownRedNode: Node = null;
    start() {

    }

    update(deltaTime: number) {

    }

    async show(data: core.IBattleResult) {
        this.node.active = true;
        netChannel.gameClose();

        // this.crownBlueAnims.forEach(e => e.node.active = false);
        // this.crownRedAnims.forEach(e => e.node.active = false);

        // let playerMe = BattleManger.getInstance().playerMe;
        // let meTeam = BattleManger.getInstance().meTeam;
        // let enemyTeam = BattleManger.getInstance().enemyTeam;
        // let meIsWin = meTeam == data.winner;

        this.redWinNode.active = data.winner == core.Team.Red;
        this.blueWinNode.active = data.winner == core.Team.Blue;

        oops.audio.stopAll();
        BattleManger.getInstance().Battle.battleAudio.stopAll();
        // if (meIsWin)
        oops.audio.playEffect(AudioSoundRes.battleWin);
        // else
        //     oops.audio.playEffect(AudioSoundRes.battleFail);

        this.redNameLbl.string = `${BattleManger.getInstance().armies[core.Team.Red].name}`;
        this.blueNameLbl.string = `${BattleManger.getInstance().armies[core.Team.Blue].name}`;;
        this.redUidLbl.string = `UID${BattleManger.getInstance().armies[core.Team.Red].id}`;
        this.blueUidLbl.string = `UID${BattleManger.getInstance().armies[core.Team.Blue].id}`;;

        await Promise.all(
            [
                this.playCrownAnim(this.crownBlueNode.children, data.scores[core.Team.Blue]),
                this.playCrownAnim(this.crownRedNode.children, data.scores[core.Team.Red])
            ]
        )
        this.anim.play("animation");
        // // for (let index = 0; index < data.scores[meTeam]; index++) {
        // // }
        // // for (let index = 0; index < data.scores[enemyTeam]; index++) {
        // // }

        // // this.successNode.forEach(e => e.active = meIsWin);
        // // this.failNodes.forEach(e => e.active = !meIsWin);
        // // this.score1.string = `${data.scores[meTeam]}`
        // // this.score2.string = `${0}`
        // // this.score3.string = `${0}`

    }

    playCrownAnim(nodes: Node[], score: number) {
        return new Promise(async (resolve) => {
            nodes.forEach(e => e.children[0].active = false);
            for (let index = 0; index < score; index++) {
                nodes[index].children[0].active = true;
                let n = nodes[index].children[0];
                let scale = index == 2 ? v3(1.0, 1.0, 1.0) : v3(0.8, 0.8, 0.8);
                tween(n)
                    .to(0.2, { scale: v3(1, 1.5, 1) }, { easing: easing.bounceIn })
                    .to(0.2, { scale: scale }, { easing: easing.bounceOut })
                    .start();
                await CommonUtil.waitCmpt(this, 0.35);
            }
            resolve(null);
        })
    }

    exitClick() {
        oops.gui.remove(UIID.BattleUI, true);
    }
    continueClick() {
        oops.gui.remove(UIID.BattleUI, true);
        oops.gui.open<MathcUIParam>(UIID.MatchUI, {
            mapId: BattleManger.getInstance().mapId,
            matchType: BattleManger.getInstance().matchType,
        });
    }

    onDestroy() {
        netChannel.gameClose();
    }
}

