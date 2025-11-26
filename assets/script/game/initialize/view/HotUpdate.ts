/*
   
 */
import { Component, game, sys, _decorator } from "cc";
import { tips } from "../../../core/gui/prompt/TipsManager";
import { oops } from "../../../core/Oops";
import { CommonUtil } from "../../../core/utils/CommonUtil";
import { NativeUtil } from "../../../core/utils/NativeUtil";
import { config } from "../../common/config/Config";
import { UIID } from "../../common/config/GameUIConfig";
import TableUrls from "../../common/table/TableUrls";
import { Hot, HotOptions } from "./Hot";
import { LoadingViewComp } from "./LoadingViewComp";

const { ccclass, property } = _decorator;

  
@ccclass('HotUpdate')
export class HotUpdate extends Component {
      
    private hot = new Hot();
      
    private lv: LoadingViewComp = null!;

    onLoad() {
        // if (sys.isNative) {
        //     this.lv = this.getComponent(LoadingViewComp)!;
        //     this.lv.data.prompt = oops.language.getLangByID("update_tips_check_update");
        //     this.startHotUpdate();
        // }
    }

      
    async startHotUpdate() {
        if (!sys.isNative) return;
        this.lv = this.getComponent(LoadingViewComp)!;
        this.lv.data.prompt = oops.language.getLangByID("update_tips_check_update");

        let urls = TableUrls.getUrlsByType(core.UrlType.UrlRes).map(e => { return e.url });
        let maxUrl = await CommonUtil.getMaxSpeedUrl(urls);
        if (!maxUrl) {
            this.updatePreparationFailed(() => {
                // this.hot.init(options);
                game.restart();
            });
            return;
        };

        let options = new HotOptions();
        options.updeateUrl = maxUrl;
        options.onVersionInfo = (data: any) => {
              
            let ver = `${data.local}.${NativeUtil.getVersionCode()}`;
            config.game.ver = ver;
            config.game.hotVer = data.local;
            this.lv.data.ver = ver;
        };
        options.onUpdateProgress = (event: jsb.EventAssetsManager) => {
              
            let pc = event.getPercent();
            let _total = event.getTotalBytes();
            let _have = event.getDownloadedBytes();

            let total: string, have: string;
            if (_total < 1048576) {                                
                _total = Math.ceil(_total / 1024)
                total = _total + 'K'
            }
            else {                                                 
                total = (_total / (1024 * 1024)).toFixed(1);
                total = total + 'M'
            }

            if (_have < 1048576) {                                 
                _have = Math.ceil(_have / 1024)
                have = _have + 'K'
            }
            else {                                                 
                have = (_have / (1024 * 1024)).toFixed(1);
                have = have + 'M'
            }

            if (total == '0K') {
                this.lv.data.prompt = oops.language.getLangByID("update_tips_check_update");
            }
            else {
                this.lv.data.prompt = oops.language.getLangByID("update_tips_update") + have + '/' + total + ' (' + parseInt(pc * 100 + "") + '%)';
            }

              
            if (!isNaN(event.getPercent())) {
                this.lv.data.finished = event.getDownloadedFiles();
                this.lv.data.total = event.getTotalFiles();
                this.lv.data.progress = (event.getPercent() * 100).toFixed(2);
            }
        };
        options.onNeedToUpdate = (data: any, totalBytes: number) => {
            this.lv.data.prompt = oops.language.getLangByID("update_tips_new_version");
            let total: string = "";
            if (totalBytes < 1048576) {                                   
                totalBytes = Math.ceil(totalBytes / 1024);
                total = totalBytes + 'KB';
            }
            else {
                total = (totalBytes / (1024 * 1024)).toFixed(1);
                total = total + 'MB';
            }

              
            this.checkForceUpdate(() => {
                  
                this.showUpdateDialog(total, () => {
                    this.hot.hotUpdate();
                })
            });
        };
        options.onNoNeedToUpdate = () => {
            this.lv.enter();
        };
        options.onUpdateFailed = () => {
            this.lv.data.prompt = oops.language.getLangByID("update_tips_update_fail");
            // this.hot.checkUpdate();
            this.updatePreparationFailed(() => {
                game.restart();
            });
        };
        options.onUpdateSucceed = () => {
            this.lv.data.progress = `${100} `;
            this.lv.data.prompt = oops.language.getLangByID("update_tips_update_success");

            setTimeout(() => {
                game.restart();
            }, 1000);
        };
        options.onError = () => {
            this.updatePreparationFailed(() => {
                // this.hot.init(options);
                game.restart();
            });
        }
        this.hot.init(options);
    }

      
    private checkForceUpdate(callback: Function) {
        if (true) {   
            setTimeout(() => {
                // this.hot.clearHotUpdateStorage();
                callback();
            }, 10)
            return;
        }

        let operate: any = {
            title: 'common_prompt_title_sys',
            content: "update_tips_force",
            okWord: 'common_prompt_ok',
            cancelWord: 'common_prompt_cancal',
            okFunc: () => {
                // this.hot.clearHotUpdateStorage();
                callback();
            },
            cancelFunc: () => {
                game.end();
            },
            needCancel: true
        };
        oops.gui.open(UIID.Window, operate);
    }

      
    private updatePreparationFailed(callback: Function) {
        let operate: any = {
            title: 'common_prompt_title_sys',
            content: "update_tips_err",
            okWord: 'update_btn_retry',
            okFunc: () => {
                this.hot.clearHotUpdateStorage();
                callback();
            },
            cancelFunc: () => {
                game.end();
            },
            needCancel: false
        };
        oops.gui.open(UIID.Window, operate);
    }

      
    private showUpdateDialog(size: string, callback: Function) {
        if (sys.getNetworkType() == sys.NetworkType.LAN) {
            callback();
            return;
        }
        tips.alert(oops.language.getLangByID("update_nowifi_tip") + size, callback);
    }

      
    static async checkUpdate() {
        if (!sys.isNative) return;

        if (!!!config.game.hotVer) { return };
        let urls = TableUrls.getUrlsByType(core.UrlType.UrlRes).map(e => { return e.url });
        let maxUrl = await CommonUtil.getMaxSpeedUrl(urls);
        if (maxUrl) {
            let remoteManifest = await Hot.getRemoteManifest(maxUrl);
            if (remoteManifest && Hot.versionCompareHandle(config.game.hotVer, remoteManifest.version) < 0) {
                let operate: any = {
                    title: 'common_prompt_title_sys',
                    content: "update_tips_force",
                    okWord: 'common_prompt_ok',
                    cancelWord: 'common_prompt_cancal',
                    okFunc: () => {
                        game.restart();
                    },
                    cancelFunc: () => {
                        game.end();
                    },
                    needCancel: false
                };
                oops.gui.open(UIID.Window, operate);
            }
        }
    }
}