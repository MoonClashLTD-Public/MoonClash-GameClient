/*
 * @Author: dgflash
 * @Date: 2021-07-03 16:13:17
 * @LastEditors: dgflash
 * @LastEditTime: 2022-04-14 18:27:49
 */

import { Node, tween, Vec3 } from "cc";
import { UIID } from "../../../game/common/config/GameUIConfig";
import { HomeLoadingConfig } from "../../../game/common/pop/NetLoadingMask";
import { oops } from "../../Oops";
import { PopViewParams } from "../layer/Defines";

  
class TipsManager {
    private _timeId = ""
      
    public networkRecovery() {
        if (this._timeId) {
            oops.timer.unschedule(this._timeId);
            this._timeId = "";
        }
        oops.gui.remove(UIID.Netinstable);
    }
      
    public async netInstableOpen() {
        if (!oops.gui.has(UIID.Netinstable)) {
            await oops.gui.openAsync(UIID.Netinstable);
        }
    }
    public netInstableClose() {
        if (oops.gui.has(UIID.Netinstable)) {
            oops.gui.remove(UIID.Netinstable, false);
        }
    }
      
    public networkLatency(time: number) {
        if (this._timeId) {
            oops.timer.unschedule(this._timeId);
        }
        this._timeId = oops.timer.scheduleOnce(this.netInstableOpen, time);
    }


    private _loadingMaskCount = 0;
      
    async showLoadingMask() {
        this._loadingMaskCount++;
        if (!oops.gui.has(UIID.LoadingMask)) {
            await oops.gui.openAsync(UIID.LoadingMask);
        }
    }

      
    hideLoadingMask(isForce: boolean = false) {
        this._loadingMaskCount--;
        if (this._loadingMaskCount <= 0 || isForce) {
            this._loadingMaskCount = 0;
            oops.gui.remove(UIID.LoadingMask, false);
        }
    }

      
    showNetLoadigMask<T>(cfg?: HomeLoadingConfig<T>, onAdded?: Function): Promise<T> {
        return new Promise<T>(async (resolve: (value: T) => void) => {
            cfg = cfg ?? {};
            if (!cfg.cb) {
                cfg.cb = (data: T) => {
                    resolve(data);
                }
            }
            await oops.gui.openAsync(UIID.NetLoadingMask, cfg || {});
            onAdded && onAdded();
        })
    }

    hideNetLoadigMask() {
        oops.gui.remove(UIID.NetLoadingMask)
    }


    public test(callback?: Function) {
        let operate: any = {
            title: 'common_prompt_title_sys',
            content: "common_prompt_content",
            okWord: 'common_prompt_ok',
            cancelWord: 'common_prompt_cancal',
            okFunc: () => {
                console.log("okFunc");
            },
            cancelFunc: () => {
                console.log("cancelFunc");
            },
            needCancel: true
        };
        oops.gui.open(UIID.Window, operate, this.getPopCommonEffect());
    }

    public alert(content: string, cb?: Function, title?: string, okWord?: string) {
        let operate: any = {
            title: title ? title : 'common_prompt_title_sys',
            content: content,
            okWord: okWord ? okWord : 'common_prompt_ok',
            okFunc: () => {
                cb && cb();
            },
            needCancel: false
        };
        oops.gui.open(UIID.Window, operate, tips.getPopCommonEffect());
    }

    public confirm(content: string, cb: Function, okWord: string = "common_prompt_ok") {
        let operate: any = {
            title: 'common_prompt_title_sys',
            content: content,
            okWord: okWord,
            cancelWord: 'common_prompt_cancal',
            okFunc: () => {
                cb && cb()
            },
            cancelFunc: () => {

            },
            needCancel: true
        };
        oops.gui.open(UIID.Window, operate, tips.getPopCommonEffect());
    }

    public async confirmAsync(args: {
        title?: string
        content: string,
        okWord?: string
        cancelWord?: string
        order?: boolean
    }) {
        return new Promise<boolean>((resolve, reject) => {
            const title = args?.title ?? 'common_prompt_title_sys'
            const okWord = args?.okWord ?? 'common_prompt_ok'
            const cancelWord = args?.cancelWord ?? 'common_prompt_cancal'
            let operate: any = {
                title: title,
                content: args.content,
                okWord: okWord,
                cancelWord: cancelWord,
                okFunc: () => resolve(true),
                cancelFunc: () => resolve(false),
                needCancel: true,
                order: args.order ?? true
            };
            oops.gui.open(UIID.Window, operate, tips.getPopCommonEffect());
        })
    }

      
    private getPopCommonEffect(callbacks?: PopViewParams) {
        let newCallbacks: PopViewParams = {
              
            onAdded: (node, params) => {
                node.setScale(0.1, 0.1, 0.1);

                tween(node)
                    .to(0.2, { scale: new Vec3(1, 1, 1) })
                    .start();
            },
              
            onBeforeRemove: (node, next) => {
                tween(node)
                    .to(0.2, { scale: new Vec3(0.1, 0.1, 0.1) })
                    .call(next)
                    .start();
            },
        }

        if (callbacks) {
            if (callbacks && callbacks.onAdded) {
                let onAdded = callbacks.onAdded;
                // @ts-ignore
                callbacks.onAdded = (node: Node, params: any) => {
                    onAdded(node, params);

                    // @ts-ignore
                    newCallbacks.onAdded(node, params);
                };
            }

            if (callbacks && callbacks.onBeforeRemove) {
                let onBeforeRemove = callbacks.onBeforeRemove;
                callbacks.onBeforeRemove = (node, params) => {
                    onBeforeRemove(node, params);

                    // @ts-ignore
                    newCallbacks.onBeforeRemove(node, params);
                };
            }
            return callbacks;
        }
        return newCallbacks;
    }

    public errorTip(msg: string, useI18n: boolean = false) {
        oops.gui.toast(`${msg}`, useI18n);
    }

    public okTip(param?: { msg: string, useI18n: boolean }) {
        const msg = param?.msg ?? 'tip_ok'
        const useI18n = param?.useI18n ?? true
        oops.gui.toast(`${msg}`, useI18n);
    }
}

export var tips = new TipsManager();