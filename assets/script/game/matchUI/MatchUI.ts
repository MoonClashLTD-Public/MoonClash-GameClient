import { _decorator, Component, Node, tween, v3, animation, Animation } from 'cc';
import { Message } from '../../core/common/event/MessageManager';
import { storage } from '../../core/common/storage/StorageManager';
import { LanguageData } from '../../core/gui/language/LanguageData';
import { AlertParam } from '../../core/gui/prompt/Alert';
import { oops } from '../../core/Oops';
import { BattleManger } from '../battle/BattleManger';
import { BattleEvent } from '../battle/utils/BattleEnum';
import { CardSystemUtils } from '../card/utils/cardSystemUtils';
import { UIID } from '../common/config/GameUIConfig';
import { netChannel } from '../common/net/NetChannelManager';
import { PlayerManger } from '../data/playerManager';
import { AudioSoundRes } from '../data/resManger';
import { EquipSystemUtils } from '../equipmentUI/utils/equipSystemUtils';
import { STORAGE_ENUM } from '../homeUI/HomeEvent';
const { ccclass, property } = _decorator;

@ccclass('MatchUI')
export class MatchUI extends Component {
    @property(Node)
    matchAnim: Node = null;

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

    public async onAdded(param: MathcUIParam) {
        let cards: core.ICard[] = [];
        let equips: core.IEquipment[] = [];
        if (param.matchType == core.MatchType.MatchTypeArena) {  // pvp
            cards = PlayerManger.getInstance().cardManager.playCardGroup.getCurrCardGroupCards().filter((v, k) => v.id != 0);
            equips = PlayerManger.getInstance().equipManager.playEquipGroup.getCurrCardGroup().filter((v, k) => v.id != 0);
        } else if (param.matchType == core.MatchType.MatchTypeChallenge) { // pve
            cards = PlayerManger.getInstance().pveInfo.getPveCardGroup.filter((v, k) => v.id != 0);
            equips = PlayerManger.getInstance().pveInfo.equipGroupCards.filter((v, k) => v.id != 0);
        }

        cards = cards.map(v => {
            let d = PlayerManger.getInstance().cardManager.playCard.netCards.find(e => e.id == v.id);
            return d ? d : v;
        })
        equips = equips.map(v => {
            let d = PlayerManger.getInstance().equipManager.playEquips.equips.find(e => e.id == v.id);
            return d ? d : v;
        })

        let _cards = cards.filter((v, k) => !CardSystemUtils.canGoGame({ card: v }));
        let _equips = equips.filter((v, k) => !EquipSystemUtils.canGoGame({ cardId: v.id }));
        if (cards.length < 6) {
            oops.gui.toast('match_tips_5', true);
            this.close();
            return;
        }
        if (cards.length > 0 && _cards.length > 0) {
            oops.gui.toast('match_tips_0', true);
            this.close();
            return;
        }
        if (equips.length > 0 && _equips.length > 0) {
            oops.gui.toast('match_tips_1', true);
            this.close();
            return;
        }

        if (param.matchType == core.MatchType.MatchTypeArena) {
            let idx = cards.findIndex(v => v.power <= 0);
            if (idx != -1) {   
                if (storage.get(STORAGE_ENUM.pvpTip, 0) == new Date().getUTCDate()) {
                      
                } else {
                    let bf = await new Promise<boolean>((resolve) => {
                        oops.gui.open<AlertParam>(UIID.Alert, {
                            content: LanguageData.getLangByID('pvp_battle_tip_power'),
                            toggleInfo: {
                                i18DataID: "tip_not_remind",
                                isChecked: false,
                            },
                            okCB: (isCheck: boolean) => {
                                if (isCheck)
                                    storage.set(STORAGE_ENUM.pvpTip, new Date().getUTCDate());
                                resolve(true)
                            },
                            cancelCB: () => resolve(false),
                        });
                    })
                    if (bf == false) {
                        this.close();
                        return;
                    }
                }
            }
        }

        let anim = this.matchAnim.getComponent(Animation);
        anim.play("animation-001");

        let data = pkgcs.CsMatchReq.create();
        data.mapId = param.mapId;
        data.matchType = param.matchType;
          
        if (param.matchType == core.MatchType.MatchTypeArena) {
            const playCardGroup = PlayerManger.getInstance().cardManager.playCardGroup
            const playEquipGroup = PlayerManger.getInstance().equipManager.playEquipGroup
            data.cardGroupId = playCardGroup.currCardGroupId;
            data.equipmentGroupId = playEquipGroup.getCurrGroupIdByIdx(playCardGroup.currGroupIdx)
            await playEquipGroup.upCurrEquipCardId()
        }

        let d = await netChannel.home.reqUnique(opcode.OpCode.CsMatchReq, opcode.OpCode.ScMatchResp, data)
        if (d.code == errcode.ErrCode.Ok || d.code == errcode.ErrCode.PlayerInMatching) {
            BattleManger.getInstance().matchType = param.matchType;
        } else {
            this.close();
        }
    }

    async matchCancelClick() {
        let data = pkgcs.CsMatchCancelReq.create();
        let d = await netChannel.home.reqUnique(opcode.OpCode.CsMatchCancelReq, opcode.OpCode.ScMatchCancelResp, data)
        if (d.code == errcode.ErrCode.Ok)
            this.close();
    }


    private addEvent() {
        Message.on(`${opcode.OpCode.ScBattleEnterPush}`, this.ScBattleEnterPush, this);
        Message.on(BattleEvent.ENTER, this.BattleEnter, this);
        // Message.on(BattleEvent.QUIT, this.BattleQuit, this);
    }
    private removeEvent() {
        Message.off(`${opcode.OpCode.ScBattleEnterPush}`, this.ScBattleEnterPush, this);
        Message.off(BattleEvent.ENTER, this.BattleEnter, this);
    }

    BattleEnter() {
        this.close();
    }

    ScBattleEnterPush(event: string, data: pkgsc.ScBattleEnterPush) {
          
        if (data.code != errcode.ErrCode.Ok) {
            oops.audio.playEffect(AudioSoundRes.matchSucc);
            this.close();
        }
    }

    close() {
        oops.gui.remove(UIID.MatchUI);
    }
}


export type MathcUIParam = {
    mapId: number,
    matchType: core.MatchType,
}