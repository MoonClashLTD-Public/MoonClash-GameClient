import { _decorator, Component, Slider, log, find, SpriteFrame, Sprite, Node, instantiate, Layout, v3, Toggle, Label, UITransform, NodeEventType, EventTouch, Input } from 'cc';
import { ResManger } from '../../../data/resManger';
import { MarketScreeningConf, MarketScreeningItemParam, MarketScreeningPopUp, } from '../../MarketScreeningPopUp';
import { MarketScreeningItem } from './MarketScreeningItem';
const { ccclass, property, type } = _decorator;

@ccclass('MarketScreeningItemRangeSliding')
export class MarketScreeningItemRangeSliding extends Component {
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

    async _newinit(data: MarketScreeningItemParam) {
        let rangeSliderNode = find('rangeSlider', this.node);
        let toggleNode = rangeSliderNode.getChildByName('Toggle');
        if (data.rangeSlider) {
            toggleNode.getComponent(Toggle).isChecked = data.rangeSlider.isCheck;
        }

        let minLbl = find("tiaodi/minLbl", rangeSliderNode).getComponent(Label);
        let maxLbl = find("tiaodi/maxLbl", rangeSliderNode).getComponent(Label);
        minLbl.string = `${data.rangeSlider.min}`;
        maxLbl.string = `${data.rangeSlider.max}`;
        this.updInfo(data.rangeSlider.selMin - this.param.data.rangeSlider.min, data.rangeSlider.selMax - this.param.data.rangeSlider.min);
        rangeSliderNode.active = !!data.rangeSlider;

        let icon = find("iconBg/icon", rangeSliderNode).getComponent(Sprite);
        icon.spriteFrame = await ResManger.getInstance().getCardAttr1SpriteFrame(data.rangeSlider.icon);

        let numNode1 = find("tiaodi/touchNode0", rangeSliderNode);
        let numNode2 = find("tiaodi/touchNode1", rangeSliderNode);
        numNode1.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        numNode2.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        numNode1.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        numNode2.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    checkEvent(tog: Toggle, customEventData: string) {
        if (this.isInit) {
            this.param.data.rangeSlider.isCheck = tog.isChecked;
        }
    }

    updInfo(num1: number, num2: number) {
        let node = find('rangeSlider', this.node);
        let tiao = find("tiaodi/tiao", node).getComponent(UITransform);
        let numNode1 = find("tiaodi/touchNode0", node);
        let numNode2 = find("tiaodi/touchNode1", node);
        let numLbl1 = find("tiaodi/touchNode0/numLbl", node).getComponent(Label);
        let numLbl2 = find("tiaodi/touchNode1/numLbl", node).getComponent(Label);

        // let _num1 = Math.floor((num1 + this.param.data.rangeSlider.min) * 10) / 10;
        // let _num2 = Math.floor((num2 + this.param.data.rangeSlider.min) * 10) / 10;
        let _num1 = Math.floor(num1 + this.param.data.rangeSlider.min);
        let _num2 = Math.floor(num2 + this.param.data.rangeSlider.min);
        numLbl1.string = `${_num1}`;
        numLbl2.string = `${_num2}`;
        this.param.data.rangeSlider.selMin = _num1 > _num2 ? _num2 : _num1;
        this.param.data.rangeSlider.selMax = _num1 > _num2 ? _num1 : _num2;

        let max = this.getMax();
        let maxWidth = this.getMaxWidth();
        let posx1 = Math.abs(num1 / max * maxWidth);
        let posx2 = Math.abs(num2 / max * maxWidth);
        numNode1.setPosition(v3(posx1, numNode1.position.y, numNode1.position.z));
        numNode2.setPosition(v3(posx2, numNode2.position.y, numNode2.position.z));

        tiao.node.setPosition(v3(posx1 > posx2 ? posx2 : posx1, tiao.node.position.y, tiao.node.position.z));
        tiao.width = Math.abs(posx1 - posx2);
    }

    calcNum = 1000;   

    getMax() {
        let max = this.param.data.rangeSlider.max - this.param.data.rangeSlider.min;
        return max;
    }

    getMaxWidth() {
        let node = find('rangeSlider', this.node);
        let tiaodi = find("tiaodi", node).getComponent(UITransform);
        let w = tiaodi.width;
        return w;
    }

    private onTouchMove(e: EventTouch) {
        let max = this.getMax();
        let maxWidth = this.getMaxWidth();

        let node: Node = e.currentTarget;
        let x = node.parent.getComponent(UITransform).convertToNodeSpaceAR(v3(e.getUILocation().x, e.getUILocation().y, 0)).x;
        if (x < 0) x = 0;
        else if (x > maxWidth) x = maxWidth;
        node.setPosition(v3(x, node.position.y, node.position.z));

        let _node = find('rangeSlider', this.node);
        let numNode1 = find("tiaodi/touchNode0", _node);
        let numNode2 = find("tiaodi/touchNode1", _node);
        let num1 = numNode1.position.x / maxWidth * max;
        let num2 = numNode2.position.x / maxWidth * max;
        this.updInfo(num1, num2);
    }
}

