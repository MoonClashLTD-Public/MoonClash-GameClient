import { PlatformUtil } from "./PlatformUtil";

class NativeUtils {
    /**
       
     */
    scanQRCode() {
        return new Promise((resolve: (value: string) => void, reject: (reason?: any) => void) => {
            let isCan = false;
            if (PlatformUtil.isNativeAndroid()) {
                jsb.reflection.callStaticMethod("com/cocos/game/NativeUtil", "scanQrCode", "()V");
                isCan = true;
            } else {
                resolve("");
            }
            if (isCan) {
                window["scanQrCodeCallBack"] = (str: string) => {
                    resolve(str == "null" ? "" : str);
                }
            }
        });
    }

    /**
       
  
     */
    getVersionCode() {
        let versionCode = -1;
        if (PlatformUtil.isNativeAndroid()) {
            versionCode = jsb.reflection.callStaticMethod("com/cocos/game/NativeUtil", "getPackageVersionCode", "()I");
        }
        return versionCode;
    }

    /**
       
     */
    getChannelId() {
        let cid = -1;
        if (PlatformUtil.isNativeAndroid()) {
            cid = jsb.reflection.callStaticMethod("com/cocos/game/NativeUtil", "getChannelId", "()I");
        }
        return cid;
    }
}
export let NativeUtil = new NativeUtils()
