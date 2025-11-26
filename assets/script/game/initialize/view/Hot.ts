import { error, log, path, sys } from "cc";
import { resLoader } from "../../../core/common/loader/ResLoader";
import { Logger } from "../../../core/common/log/Logger";
import { oops } from "../../../core/Oops";
import { PlatformUtil } from "../../../core/utils/PlatformUtil";

  
export class HotOptions {
      
    onVersionInfo: Function | null = null;
      
    onNeedToUpdate: Function | null = null;
      
    onNoNeedToUpdate: Function | null = null;
      
    onUpdateFailed: Function | null = null;
      
    onUpdateSucceed: Function | null = null;
      
    onUpdateProgress: Function | null = null;
      
    onError: Function | null = null;
      
    updeateUrl: string = '';
    check() {
        for (let key in this) {
            if (key !== 'check') {
                if (!this[key]) {

                    return false;
                }
            }
        }
        return true
    }
}

type Manifest = {
    packageUrl: string
    remoteManifestUrl: string
    remoteVersionUrl: string
    version: string
}

  
export class Hot {
    private assetsMgr: jsb.AssetsManager = null!;
    private options: HotOptions | null = null;
    private state = Hot.State.None;
    private storagePath: string = "";
    private manifest: string = "";

    static State = {
        None: 0,
        Check: 1,
        Update: 2,
    }

      
    async init(opt: HotOptions) {
        if (!sys.isNative) {
            return;
        }
        if (!opt.check()) {
            return;
        }
        this.options = opt;

        if (this.assetsMgr) {
            return;
        }

        let remoteManifest = await Hot.getRemoteManifest(opt.updeateUrl);
        if (!remoteManifest) {
            error("");
            opt.onError();
            return;
        }

        let tempPath = path.join(jsb.fileUtils.getWritablePath(), 'oops_framework_remote_temp');   
        if (jsb.fileUtils.isDirectoryExist(tempPath)) {
            jsb.fileUtils.removeDirectory(tempPath);
            jsb.fileUtils.removeDirectory(path.join(jsb.fileUtils.getWritablePath(), 'gamecaches'));
        }

        resLoader.load('project', (err: Error | null, res: any) => {
            if (err) {
                error("");
                opt.onError();
                return;
            }

            this.showSearchPath();

            this.manifest = res.nativeUrl;
            this.storagePath = path.join(jsb.fileUtils.getWritablePath(), 'oops_framework_remote');

            this.manifest = this.handleManifestFile(opt.updeateUrl, remoteManifest, res._file);   
            if (!this.manifest) {
                error("");
                opt.onError();
                return;
            }

            this.assetsMgr = new jsb.AssetsManager(this.manifest, this.storagePath, (versionA, versionB) => {

                this.options?.onVersionInfo && this.options.onVersionInfo({ local: versionA, server: versionB });

                let vA = versionA.split('.');
                let vB = versionB.split('.');
                for (let i = 0; i < vA.length; ++i) {
                    let a = parseInt(vA[i]);
                    let b = parseInt(vB[i] || '0');
                    if (a !== b) {
                        return a - b;
                    }
                }

                if (vB.length > vA.length) {
                    return -1;
                }
                else {
                    return 0;
                }
            });

              
            this.assetsMgr.setVerifyCallback((path: string, asset: jsb.ManifestAsset) => {
                  
                var compressed = asset.compressed;
                  
                var expectedMD5 = asset.md5;
                  
                var relativePath = asset.path;
                  
                var size = asset.size;

                return true;
            });

            var localManifest = this.assetsMgr.getLocalManifest();






            this.checkUpdate();
        });
    }

    static versionCompareHandle(local: string, server: string) {
        let vA = local.split('.');
        let vB = server.split('.');
        for (let i = 0; i < vA.length; ++i) {
            let a = parseInt(vA[i]);
            let b = parseInt(vB[i] || '0');
            if (a !== b) {
                return a - b;
            }
        }

        if (vB.length > vA.length) {
            return -1;
        }
        else {
            return 0;
        }
    }

