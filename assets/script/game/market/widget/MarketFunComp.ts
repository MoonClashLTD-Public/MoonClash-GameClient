import { _decorator, Component, Node, EditBox, instantiate } from 'cc';
import { LanguageLabel } from '../../../core/gui/language/LanguageLabel';
import { tips } from '../../../core/gui/prompt/TipsManager';
import { oops } from '../../../core/Oops';
import { CommonUtil } from '../../../core/utils/CommonUtil';
import { UIID } from '../../common/config/GameUIConfig';
import { MarketPage } from '../MarketPage';
import { MarketScreeningConf, MarketScreeningPopUpParam } from '../MarketScreeningPopUp';
import { MarketSearchComp } from '../uiComp/MarketSearchComp';
import { MarketSortComp } from '../uiComp/MarketSortComp';
import { MarketLogPopUpParam } from '../MarketLogPopUp';
const { ccclass, property, type } = _decorator;

export enum SortEnum {
    Latest,   
    Oldest,   
    Lowest,   
    Highest,   
}

@ccclass('MarketFunComp')
export class MarketFunComp extends Component {
    @type(MarketSearchComp)
    serachComp: MarketSearchComp = null;
    @type(MarketSortComp)
    sortComp: MarketSortComp = null;
    @type(LanguageLabel)
    sortLbl: LanguageLabel = null;
    @type(EditBox)
    serachEditbox: EditBox = null;
    sortLblKeys: { [key: number]: string } = {
        [SortEnum.Latest]: "wallet_btn_latest",   
        [SortEnum.Oldest]: "wallet_btn_oldest",   
        [SortEnum.Lowest]: "wallet_btn_lowest",   
        [SortEnum.Highest]: "wallet_btn_highest",   
    }
    sortType: SortEnum = SortEnum.Latest;
    get marketPage() {
        return this.node.parent.parent.parent.parent.getComponent(MarketPage);
    }
    historyConf: { [key: number]: MarketScreeningConf[] } = {};
    historyData: { [key: number]: watrade.ITradeQueryReq } = {};
    cb: cb;
    start() {

    }

    update(deltaTime: number) {

    }

    init(cb: cb) {
        this.historyData[this.marketPage.pageType] = this.historyData[this.marketPage.pageType] ?? watrade.TradeQueryReq.create();
        this.cb = cb;
        this.updCB();
    }

    serachClick() {
        // oops.gui.open(UIID.MarketScreeningPopUp);
        // this.serachComp.show(this.serachCB.bind(this));
        this.serachCB();
    }

    screeningClick() {
        oops.gui.open<MarketScreeningPopUpParam>(UIID.MarketScreeningPopUp, {
            type: this.marketPage.pageType,
            cb: (d: watrade.ITradeQueryReq, conf: MarketScreeningConf[]) => {
                this.historyData[this.marketPage.pageType] = d;
                this.updCB();
                this.historyConf[this.marketPage.pageType] = conf;
            },
            conf: this.historyConf[this.marketPage.pageType],
        });
    }

    sortClick() {
        this.sortComp.show(this.sortCB.bind(this));
    }

    sortCB(sortType: SortEnum) {
        this.sortType = sortType;
        this.updCB();
    }

    serachCB() {
        this.updCB(this.serachEditbox.string);
    }

    async refreshClick() {
        tips.showNetLoadigMask();
        await CommonUtil.waitCmpt(this, 0);
        this.updCB(this.serachEditbox.string).then(() => {
            tips.hideNetLoadigMask();
        });
    }

    logClick() {
        oops.gui.open<MarketLogPopUpParam>(UIID.MarketLogPopUp, { nftType: this.marketPage.pageType });
    }

    async updCB(serachStr?: string) {
        this.sortLbl.dataID = this.sortLblKeys[this.sortType];
        await this.cb && this.cb(this.sortType, this.historyData[this.marketPage.pageType], serachStr);
    }

    clear() {
        this.historyConf = {};
        this.historyData = {};
    }


    @property(Node)
    private boardBgNode: Node = null;
    private curBoardBgNodes: Node[] = [];
    private flag: number = 0;
    async updBoardBg(num: number) {
        this.flag++
        let currFlay = this.flag

        if (num > 9) {
            let n = Math.ceil((num - 9) / 3) - this.curBoardBgNodes.length;
            for (let index = 0; index < n; index++) {
                if (index % 1 == 0) await CommonUtil.waitCmpt(this, 0);
                if (currFlay != this.flag) return;
                let node = instantiate(this.boardBgNode);
                this.boardBgNode.parent.addChild(node);
                this.curBoardBgNodes.push(node);
            }
        }
    }
}

type cb = (sort: SortEnum, data: watrade.ITradeQueryReq, serachStr?: string) => void;

