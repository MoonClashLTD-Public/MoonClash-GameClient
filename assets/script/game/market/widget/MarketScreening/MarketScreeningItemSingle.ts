import { _decorator, Component, Slider, log, find, SpriteFrame, Sprite, Node, instantiate, Layout, v3, Toggle, EventHandler, Event } from 'cc';
import { LanguageLabel } from '../../../../core/gui/language/LanguageLabel';
import { MarketScreeningConf, MarketScreeningItemType, MarketScreeningItemParam, itemBtnType as ItemBtnType, MarketScreeningPopUp } from '../../MarketScreeningPopUp';
import { MarketScreeningItem } from './MarketScreeningItem';
const { ccclass, property, type } = _decorator;

@ccclass('MarketScreeningItemSingle')
export class MarketScreeningItemSingle extends Component {
    @type(Node)
    btnTmp: Node = null;
    @type(Node)
    btnsNode: Node = null;
    get item() {
        return this.node.getComponent(MarketScreeningItem);
    }
    param: MarketScreeningConf = null;
    infoBtns: ItemBtnType[];
    isInit = false;
    marketScreeningPopUp: MarketScreeningPopUp
    start() {

    }

    update(deltaTime: number) {

    }

    init(marketScreeningPopUp: MarketScreeningPopUp, param: MarketScreeningConf) {
        this.marketScreeningPopUp = marketScreeningPopUp;
        this.isInit = false;
        this.param = param;
        this._init();
        this.isInit = true;
    }

      
    _init() {
        this.btnsNode.destroyAllChildren();
        let d = this.getDataList();
        if (d)
            this.addBtns(d);
        this.btnsNode.active = !!d;
    }

    getDataList() {
        let data = this.param.data;
        if (data.subTypeList) {
            return data.subTypeList;
        } else if (data.attrList) {
            return data.attrList;
        } else if (data.protoIdList) {
            return data.protoIdList;
        } else if (data.qualityList) {
            return data.qualityList;
        }
    }

    addBtns(btns: ItemBtnType[]) {
        this.infoBtns = btns;
        for (let index = 0; index < btns.length; index++) {
            let info = btns[index];
            let btnNode = instantiate(this.btnTmp);
            btnNode.active = true;
            let tog = btnNode.getComponent(Toggle);
            tog.name = `${index}`
            this.btnsNode.addChild(btnNode);
            tog.isChecked = !!info.isCheck;
            btnNode.getComponentInChildren(LanguageLabel).dataID = info.btnLblId;

            if (this.param.data.attrList) {
                tog.node.name = `${this.param.data.attrList[index].attrId}`;
                this.marketScreeningPopUp.cardAttrTogs.push(tog);
            } else if (this.param.data.subTypeList) {
                tog.node.name = `${this.param.data.subTypeList[index].nftSubType}`;
                this.marketScreeningPopUp.cardTypeTogs.push(tog);
            } else if (this.param.data.protoIdList) {
                tog.node.name = `${this.param.data.protoIdList[index].protoId}`;
                this.marketScreeningPopUp.cardTogs.push(tog);
            }
        }
    }

    checkEvent(e: Event, customEventData: string) {
        this.scheduleOnce(() => {
            let toggle = e.currentTarget.getComponent(Toggle);
            if (this.isInit && this.param && this.param.type == MarketScreeningItemType.Single) {
                let idx = Number(toggle.name);
                this.infoBtns.forEach(e => e.isCheck = false);
                this.infoBtns[idx].isCheck = toggle.isChecked;

                if (this.param.data.attrList) {
                    this.marketScreeningPopUp.cardAttrClick(true);
                } else if (this.param.data.subTypeList) {
                    this.marketScreeningPopUp.cardTypeClick(true);
                } else if (this.param.data.protoIdList) {
                    this.marketScreeningPopUp.cardClick(true);
                }
            }
        }, 0);
    }
}

