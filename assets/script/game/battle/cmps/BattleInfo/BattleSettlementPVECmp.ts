import { _decorator, Component, Node, Label, Animation, tween, v3, easing, RichText, UIOpacity } from 'cc';
import { LanguageLabel } from '../../../../core/gui/language/LanguageLabel';
import { oops } from '../../../../core/Oops';
import { CommonUtil } from '../../../../core/utils/CommonUtil';
import { UIID } from '../../../common/config/GameUIConfig';
import { netChannel } from '../../../common/net/NetChannelManager';
import TablePve from '../../../common/table/TablePve';
import { PlayerManger } from '../../../data/playerManager';
import { AudioMusicRes, AudioSoundRes } from '../../../data/resManger';
import { MathcUIParam } from '../../../matchUI/MatchUI';
import { BattleManger } from '../../BattleManger';
const { ccclass, property } = _decorator;

@ccclass('BattleSettlementPVECmp')
export class BattleSettlementPVECmp extends Component {
    @property(Node)
    winNode: Node = null;
    @property(Node)
    failNode: Node = null;
    @property(Node)
    rewardNode: Node = null;
    @property(LanguageLabel)
    levelNameLb: LanguageLabel = null;
    @property(LanguageLabel)
    levelDescLb: LanguageLabel = null;
    @property(Node)
    dggNode: Node = null;
    @property(Node)
    dggFriendNode: Node = null;
    @property(Node)
    dnaFriendNode: Node = null;
    @property(Node)
    dnaNode: Node = null;
    @property(Node)
    boxNode: Node = null;
    @property(Node)
    assistPtsNode: Node = null;
    start() {

    }

    update(deltaTime: number) {

    }

    async show(data: core.IBattleResult) {
        this.node.active = true;
        netChannel.gameClose();

        // this.crownBlueAnims.forEach(e => e.node.active = false);
        // this.crownRedAnims.forEach(e => e.node.active = false);

        let playerMe = BattleManger.getInstance().playerMe;
        let meTeam = BattleManger.getInstance().meTeam;
        let enemyTeam = BattleManger.getInstance().enemyTeam;
        let meIsWin = meTeam == data.winner;
        this.winNode.active = meIsWin;
        this.failNode.active = !meIsWin;

        oops.audio.stopAll();
        BattleManger.getInstance().Battle.battleAudio.stopAll();
        if (meIsWin)
            oops.audio.playEffect(AudioSoundRes.battleWin);
        else
            oops.audio.playEffect(AudioSoundRes.battleFail);

        let pveId = BattleManger.getInstance().armies[enemyTeam].pveId;
        const pveCfg = TablePve.getInfoById(pveId);
        this.levelNameLb.dataID = pveCfg.name
        this.levelDescLb.dataID = pveCfg.description ?? ''

        let info = data.armyInfos.find((v, k) => v.id == playerMe.id);
        if (info) {
            let dna = CommonUtil.weiToEther(`${info.dnaWei}`);
            let dgg = CommonUtil.weiToEther(`${info.dggWei}`);
            this.dnaNode.active = dna.gt(0);
            this.dggNode.active = dgg.gt(0);
            this.boxNode.active = info.boxes > 0;
            this.assistPtsNode.active = info.assistPts > 0;
            this.dnaNode.getComponentInChildren(Label).string = `+${CommonUtil.weiToEtherStr(info.dnaWei)}`
            this.dggNode.getComponentInChildren(Label).string = `+${CommonUtil.weiToEtherStr(info.dggWei)}`
            this.boxNode.getComponentInChildren(Label).string = `+${info.boxes}`
            this.assistPtsNode.getComponentInChildren(Label).string = `+${info.assistPts}`
        }

        let d = BattleManger.getInstance().battlePlayerReady;
        if (d.assistByPct) {
            let dna = new BigNumber(`${info.dnaWei}`);
            let dgg = new BigNumber(`${info.dggWei}`);

            this.dnaFriendNode.active = dna.gt(0);
            this.dggFriendNode.active = dgg.gt(0);

            let _dna = dna.times(d.assistByPct / 10000).toFixed();
            let _dgg = dgg.times(d.assistByPct / 10000).toFixed();

            this.dnaNode.getComponentInChildren(Label).string = `+${CommonUtil.weiToEtherStr(dna.minus(_dna).toFixed())}`
            this.dggNode.getComponentInChildren(Label).string = `+${CommonUtil.weiToEtherStr(dgg.minus(_dgg).toFixed())}`

            this.dnaFriendNode.getComponentInChildren(Label).string = `+${CommonUtil.weiToEtherStr(_dna)}`;
            this.dggFriendNode.getComponentInChildren(Label).string = `+${CommonUtil.weiToEtherStr(_dgg)}`;
        } else {
            this.dnaFriendNode.active = false;
            this.dggFriendNode.active = false;
        }

        let uio = this.rewardNode.getComponent(UIOpacity);
        uio.opacity = 0;
        tween(uio)
            .to(0.5, { opacity: 255 }, { easing: easing.smooth })
            .start();
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

