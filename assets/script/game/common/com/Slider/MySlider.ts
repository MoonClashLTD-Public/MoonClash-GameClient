import { _decorator, Component, Label, Slider, UITransform } from 'cc';
import { CommonUtil } from '../../../../core/utils/CommonUtil';
const { ccclass, property } = _decorator;

@ccclass('MySlider')
export class MySlider extends Component {
    @property(Label)
    private showLabel: Label = null;
    @property(Slider)
    private slider: Slider = null;
    @property(UITransform)
    private greyBg: UITransform = null
    private cb: MySliderListener;
    private startNum = 1
    private numLen = 9
      
    private minProgressPer = 0
    private defGreyBgW = 0

    onLoad() {
        this.defGreyBgW = this.greyBg.width
    }

    async upData(params?: IMySlider) {
        this.cb = params?.progress
        let minV = params?.minPower ?? 0
        if (minV < 0) minV = 0
        const mProgressPer = minV / this.numLen
          
        this.minProgressPer = mProgressPer > 1 ? 1 : mProgressPer
          
        const mGreyBgPer = minV / 11
        this.greyBg.width = (mGreyBgPer > 1 ? 1 : mGreyBgPer) * this.defGreyBgW + 13
        this.slider.progress = this.minProgressPer
        // await CommonUtil.waitCmpt(this, 0)
        this.cb && this.cb(this.getCurNum());
    }

    private slideEvent(slider: Slider, customEventData: string) {
        let num = 1 / this.numLen * 100;   
        let currPogress = Math.round(Math.round(slider.progress * 100 / num) * num) / 100;
        if (currPogress < this.minProgressPer) {
            currPogress = this.minProgressPer
        }
        slider.progress = currPogress
        this.cb && this.cb(this.getCurNum());
    }

    setShowLabel(str: string) {
        this.showLabel.string = str;
    }

    getCurNum() {
        return Math.round(this.slider.progress * this.numLen) + this.startNum
    }
}
export type MySliderListener = (num: number) => void
export interface IMySlider {
      
    minPower?: number
    progress?: MySliderListener
}