    static async getRemoteManifest(updeateUrl: string) {
        let platform = PlatformUtil.getPlateform();
        let versionUrl = path.join(updeateUrl, platform, 'version.manifest');
        return await oops.http.getAsync(versionUrl).catch(() => { }) as Manifest;
    }

      
    handleManifestFile(url: string, remoteManifest: Manifest, fileString: string) {
        let storagePath = this.storagePath;
        let modifyUrl = (fileName: string) => {
            let filePath = storagePath + '/' + fileName;
            // let fileString = jsb.fileUtils.getStringFromFile(filePath);
            if (!jsb.fileUtils.isDirectoryExist(storagePath)) {
                let isSucc = jsb.fileUtils.createDirectory(storagePath)
                if (!isSucc) return null;
            }
            let obj: Manifest = JSON.parse(fileString);
            if (remoteManifest.packageUrl.startsWith('http')) {   
                obj.packageUrl = `${remoteManifest.packageUrl}`;
                obj.remoteManifestUrl = `${remoteManifest.remoteManifestUrl}`;
                obj.remoteVersionUrl = `${remoteManifest.remoteVersionUrl}`;
            } else {
                obj.packageUrl = `${url}${remoteManifest.packageUrl}`;
                obj.remoteManifestUrl = `${url}${remoteManifest.remoteManifestUrl}`;
                obj.remoteVersionUrl = `${url}${remoteManifest.remoteVersionUrl}`;
            }
            let afterString = JSON.stringify(obj);
            let isWrite = jsb.fileUtils.writeStringToFile(afterString, filePath)
            return isWrite ? filePath : null;
        }
        return modifyUrl('project.manifest');
        // modifyUrl('version.manifest');
    }

      
    clearHotUpdateStorage() {
        jsb.fileUtils.removeDirectory(this.storagePath);
    }

      
    checkUpdate() {
        if (!this.assetsMgr) {
            return;
        }

        if (this.assetsMgr.getState() === jsb.AssetsManager.State.UNINITED) {
            return;
        }
        if (!this.assetsMgr.getLocalManifest().isLoaded()) {

            return;
        }
        this.assetsMgr.setEventCallback(this.onHotUpdateCallBack.bind(this));
        this.state = Hot.State.Check;
          
        this.assetsMgr.checkUpdate();
    }

      
    hotUpdate() {
        if (!this.assetsMgr) {

            return
        }
        this.assetsMgr.setEventCallback(this.onHotUpdateCallBack.bind(this));
        this.state = Hot.State.Update;
        this.assetsMgr.update();
    }

    private onHotUpdateCallBack(event: jsb.EventAssetsManager) {
        let code = event.getEventCode();
        switch (code) {
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:

                this.options?.onNoNeedToUpdate && this.options.onNoNeedToUpdate(code)
                break;
            case jsb.EventAssetsManager.NEW_VERSION_FOUND:

                this.options?.onNeedToUpdate && this.options.onNeedToUpdate(code, this.assetsMgr!.getTotalBytes());
                break;
            case jsb.EventAssetsManager.ASSET_UPDATED:

                break;
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                if (this.state === Hot.State.Update) {
                    // event.getPercent();
                    // event.getPercentByFile();
                    // event.getDownloadedFiles() + ' / ' + event.getTotalFiles();
                    // event.getDownloadedBytes() + ' / ' + event.getTotalBytes();

                    this.options?.onUpdateProgress && this.options.onUpdateProgress(event);
                }
                break;
            case jsb.EventAssetsManager.UPDATE_FINISHED:
                this.onUpdateFinished();
                break;
            default:
                this.onUpdateFailed(code);
                break;
        }
    }

    private onUpdateFailed(code: any) {
        this.assetsMgr.setEventCallback(null!)
        this.options?.onUpdateFailed && this.options.onUpdateFailed(code);
    }

    private onUpdateFinished() {
        this.assetsMgr.setEventCallback(null!);
        let searchPaths = jsb.fileUtils.getSearchPaths();
        let newPaths = this.assetsMgr.getLocalManifest().getSearchPaths();
        Array.prototype.unshift.apply(searchPaths, newPaths);
        localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));
        jsb.fileUtils.setSearchPaths(searchPaths);


        this.options?.onUpdateSucceed && this.options.onUpdateSucceed();
    }

    private showSearchPath() {

        let searchPaths = jsb.fileUtils.getSearchPaths();
        for (let i = 0; i < searchPaths.length; i++) {

        }

    }
}