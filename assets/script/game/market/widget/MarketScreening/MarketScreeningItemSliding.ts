import { _decorator, Component, Slider, log, find, SpriteFrame, Sprite, Node, instantiate, Layout, v3, Toggle, Label } from 'cc';
import { MarketScreeningConf, MarketScreeningItemParam, MarketScreeningPopUp, } from '../../MarketScreeningPopUp';
import { MarketScreeningItem } from './MarketScreeningItem';
const { ccclass, property, type } = _decorator;

@ccclass('MarketScreeningItemSliding')
export class MarketScreeningItemSliding extends Component {
    get item() {
        return this.node.getComponent(MarketScreeningItem);
    }
    param: MarketScreeningConf = null;
    eachNum: number = 0;   
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
        // this._init(param.data);
        this._newinit(param.data);
        this.isInit = true;
    }

    _newinit(data: MarketScreeningItemParam) {
        let levelNode = find('levelNode', this.node);
        let toggleNode = levelNode.getChildByName('toggleNode');
        if (data.level) {
            for (let index = 0; index < toggleNode.children.length; index++) {
                let tog = toggleNode.children[index].getComponent(Toggle);
                tog.node.getComponentInChildren(Label).string = `${index + 1}`;
                tog.checkEvents[0].customEventData = `${index + 1}`;
                let isCheck = this.param.data.level.selNum.findIndex(v => v == index + 1) != -1;
                tog.isChecked = isCheck;
            }
        }
        levelNode.active = !!data.level;
    }

    checkEvent(tog: Toggle, customEventData: string) {
        if (this.isInit) {
            let level = Number(customEventData);
            this.param.data.level.selNum = [level];
        }
    }

      
    // _init(data: MarketScreeningItemParam) {
    //     let levelNode = find('levelNode', this.node);
    //     if (data.level) {
    //         levelNode.active = true;
    //         this.eachNum = 100 / this.param.data.level.num;
    //         let slider = find('levelNode/Slider', this.node).getComponent(Slider);
    //         slider.progress = data.level.selNum * this.eachNum / 100;
    //         this.sliderEvent(slider, '');
    //     } else {
    //         levelNode.active = false;
    //     }
    // }

    // sliderEvent(slider: Slider, customEventData: string) {
      
    //     slider.progress = Math.round(Math.round(slider.progress * 100 / num) * num) / 100;
    //     let idx = Math.floor(slider.progress * 100 / num);
    //     let xx = find('levelNode/Layout-001', this.node);
    //     for (let index = 0; index < xx.children.length; index++) {
    //         xx.children[index].getComponent(Sprite).enabled = index > idx;
    //     }
    //     // let level = idx;
    //     this.param.data.level.selNum = idx;
    // }
}

