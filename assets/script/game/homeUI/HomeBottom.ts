import { _decorator, Component, Node, Event, v3, Tween, tween, easing, UITransform, PageView, UIOpacity } from 'cc';
import { Message } from '../../core/common/event/MessageManager';
import { oops } from '../../core/Oops';
import { GameEvent } from '../common/config/GameEvent';
import { AudioMusicRes } from '../data/resManger';
import { HOMEPAGEENUM } from './HomeEvent';
const { ccclass, property } = _decorator;

@ccclass('HomeBottom')
export class HomeBottom extends Component {
    @property(Node)
    btnParent: Node
    @property(Node)
    topCostNode: Node

    _pv: PageView
    _curPage: HOMEPAGEENUM = HOMEPAGEENUM.FIGHTINGPAGE;
    start() {
        this.addEvent();
    }

    onDestroy() {
        this.removeEvent();
    }

    update(deltaTime: number) {

    }

    init(pv: PageView) {
        this._pv = pv;
        this._pv["_unregisterEvent"]();   
        this._pv.scrollToPage(this._curPage, 0);
        this.pageEvent(null, null);
        this.initPage(this._curPage, -1, 0);
    }

    turnPages(pageIdx: HOMEPAGEENUM) {
        if (this._curPage == pageIdx) return;
        let oldPage = this._curPage;
        this._curPage = pageIdx;

        let pages = this._pv.getPages();
        let uio = pages[this._curPage].getComponent(UIOpacity);
        uio.opacity = 255;
        // uio.node.active = true;

        let t = 0.4;
        this._pv.scrollToPage(this._curPage, t);

        this.initPage(pageIdx, oldPage, t);
        // init
    }

    btnAct(pageIdx: HOMEPAGEENUM) {
        let defY = 0;
        let maxY = 11.12;
        let scale = 0.84
        let defW = 167
        let defH = 139
        let node = this.btnParent.children[pageIdx];
        if (this.curBtnNode == node) return;
        this.curBtnNode = node;
        this.btnParent.children.forEach(n => {
            Tween.stopAllByTarget(n);
            let y = defY;
            let w = defW * scale;
            let h = defH * scale;
            if (n == node) {
                y = maxY;
                w = defW;
                h = defH;
            }
            tween(n.getComponent(UITransform))
                .to(0.2, { width: w, height: h }, { easing: easing.smooth })
                .start();
            tween(n)
                .to(0.2, { position: v3(n.getPosition().x, y, 0) }, { easing: easing.smooth })
                .start();
        })
    }

    initPage(curPage: HOMEPAGEENUM, oldPage: HOMEPAGEENUM, t: number = 0) {
        this.scheduleOnce(() => {
            let pages = this._pv.getPages();
            pages[curPage].components.forEach(e => e["pageInit"] && e["pageInit"](this.homeTurnPageParam))
            if (pages[oldPage])
                pages[oldPage].components.forEach(e => e["pageOuit"] && e["pageOuit"]())
            this.playMusic();
            this.updateCostNode();
        }, t)
    }

    updateCostNode() {
        this.topCostNode.active = this._curPage == HOMEPAGEENUM.FIGHTINGPAGE;
    }

    pageEvent(event: Event, customEventData: string) {
        let pages = this._pv.getPages();
        for (let index = 0; index < pages.length; index++) {
            let uio = pages[index].getComponent(UIOpacity);
            uio.opacity = index == this._curPage ? 255 : 0;
        }
        this.updateCostNode();
    }

    curBtnNode: Node = null;
    btnClick(event: Event, customEventData: string) {
        this.turnPages(Number(customEventData));

        this.btnAct(Number(customEventData));
    }

    private addEvent() {
        Message.on(GameEvent.HomePagesShowOrHide, this.HomePagesShowOrHide, this);
        Message.on(GameEvent.HomeTurnPages, this.HomeTurnPages, this);
    }
    private removeEvent() {
        Message.off(GameEvent.HomePagesShowOrHide, this.HomePagesShowOrHide, this);
        Message.off(GameEvent.HomeTurnPages, this.HomeTurnPages, this);
    }

    HomePagesShowOrHide(e: string, param: { isShow: boolean }) {
        let pages = this._pv.getPages();
        for (let index = 0; index < pages.length; index++) {
            let uio = pages[index].getComponent(UIOpacity);
            if (param.isShow) {
                uio.opacity = index == this._curPage ? 255 : 0;
            } else {
                uio.opacity = 0;
            }
        }
    }


    homeTurnPageParam: any
    HomeTurnPages(e: string, param: HomeTurnPagesParam) {
        this.homeTurnPageParam = param.param;
        this.turnPages(param.page);
        this.btnAct(param.page);
    }

    playMusic() {
        switch (this._curPage) {
            case HOMEPAGEENUM.FRIENDPAGE:
                // oops.audio.playMusic(AudioMusicRes.blindBox);
                oops.audio.playMusic(AudioMusicRes.home);
                break;
            default:
                oops.audio.playMusic(AudioMusicRes.home);
                break;
        }
    }

    // curBtnNode: Node = null;
    // btnClick(event: Event, customEventData: string) {
    //     let defY = 0;
    //     let maxY = 42;
    //     let node: Node = event.target;
    //     if (this.curBtnNode == node) return;
    //     this.curBtnNode = node;
    //     this.btnParent.children.forEach(n => {
    //         Tween.stopAllByTarget(n);
    //         let y = defY;
    //         if (n == node) {
    //             y = maxY;
    //         }
    //         tween(n)
    //             .delay(0.1)
    //             .to(0.2, { position: v3(n.getPosition().x, y, 0) }, { easing: easing.smooth })
    //             .start();
    //     })
    //     Tween.stopAllByTarget(this.tableNode);
    //     let tableParent = this.tableNode.parent;
    //     let index = this.tableNode.getSiblingIndex();
    //     let tableNode = instantiate(this.tableNode);
    //     tableParent.addChild(tableNode);
    //     let yy = this.tableNode.getPosition().y;
    //     tableNode.setPosition(v3(node.position.x, -150));
    //     tween(tableNode)
    //         .to(0.2, { position: v3(node.position.x, yy, 0) }, { easing: easing.smooth })
    //         .call(() => {
    //             this.tableNode.destroy();
    //             this.tableNode = tableNode;
    //         })
    //         .start();
    //     tableNode.setSiblingIndex(index);
    //     tween(this.tableNode)
    //         .delay(0.1)
    //         .to(0.2, { position: v3(this.tableNode.getPosition().x, -150, 0) }, { easing: easing.smooth })
    //         .start();
    // }
}

export type HomeTurnPagesParam = {
    page: HOMEPAGEENUM
    param?: any
}