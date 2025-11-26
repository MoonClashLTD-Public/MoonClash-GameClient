import { _decorator, Component, Node, log } from 'cc';
import { Message } from '../../../core/common/event/MessageManager';
import List from '../../../core/gui/list/List';
import { oops } from '../../../core/Oops';
import { DotController } from '../../common/com/PageView/DotController';
import { GameEvent } from '../../common/config/GameEvent';
import { UIID } from '../../common/config/GameUIConfig';
import { DataEvent } from '../../data/dataEvent';
import { PlayerManger } from '../../data/playerManager';
import { ETCardGroupClickItemListener } from '../utils/fun';
import { ETCardBanner } from './ETCardBanner';
const { ccclass, property } = _decorator;

@ccclass('ETCardGroupBanner')
export class ETCardGroupBanner extends Component {
    @property(List)
    private pageList: List = null;
    @property(DotController)
    private dotController: DotController = null
    private get equipGroupManager() {
        return PlayerManger.getInstance().equipManager.playEquipGroup
    }

    private onListRender(item: Node, idx: number) {
        // item.getComponent(Button).clickEvents[0].customEventData = `${idx}`
        const cardBanner = item.getComponent(ETCardBanner)
        const cgIdx = this.equipGroupManager.getCardGroupIdByIndx(idx)
        if (cgIdx) {
            cardBanner?.init({
                groupId: cgIdx,
                fun: this.config?.listener
            })
        }
    }

    private onListPageChange(pageNum: number) {
        this.equipGroupManager.setCurrCardGroupInd(pageNum)
        const listener = this.config?.listener
        if (listener) {
            listener.itemClick && listener.itemClick(null)
            listener.onListPageChange && listener.onListPageChange(pageNum)
        }
        this.dotController.updateDotColor()
    }

    private config: IInitETCardGroupBannner
    init(params?: IInitETCardGroupBannner) {
        this.config = params
    }
    // updBanner() {
    //     const len = this.equipGroupManager?.equipCardGroupLen ?? 0
    //     if (len != this.pageList.numItems) {
    //         this.updateItems()
    //     } else {
    //         this.updateCurrPage()
    //     }
    // }

    updateItems() {
        const len = this.equipGroupManager?.equipCardGroupLen ?? 0
        this.pageList.numItems = len
        const _pageIndex = this.equipGroupManager.getCurrGroupIdx()
        if (_pageIndex != this.pageList.curPageNum) {
            this.pageList.skipPage(_pageIndex, 0)
        }
        this.dotController.initDots()
    }

      
    updateCurrPage() {
        const _pageIndex = this.equipGroupManager.getCurrGroupIdx()
        if (_pageIndex != this.pageList.curPageNum) {
            this.pageList.skipPage(_pageIndex, 0)
        }
        this.pageList.updateItem([_pageIndex]);
    }

      
    private addPower() {
        const _pageIndex = this.pageList?.curPageNum ?? -1
        if (_pageIndex != -1) {
            oops.gui.open(UIID.CardSysGroupDurablePop)
        }
    }

    onLoad() {
        this.dotController?.bindPageList(this.pageList)
        this.addEvent();
    }

    onDestroy() {
        this.removeEvent();
    }

      
    private addEvent() {
        Message.on(GameEvent.EquipGroupDataRefresh, this.updateItems, this);
        Message.on(GameEvent.EquipDataRefresh, this.updateItems, this);
        Message.on(DataEvent.DATA_CURREQUIPGROUPID_CHANGE, this.updateCurrPage, this);
    }

      
    private removeEvent() {
        Message.off(GameEvent.EquipGroupDataRefresh, this.updateItems, this);
        Message.off(GameEvent.EquipDataRefresh, this.updateItems, this);
        Message.off(DataEvent.DATA_CURREQUIPGROUPID_CHANGE, this.updateCurrPage, this);
    }
}

export interface IInitETCardGroupBannner {
    openCardAnim?: boolean
    hasBtm?: boolean
    listener?: ETCardGroupClickItemListener
}

