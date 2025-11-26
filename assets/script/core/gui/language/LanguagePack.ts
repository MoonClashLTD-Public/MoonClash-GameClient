/*
 * @Author: dgflash
 * @Date: 2021-07-03 16:13:17
 * @LastEditors: dgflash
 * @LastEditTime: 2022-03-11 17:15:42
 */
import { Asset, assetManager, director, error, JsonAsset, warn } from "cc";
import { EDITOR } from "cc/env";
import { resLoader } from "../../common/loader/ResLoader";
import { Logger } from "../../common/log/Logger";
import { LanguageData } from "./LanguageData";
import { LanguageLabel } from "./LanguageLabel";
import { LanguageSprite } from "./LanguageSprite";

export class LanguagePack {
      
    private _langjsonPath: string = "language/json";
    private _langTexturePath: string = "language/texture";

    /**
       
  
  
     */
    public setAssetsPath(langjsonPath: string, langTexturePath: string) {
        if (langjsonPath) {
            this._langjsonPath = langjsonPath;
        }
        if (langTexturePath) {
            this._langTexturePath = langTexturePath;
        }
    }

    /**
       
     * @param lang 
     */
    public updateLanguage(lang: string, json: JsonAsset) {
        let lanjson: any = json || resLoader.get(`${this._langjsonPath}/${lang}`, JsonAsset);
        if (lanjson && lanjson.json) {
            LanguageData.data = lanjson.json;
            let rootNodes = director.getScene()!.children;
            for (let i = 0; i < rootNodes.length; ++i) {
                  
                let languagelabels = rootNodes[i].getComponentsInChildren(LanguageLabel);
                for (let j = 0; j < languagelabels.length; j++) {
                    languagelabels[j].language();
                }
                  
                let languagesprites = rootNodes[i].getComponentsInChildren(LanguageSprite);
                for (let j = 0; j < languagesprites.length; j++) {
                    languagesprites[j].language();
                }
            }
        }
        else {
            warn("", lang);
        }
    }

    /**
       
  
  
     */
    public loadLanguageAssets(lang: string, callback: Function) {
        let lang_texture_path = `${this._langTexturePath}/${lang}`;
        let lang_json_path = `${this._langjsonPath}/${lang}`;
        resLoader.loadDir(lang_texture_path, (err: any) => {
            if (err) {
                error(err);
                callback(err);
                return;
            }
            Logger.logConfig(lang_texture_path, "textures");
            if (EDITOR) {
                Editor.Message.request("asset-db", "query-uuid", `db://assets/resources/${lang_json_path}.json`).then(uuid => {
                    if (!uuid) {
                        error(uuid);
                        callback(uuid);
                        return;
                    }
                    assetManager.loadAny(uuid, (err: Error, data: Asset) => {
                        if (err) {
                            error(err);
                            callback(err);
                            return;
                        }
                        Logger.logConfig(lang_json_path, " json ");
                        callback(err, lang, data);
                    })
                })
            } else {
                resLoader.load(lang_json_path, JsonAsset, (err: Error | null) => {
                    if (err) {
                        error(err);
                        callback(err);
                        return;
                    }
                    Logger.logConfig(lang_json_path, " json ");
                    callback(err, lang);
                })
            }
        })
    }
    /**
       
     * @param lang 
     */
    public releaseLanguageAssets(lang: string) {
        let langpath = `${this._langTexturePath}/${lang}`;
        resLoader.releaseDir(langpath);
        Logger.logBusiness(langpath, "");

        let langjsonpath = `${this._langjsonPath}/${lang}`;
        resLoader.release(langjsonpath);
        Logger.logBusiness(langjsonpath, "");
    }
}