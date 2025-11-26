import { _decorator, Component, log, Label, Toggle } from 'cc';
import { storage } from '../../../core/common/storage/StorageManager';
import { STORAGE_ENUM } from '../../homeUI/HomeEvent';

const { ccclass, property } = _decorator;
@ccclass('SaveAcctToggle')
export class SaveAcctToggle extends Component {
    @property(Toggle)
    private toogle: Toggle = null
    
    start() {
        this.toogle.isChecked = storage.get(STORAGE_ENUM.saveAccPwd, false)
    }

    toogleChange() {
        if (!this.toogle) return
        storage.set(STORAGE_ENUM.saveAccPwd, this.toogle.isChecked)
    }
}


