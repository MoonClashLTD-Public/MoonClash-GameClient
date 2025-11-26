import { _decorator, Component } from 'cc';
import { LanguageLabel } from '../../../../core/gui/language/LanguageLabel';
import { DefBottonCom } from '../DefBottonCom';
import { IMyEditBoxSendCode } from './MyEditBox';
const { ccclass, property } = _decorator;
@ccclass('MySmsCodeItem')
export class MySmsCodeItem extends Component {
    @property(LanguageLabel)
    private btnLb: LanguageLabel = null;
    @property(DefBottonCom)
    private nextBtn: DefBottonCom = null
    // @property(String)
    // private _btnName: string = 'register_btn_code';
    private _timer = 60
    private _num = 0
    private defBtnName = ''

    private listener: IMyEditBoxSendCode
    init(cc: IMyEditBoxSendCode) {
        this.defBtnName = this.btnLb.dataID
        if (cc?.autoCode) this.updBtnStatus()
        this.listener = cc
    }

    private updBtnStatus() {
        if (this.nextBtn.interactable) {
            this.nextBtn.setEnable(false)
            this._num = this._timer
            this.updTime()
            this.nextBtn.unscheduleAllCallbacks()
            this.nextBtn.schedule(() => this.updTime(), 1, this._num, 0)
        }
    }

    private updTime() {
        if (!this.nextBtn.interactable) {
            this._num--
            if (this._num < 1) {
                this.nextBtn.setEnable(true)
                this.btnLb.dataID = `${this.defBtnName}`;
                return;
            }
            this.btnLb.dataID = `${this._num}`;
        }
    }

    onDestroy() {
        this.nextBtn?.unscheduleAllCallbacks()
    }

    private async comfirm() {
        if (this.listener) {
            if (this.listener.canClick) {
                if (await this.listener.canClick()) {
                    this.listener.sendCode && this.listener.sendCode()
                    this.updBtnStatus()
                }
            } else {
                this.listener.sendCode && this.listener.sendCode()
                this.updBtnStatus()
            }
        }

        // const ok = AwsManger.getInstance().onRetrySMSCode()
        // if(ok) this.updBtnStatus()
    }


}



