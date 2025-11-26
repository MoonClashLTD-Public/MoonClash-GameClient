
import { storage } from "../../../core/common/storage/StorageManager";
import { JsonUtil } from "../../../core/utils/JsonUtil";
import { STORAGE_ENUM } from "../../homeUI/HomeEvent";
import { netConfig } from "../net/NetConfig";

export class UrlsCfg {
    /**id */
    url = '';
    url_type = core.UrlType.UrlNone;
    bs_id = 0;
    channel = 0;
}

class TableUrls {
    TableName: string = "urls";
    private _data: UrlsCfg[];

    init() {
        if (!this._data) {
            this._data = JsonUtil.get(this.TableName) as UrlsCfg[];
            for (let index = 0; index < this._data.length; index++) {
                this._data[index] = Object.assign(new UrlsCfg(), this._data[index]);
            }

            let saveData = storage.get(STORAGE_ENUM.urlsConfig, []);
            this._data = this._data.concat(saveData);
        }
    }
    // get cfg(): UrlsCfg[] {
    //     return this._data;
    // }

    getUrlsByType(type: core.UrlType): UrlsCfg[] {
        return this._data.filter((v) => {
            if (v && v.url.endsWith("/")) {
                v.url = v.url.substring(0, v.url.length - 1);
            }
            return v.url_type == type && v.channel == netConfig.channelid;
        });
    }

    upd(res: cfg.GetUrlConfigsResp) {
        let bf = false;
        let saveData: UrlsCfg[] = [];
        for (const d of res.urls) {
            let idx = this._data.findIndex(v => v.url == d.url && v.bs_id == d.bsId && v.url_type == d.urlType);
            if (idx == -1) {
                bf = true;
                saveData.push({
                    url: d.url,
                    url_type: d.urlType,
                    bs_id: d.bsId,
                    channel: netConfig.channelid,
                });
            }
        }
        if (bf) {
            storage.set(STORAGE_ENUM.urlsConfig, saveData);
        }
    }
}

export default new TableUrls();