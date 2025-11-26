import { _decorator, Component, CCString } from 'cc';
import { LanguageLabel } from '../../../core/gui/language/LanguageLabel';
const { ccclass, property } = _decorator;

@ccclass('HomeTopTitle')
export class HomeTopTitle extends Component {
    @property(LanguageLabel)
    titleLb: LanguageLabel = null;
    @property({
        type: CCString,
        tooltip: "",
    })
    get dataID() {
        return this._dataID;
    }
    set dataID(val: string) {
        this._dataID = val;
        this.setTitle();
    }
    @property({
        type: CCString,
        tooltip: "",
        visible: false
    })
    _dataID: string = null

    private setTitle() {
        if (this._dataID != null && this._dataID) {
            if (this.titleLb) {
                this.titleLb.dataID = this._dataID || ''
                // this.titleLb.updateLabel()
            }
        }
    }
}

