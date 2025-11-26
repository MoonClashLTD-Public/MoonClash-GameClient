import { _decorator, Component, Node, Button, find } from 'cc';
import { LanguageManager } from '../../core/gui/language/Language';
import { LanguageLabel } from '../../core/gui/language/LanguageLabel';
import List from '../../core/gui/list/List';
import { oops } from '../../core/Oops';
import { config } from '../common/config/Config';
const { ccclass, property, type } = _decorator;

enum storageEnum {
    music = "music",
    sound = "sound",
    language = "language",
}

@ccclass('SettingLangPopUp')
export class SettingLangPopUp extends Component {
    @type(List)
    list: List = null;
    start() {

    }

    update(deltaTime: number) {

    }

    onAdded() {
        // this.list.numItems = config.game.language.length;
        // let lang = oops.storage.get(storageEnum.language, 'en');
        // this.list.selectedId = config.game.language.indexOf(lang);
    }

    selectedEvent(item: Node, idx: number) {
        // let lang = config.game.language[idx];
        // oops.storage.set(storageEnum.language, lang);
        // LanguageManager.instance.setLanguage(lang, () => { });
    }
    renderEvent(item: Node, idx: number) {
        // let lang = config.game.language[idx];
        // find("/Label", item).getComponent(LanguageLabel).dataID = `setting_${lang}`;
    }

    closeClick() {
        // oops.gui.removeByNode(this.node, true);
    }
}

