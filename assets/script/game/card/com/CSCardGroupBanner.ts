import { _decorator, Component, Node, EventTouch } from 'cc';
import { Message } from '../../../core/common/event/MessageManager';
import List from '../../../core/gui/list/List';
import { tips } from '../../../core/gui/prompt/TipsManager';
import { oops } from '../../../core/Oops';
import { DotController } from '../../common/com/PageView/DotController';
import { GameEvent } from '../../common/config/GameEvent';
import { UIID } from '../../common/config/GameUIConfig';
import { DataEvent } from '../../data/dataEvent';
import { PlayerManger } from '../../data/playerManager';
import { IInitCardGroupDurbleCfg } from '../pop/CSGroupDurablePop';
import { CardGroupClickItemListener } from '../utils/fun';
import { CSCardBanner } from './CSCardBanner';
const { ccclass, property } = _decorator;

@ccclass('CSCardGroupBanner')
export class CSCardGroupBanner extends Component {
    @property(List)
    private pageList: List = null;
    @property(DotController)
    private dotController: DotController = null
    private get cardGroupManager() {
        return PlayerManger.getInstance().cardManager.playCardGroup
    }

    private onListRender(item: Node, idx: number) {
        const cardBanner = item.getComponent(CSCardBanner)
        const cgIdx = this.cardGroupManager.getCardGroupIdByIndx(idx)
        if (cgIdx) {
            cardBanner?.init({
                groupIdx: idx,
                openCardAnim: this.config?.openCardAnim,
                fun: this.config?.listener,
                hasBtm: this.config?.hasBtm
            })
        }
    }

    private onListPageChange(pageNum: number) {
        this.cardGroupManager.setCurrCardGroupInd(pageNum)
        const listener = this.config?.listener
        if (listener) {
            listener.itemClick && listener.itemClick(null)
            listener.onListPageChange && listener.onListPageChange(pageNum)
        }
        this.dotController.updateDotColor()
    }


    private config: IInitCardGroupBannner
    init(params?: IInitCardGroupBannner) {
        this.config = params
    }

    // updBanner() {
    //     const len = this.cardGroupManager?.cardGroupLen ?? 0
    //     if (len != this.pageList.numItems) {
    //         this.updateItems()
    //     } else {
    //         this.updateCurrPage()
    //     }
    // }

    updateItems() {
        const len = this.cardGroupManager?.cardGroupLen ?? 0
        this.pageList.numItems = len
        const _pageIndex = this.cardGroupManager.getCurrCardGroupInd()
        if (_pageIndex != this.pageList.curPageNum) {
            this.pageList.skipPage(_pageIndex, 0)
        }

        this.dotController.initDots()
    }

      
    updateCurrPage() {
        const _pageIndex = this.cardGroupManager.getCurrCardGroupInd()
        if (_pageIndex != this.pageList.curPageNum) {
            this.pageList.skipPage(_pageIndex, 0)
        }
        this.pageList.updateItem([_pageIndex]);
    }

    getCurPageBanner(): CSCardBanner | undefined {
        return this.currPageNode()
    }

    private currPageNode() {
        return this.pageList?.getItemByListId(this.pageList?.curPageNum)?.getComponent(CSCardBanner)
    }

    private cb(event: EventTouch, customEventData: string) {
        switch (customEventData) {
            case 'toPre':
                this.pageList?.prePage()
                break;
            case 'toNext':
                this.pageList?.nextPage()
                break;
            case 'addPower':
                const _pageIndex = this.pageList?.curPageNum ?? -1
                const ret = this.cardGroupManager.isEmptyCardGroupByIndx(_pageIndex)
                if (ret.hasLease) {
                    tips.errorTip('tip_card_group_has_lease', true)
                } else {
                    if (ret.ok) {
                        oops.gui.open<IInitCardGroupDurbleCfg>(UIID.CardSysGroupDurablePop,
                            { groupTypeId: ret.groupId }
                        )
                    } else {
                        tips.errorTip('tip_card_group_power_full', true)
                    }
                }
                break;
            default:
                break;
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
        Message.on(GameEvent.CardGroupDataRefresh, this.updateItems, this);
        Message.on(GameEvent.CardDataRefresh, this.updateItems, this);
        Message.on(DataEvent.DATA_CURRCARDGROUPID_CHANGE, this.updateCurrPage, this);
    }

      
    private removeEvent() {
        Message.off(GameEvent.EquipGroupDataRefresh, this.updateItems, this);
        Message.off(GameEvent.EquipDataRefresh, this.updateItems, this);
        Message.off(GameEvent.CardGroupDataRefresh, this.updateItems, this);
        Message.off(GameEvent.CardDataRefresh, this.updateItems, this);
        Message.off(DataEvent.DATA_CURRCARDGROUPID_CHANGE, this.updateCurrPage, this);
    }
}

export interface IInitCardGroupBannner {
    openCardAnim?: boolean
    hasBtm?: boolean
    listener?: CardGroupClickItemListener
}

