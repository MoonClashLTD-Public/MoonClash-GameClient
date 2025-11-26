import { _decorator, Component, Node, sp, UIOpacity, Tween, tween, easing, Vec3 } from 'cc';
import { Message } from '../../core/common/event/MessageManager';
import List from '../../core/gui/list/List';
import { oops } from '../../core/Oops';
import { netChannel } from '../common/net/NetChannelManager';
import { BattleManger } from './BattleManger';
const { ccclass, property } = _decorator;

@ccclass('BattleFace')
export class BattleFace extends Component {
    @property(Node)
    faceNode: Node = null;
    @property([sp.SkeletonData])
    faceSks: sp.SkeletonData[] = [];
    @property(List)
    list: List = null;
    @property(Node)
    enemPlay: Node = null;
    @property(Node)
    mePlay: Node = null;
    @property(Node)
    playFaceNode: Node = null;

    @property([Node])
    cardNodes: Node[] = [];

    sfxCfg = [
        'king_congrats_01',
        'f',
        'king_laughter_01',
        'king_tut_first_vo_01',
        'king_mad_02',
        'king_mad_01',
        'w',
        'king_laughter_03',
        'j',
        'f',
        'king_mad_03',
        'king_happy_04',
        'king_tower_gone_01',
        'king_laughter_04',
        'king_crying_04',
        'king_laughter_01',
        'king_laughter_03',
        't',
        'ice_wiz_land_01',
        'king_mad_02',
    ]

    onLoad() {
        this.faceNode.active = false;
        this.enemPlay.active = false;
        this.mePlay.active = false;
        this.list.numItems = this.faceSks.length;
    }

    onDestroy() {
        this.removeEvent();
    }

    async selectedEvent(item: Node, idx: number) {
        this.faceClick();
        let d = await netChannel.game.reqUnique(opcode.OpCode.CbChatReq, opcode.OpCode.BcChatResp, pkgcb.CbChatReq.create(
            { emoji: idx, }
        ));
        // if (d.code == errcode.ErrCode.Ok) {
        // }
    }

    renderEvent(item: Node, idx: number) {
        let sk = item.getComponentInChildren(sp.Skeleton);
        sk.skeletonData = this.faceSks[idx];
        sk.setAnimation(0, 'icon', false);
    }

    addEvent() {
        Message.on(`${opcode.OpCode.BcChatPush}`, this.BcChatPush, this);
    }

    removeEvent() {
        Message.off(`${opcode.OpCode.BcChatPush}`, this.BcChatPush, this);
    }

    BcChatPush(e: string, data: pkgbc.BcChatPush) {
        let node: Node = null;
        if (BattleManger.getInstance().isWatcher) {
            let info = BattleManger.getInstance().armies.find(e => e.id == data.playerId);
            if (info.team == core.Team.Red) {
                node = this.enemPlay;
            } else if (info.team == core.Team.Blue) {
                node = this.mePlay;
            }
        } else {
            if (BattleManger.getInstance().playerMe.id == data.playerId) {
                node = this.mePlay;
            } else {
                node = this.enemPlay;
            }
        }

        if (node) {
            this.playFace(node, data.emoji);
            oops.audio.playEffect("audios/battle/face/" + this.sfxCfg[data.emoji]);
        }
    }

    playFace(node: Node, idx: number) {
        let d = this.faceSks[idx];
        node.active = true;
        let opt = node.getComponent(UIOpacity);
        opt.opacity = 0;
        Tween.stopAllByTarget(opt);
        tween(opt).to(0.1, { opacity: 255 }, { easing: easing.fade }).start();
        let sk = node.getComponentInChildren(sp.Skeleton)
        sk.skeletonData = d;
        sk.setAnimation(0, 'animation', false);
        sk.setCompleteListener(() => {
            tween(opt).to(0.1, { opacity: 0 }, { easing: easing.fade })
                .call(() => {
                    node.active = false;
                })
                .start();
        })
    }

    faceClick() {
        let bf = !this.faceNode.active;
        this.faceNode.active = bf;
        this.cardNodes.forEach(e => e.active = !bf);
    }
}