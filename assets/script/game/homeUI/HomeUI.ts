import { _decorator, Component, Prefab, PageView, instantiate, Node, UIOpacity, sys, Game } from 'cc';
import { EngineMessage } from '../../core/common/event/EngineMessage';
import { Message } from '../../core/common/event/MessageManager';
import { Logger } from '../../core/common/log/Logger';
import { oops } from '../../core/Oops';
import { BattleEvent } from '../battle/utils/BattleEnum';
import { CardSystemUtils } from '../card/utils/cardSystemUtils';
import { config } from '../common/config/Config';
import { GameEvent } from '../common/config/GameEvent';
import { UIID } from '../common/config/GameUIConfig';
import { netChannel } from '../common/net/NetChannelManager';
import { DataEvent } from '../data/dataEvent';
import { PlayerManger } from '../data/playerManager';
import { EquipSystemUtils } from '../equipmentUI/utils/equipSystemUtils';
import { HotUpdate } from '../initialize/view/HotUpdate';
import { HomeBottom } from './HomeBottom';
const { ccclass, property } = _decorator;

@ccclass('HomeUI')
export class HomeUI extends Component {
    @property([Prefab])
    pagesPrefab = [];

    @property(PageView)
    pageView: PageView = null;
    @property(HomeBottom)
    homeBottom: HomeBottom = null;
    @property(Node)
    friendHot: Node = null
    @property(Node)
    cardHot: Node = null
    @property(Node)
    equipHot: Node = null

    start() {
        HotUpdate.checkUpdate();
        // this.node.getChildByName("gmButton").active = config.game.isDev || sys.isBrowser;
        this.node.getChildByName("gmButton").active = false;
    }

    curDay = -1;
    update(deltaTime: number) {
        const date = new Date();
        let d = date.getUTCDate();
        if (this.curDay == -1) {
            this.curDay = d;
        } else if (this.curDay != d) {
              
            this.curDay = d;
            Message.dispatchEvent(DataEvent.DATA_PVEBATTLEID_CHANGE);
        }
    }
    public onAdded(params: any = {}) {
        this.init();
        this.addEvent();
    }
    public onRemoved() {
        this.removeEvent();
    }

    _init: boolean = false;
    init() {
        if (this._init) return;
        this._init = true;

        for (const pagePrefab of this.pagesPrefab) {
            let pageNode = instantiate(pagePrefab);
            pageNode.addComponent(UIOpacity);
            this.pageView.addPage(pageNode);
        }
        this.homeBottom.init(this.pageView);
    }
    async gmClick() {
        oops.gui.open(UIID.GMUI);
    }

    private addEvent() {
        Message.on(EngineMessage.GAME_ENTER, this.GAME_ENTER, this);
        Message.on(BattleEvent.ENTER, this.BattleEnter, this);
        Message.on(BattleEvent.QUIT, this.BattleQuit, this);
        Message.on(GameEvent.CardDataRefresh, this.upHot, this);
        Message.on(GameEvent.EquipDataRefresh, this.upHot, this);
        Message.on(GameEvent.CardHotDeleteRefresh, this.upHot, this);
        Message.on(GameEvent.EquipHotDeleteRefresh, this.upHot, this);
        Message.on(GameEvent.FriendHotDeleteRefresh, this.FriendHotDeleteRefresh, this);
        Message.on(DataEvent.DATA_CURRCARDGROUPID_CHANGE, this.DATA_CURRCARDGROUPID_CHANGE, this);
        Message.on(`${opcode.OpCode.ScTVGameInfoPush}`, this.ScTVGameInfoPush, this);
    }
    private removeEvent() {
        Message.off(EngineMessage.GAME_ENTER, this.GAME_ENTER, this);
        Message.off(BattleEvent.ENTER, this.BattleEnter, this);
        Message.off(BattleEvent.QUIT, this.BattleQuit, this);
        Message.off(GameEvent.CardDataRefresh, this.upHot, this);
        Message.off(GameEvent.EquipDataRefresh, this.upHot, this);
        Message.off(GameEvent.CardHotDeleteRefresh, this.upHot, this);
        Message.off(GameEvent.EquipHotDeleteRefresh, this.upHot, this);
        Message.off(GameEvent.FriendHotDeleteRefresh, this.FriendHotDeleteRefresh, this);
        Message.off(DataEvent.DATA_CURRCARDGROUPID_CHANGE, this.DATA_CURRCARDGROUPID_CHANGE, this);
        Message.off(`${opcode.OpCode.ScTVGameInfoPush}`, this.ScTVGameInfoPush, this);
    }

    BattleEnter() {
        oops.gui.remove(UIID.HomeUI);
        // let uio = this.node.getComponent(UIOpacity) ?? this.node.addComponent(UIOpacity);
        // uio.opacity = 0;
        // this.node.active = false;
    }
    BattleQuit() {
        // this.playMusic();
        // let uio = this.node.getComponent(UIOpacity) ?? this.node.addComponent(UIOpacity);
        // uio.opacity = 255;
        // this.node.active = true;
          
    }

    upHot() {
        const playManger = PlayerManger.getInstance()
        const cardHotM = playManger.cardManager.cardHots
        const equipHotM = playManger.equipManager.equipHots
        let cardHotNum = 0;
        let equipHotNum = 0;
        cardHotM.forEach((id) => {
            if (!CardSystemUtils.isHiddenByCardId(id)) cardHotNum++;
        })
        equipHotM.forEach((id) => {
            if (!EquipSystemUtils.isHiddenByCardId(id)) equipHotNum++;
        })
        this.cardHot.active = cardHotNum != 0
        this.equipHot.active = equipHotNum != 0
    }

    FriendHotDeleteRefresh(event: string, isShow: boolean) {
        this.friendHot.active = !!isShow;
    }

    GAME_ENTER() {
        HotUpdate.checkUpdate();
    }

    DATA_CURRCARDGROUPID_CHANGE() {
        const playCardGroup = PlayerManger.getInstance().cardManager.playCardGroup
        const playEquipGroup = PlayerManger.getInstance().equipManager.playEquipGroup
        playEquipGroup.upCurrEquipCardId()
        playCardGroup.upCurrCardId();
    }

    ScTVGameInfoPush(event: string, data: pkgsc.IScTVGameInfoPush) {
        if (!!!oops.gui.has(UIID.TVGameUI)) {
            oops.gui.open(UIID.TVGameUI, data);
        }
    }
}