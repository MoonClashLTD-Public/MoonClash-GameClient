import { warn, _decorator } from "cc";
import TableLanguages from "../../../game/common/table/TableLanguags";
import { LangLabelParamsItem } from "./LanguageLabel";
const { ccclass, property } = _decorator;

export enum Languages {
      
    EN = "en",
      
    ZH = "zh",
      
    KO = "ko",
}

export class LanguageData {
      
    static current: Languages | string;
      
    static data: { [key: string]: string } = {}
    public static getLangByID(labId: string): string {
        return TableLanguages.getI18Value(this.current, labId) || LanguageData.data[labId] || labId;
    }

    public static getLangByIDAndParams(_dataID: string, params: LangLabelParamsItem[]) {
        let _string = this.getLangByID(_dataID);
        if (_string && params.length > 0) {
            params.forEach((item: LangLabelParamsItem) => {
                _string = _string.replace(`%{${item.key}}`, item.value)
            })
        }
        if (!_string) {
            
            _string = _dataID;
        }
        return _string;
    }
}