import { _decorator, Component, Node } from 'cc';
import { LanguageLabel } from '../../../core/gui/language/LanguageLabel';
import { SerachComp } from '../uiComp/SerachComp';
import { SortComp } from '../uiComp/SortComp';
const { ccclass, property, type } = _decorator;

export enum SortEnum {
    Latest,   
    Oldest,   
      
      
}
export enum SerachEnum {
    All,   
    Forsale,   
    Forrent,   
    Forrented,   
}

@ccclass('FunComp')
export class FunComp extends Component {
    @type(SortComp)
    sortComp: SortComp = null;
    @type(SerachComp)
    serachComp: SerachComp = null;
    @type(LanguageLabel)
    serachLbl: LanguageLabel = null;
    @type(LanguageLabel)
    sortLbl: LanguageLabel = null;
    sortType: SortEnum = SortEnum.Latest;
    serachType: SerachEnum = SerachEnum.All;
    cb: cb;
    start() {

    }

    update(deltaTime: number) {

    }

    init(sortType: number, serachType: number, sortLblKeys: { [key: number]: string }, serachLblKeys: { [key: number]: string }, cb: cb) {
        this.sortType = sortType;
        this.serachType = serachType;
        this.sortComp.init(sortLblKeys);
        this.serachComp.init(serachLblKeys);
        this.cb = cb;
        this.updCB();
    }

    sortClick() {
        this.sortComp.show(this.sortCB.bind(this));
    }
    serachClick() {
        this.serachComp.show(this.serachCB.bind(this));
    }

    sortCB(sortType: SortEnum) {
        this.sortType = sortType;
        this.updCB();
    }
    serachCB(serachType: SerachEnum) {
        this.serachType = serachType;
        this.updCB();
    }

    updCB() {
        this.sortLbl.dataID = this.sortComp.lblKeys[this.sortType];
        this.serachLbl.dataID = this.serachComp.lblKeys[this.serachType];
        this.cb && this.cb(this.sortType, this.serachType);
    }
}

type cb = (sort: SortEnum, serach: SerachEnum) => void;

