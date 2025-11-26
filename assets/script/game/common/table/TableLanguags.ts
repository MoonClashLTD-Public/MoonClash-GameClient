
import { Languages } from "../../../core/gui/language/LanguageData";
import { JsonUtil } from "../../../core/utils/JsonUtil";

class TableLangCfg {
    key: string = '';
    value: string = '';
}

  
class TableLanguages {
    TableNames = ['en', 'zh', 'ko'];
    private _dataKV: { [key: string]: { [key: string]: TableLangCfg } } = {};
    init(lang: Languages | string) {
        if (!this._dataKV[lang]) {
            let table = JsonUtil.get(lang) as TableLangCfg[];
            if (table) {
                this._dataKV[lang] = {};
                for (const key in table)
                    this._dataKV[lang][table[key].key] = Object.assign(new TableLangCfg(), table[key]);
            }
        }
        return this._dataKV[lang];
    }
    getI18Value(lang: Languages | string, dataId: string) {
        this.init(lang);
        if (this._dataKV[lang])
            return this._dataKV[lang][dataId]?.value;
        else
            return null;
    }
}

export default new TableLanguages();