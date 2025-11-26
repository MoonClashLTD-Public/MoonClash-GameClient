import { _decorator, Component, Node, ScrollView, Input, EventTouch, UITransform } from 'cc';
import List from '../../../../core/gui/list/List';
import { CommonUtil } from '../../../../core/utils/CommonUtil';
import { DotItem } from './DotItem';
const { ccclass, property } = _decorator;

@ccclass('DotController')
export class DotController extends Component {
    @property(List)
    private dotList: List
    private onDotRender(item: Node, idx: number) {
        const dotItem = item.getComponent(DotItem)
        if (dotItem) {
            dotItem.init(idx + 1, (pageNum) => {
                // idx = pageNum -1
                this.dotItemClick(idx)
            })
            dotItem.setSelect(idx == this.currInd)
        }
    }
    start() {
        this.hide();
    }
    
    onDisable() {
       this.hide()
    }
    
    private hide() {
        this.scheduleOnce(() => {
            this.dotList.scrollView["_unregisterEvent"]();
        }, 0.05);
    }

    private pageView: List
      
    bindPageList(list: List) {
        this.pageView = list
        // const sv = this.dotList.getComponent(ScrollView)
        // if (sv) sv.enabled = false
        // if(sv)sv.onEnable()
        // if (sv) sv["_unregisterEvent"]();
        // this.dotList.getComponent(ScrollView)["_unregisterEvent"]();
        // this.dotList.scrollView["_unregisterEvent"]();
        // this.dotList._unregisterEvent()
    }

    initDots() {
        if (!this.pageView) throw new Error("pageView is not bind");
        const list = this.pageView
        this.prevInd = this.currInd
        this.currInd = list.curPageNum
        this.dotList.numItems = list.numItems
        this.updateDotColor()
    }

    private prevInd = -1
    private currInd = -1

    updateDotColor() {
        if (!this.dotList || !this.pageView) return
        const curPageNum = this.pageView.curPageNum
        // if (curPageNum == this.currInd) return
        this.prevInd = this.currInd
        this.currInd = curPageNum
        if (this.prevInd != -1) {
            const prevDot = this.dotList.getItemByListId(this.prevInd)?.getComponent(DotItem)
            prevDot?.setSelect(false)
        }
        if (this.currInd != -1) {
            const prevDot = this.dotList.getItemByListId(this.currInd)?.getComponent(DotItem)
            if (!prevDot) return
            prevDot?.setSelect(true)
            let scollInd = this.currInd
              
            // if (Math.abs(this.prevInd - this.currInd) == 1) {
            //     scollInd = this.currInd + (this.prevInd < this.currInd ? -1 : -3)
            // } else {
            //     scollInd = this.currInd - 2
            // }
            scollInd = Math.floor(scollInd / 5) * 5
            this.dotList.scrollTo(scollInd)
        }
    }
    private cc: number
    private async dotItemClick(indx: number) {
        const _pageIndex = Number(indx)
        if (_pageIndex == this.currInd) return
        this.pageView?.skipPage(_pageIndex, 0.3)
        await CommonUtil.waitCmpt(this, 0.3)
        this.updateDotColor()
    }

    private async toPre() {
        const curPageNum = this.pageView.curPageNum
        const _pageIndex = curPageNum - 5
        if (_pageIndex >= 0) {
            // this.pageView?.prePage()

            this.pageView?.skipPage(_pageIndex, 0.3)
            await CommonUtil.waitCmpt(this, 0.3)
            this.updateDotColor()
        }
    }

    private async toNext() {
        // this.pageView?.nextPage()
        // this.updateDotColor()
        const curPageNum = this.pageView.curPageNum
        const _pageIndex = curPageNum + 5
        if (_pageIndex < this.pageView.numItems) {
            // this.pageView?.prePage()

            this.pageView?.skipPage(_pageIndex, 0.3)
            await CommonUtil.waitCmpt(this, 0.3)
            this.updateDotColor()
        }
    }
}

