import { error, JsonAsset, warn } from "cc";
import { EDITOR } from "cc/env";
import { EventDispatcher } from "../../common/event/EventDispatcher";
import { Logger } from "../../common/log/Logger";
import { LanguageData, Languages } from "./LanguageData";
import { LanguagePack } from "./LanguagePack";

export enum LanguageEvent {
      
    CHANGE = 'LanguageEvent.CHANGE',
      
    RELEASE_RES = "LanguageEvent.RELEASE_RES"
}

const DEFAULT_LANGUAGE = Languages.EN;

export class LanguageManager extends EventDispatcher {
    private static _instance: LanguageManager;
    public static get instance(): LanguageManager {
        if (this._instance == null) {
            this._instance = new LanguageManager();
        }
        return this._instance;
    }

    private _init: boolean = false;
    private _support: Array<string> = [Languages.ZH, Languages.EN, Languages.KO];          
    private _languagePack: LanguagePack = new LanguagePack();      

      
    public set supportLanguages(supportLanguages: Array<string>) {
        this._support = supportLanguages;
    }

    /**
       
     */
    public get current(): string {
        return LanguageData.current;
    }

    /**
       
     */
    public get languages(): string[] {
        return this._support;
    }

    public isExist(lang: string): boolean {
        return this.languages.indexOf(lang) > -1;
    }

    /**
       
     */
    public getNextLang(): string {
        let supportLangs = this.languages;
        let index = supportLangs.indexOf(LanguageData.current);
        let newLanguage = supportLangs[(index + 1) % supportLangs.length];
        return newLanguage;
    }

    /**
       
  
  
     */
    public init(forced: boolean = false, cb?: Function) {
        if (this._init && forced == false) {
            return;
        }
        this._init = true;
        LanguageData.current = '';
        this.setLanguage(DEFAULT_LANGUAGE, () => { cb && cb() });
    }

    /**
       
     * @param language 
     */
    public setLanguage(language: string, callback: (success: boolean) => void) {
        if (!language) {
            language = DEFAULT_LANGUAGE;
        }
        language = language.toLowerCase();
        let index = this.languages.indexOf(language);
        if (index < 0) {
            
            language = DEFAULT_LANGUAGE;
        }
        if (language === LanguageData.current) {
            callback(false);
            return;
        }

        Logger.logConfig(`${language}`);
        LanguageData.current = language;

        this.loadLanguageAssets(language, (err: any, lang: string, json: JsonAsset) => {
            if (err) {
                error("", err);
                callback(false);
                return;
            }
            this._languagePack.updateLanguage(language, json);
            this.dispatchEvent(LanguageEvent.CHANGE, lang);
            callback(true);
        });
    }

    /**
       
  
  
     */
    public setAssetsPath(langjsonPath: string, langTexturePath: string) {
        this._languagePack.setAssetsPath(langjsonPath, langTexturePath);
    }

    /**
       
     * @param labId 
     * @param arr 
     */
    public getLangByID(labId: string): string {
        return LanguageData.getLangByID(labId);
    }

    /**
       
       
     * @param lang 
     * @param callback 
     */
    public loadLanguageAssets(lang: string, callback: Function) {
        lang = lang.toLowerCase();
        return this._languagePack.loadLanguageAssets(lang, callback);
    }

    /**
       
     * @param lang 
     */
    public releaseLanguageAssets(lang: string) {
        lang = lang.toLowerCase();
        this._languagePack.releaseLanguageAssets(lang);
        this.dispatchEvent(LanguageEvent.RELEASE_RES, lang);
    }
}