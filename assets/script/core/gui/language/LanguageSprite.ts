/*
 * @Author: dgflash
 * @Date: 2021-11-24 15:51:01
 * @LastEditors: dgflash
 * @LastEditTime: 2022-03-11 17:13:46
 */
import { CCString, Component, Size, Sprite, SpriteFrame, UITransform, _decorator } from "cc";
import { EDITOR } from "cc/env";
import { resLoader } from "../../common/loader/ResLoader";
import { Logger } from "../../common/log/Logger";
import { LanguageData } from "./LanguageData";

const { ccclass, property, menu } = _decorator;

@ccclass("LanguageSprite")
@menu('ui/language/LanguageSprite')
export class LanguageSprite extends Component {
    @property({ serializable: true })
    private _dataID: string = "";
    @property({ type: CCString, serializable: true })
    get dataID(): string {
        return this._dataID || "";
    }
    set dataID(value: string) {
        this._dataID = value;
        if (!EDITOR) {
            this.updateSprite();
        }
    }

    @property({
        tooltip: ""
    })
    private isRawSize: boolean = true;

    start() {
        this.updateSprite();
    }

      
    language() {
        this.updateSprite();
    }

    private updateSprite() {
          
        let path = `language/texture/${LanguageData.current}/${this.dataID}/spriteFrame`;
        let res: SpriteFrame | null = resLoader.get(path, SpriteFrame);
        if (!res) {
            Logger.erroring("[LanguageSprite]  " + path);
        }
        else {
            let spcomp: Sprite = this.getComponent(Sprite)!;
            spcomp.spriteFrame = res;

              
            if (this.isRawSize) {
                //@ts-ignore
                let rawSize = res._originalSize as Size;
                spcomp.getComponent(UITransform)?.setContentSize(rawSize);
            }
        }
    }

    // loadEditorSprite(path): Promise<SpriteFrame> {
    //     return new Promise((resolve, reject) => {
    //         Editor.Message.request("asset-db", "query-uuid", `db://assets/resources/${path}`).then(uuid => {
    //             if (!uuid) {
    //                 resolve(null);
    //                 return;
    //             }
    //             console.log(uuid)
    //             console.log(path)
    //             assetManager.loadAny({ 'uuid': uuid, "bundle": "resources" }, (err, data) => {

    //                 console.log(err, data);
    //                 resolve(data);

    //             });
    //             // assetManager.loadAny({ uuid: uuid }, (err: Error, texture: ImageAsset) => {
    //             //     if (err) {
    //             //         return;
    //             //     }
    //             //     // console.table(texture)
    //             //     console.log("uuidxxx", texture._uuid)
    //             //     // console.log(SpriteFrame)
    //             //     // Logger.table(SpriteFrame);
    //             //     // console.log(SpriteFrame.name)
    //             //     // let spriteFrame = new SpriteFrame()
    //             //     let spriteFrame = SpriteFrame.createWithImage(texture)
    //             //     console.table(spriteFrame)
    //             //     // spriteFrame.texture = texture;
    //             //     // spriteFrame.initDefault(texture._uuid);
    //             //     // spriteFrame.;
    //             //     // spriteFrame.texture = texture;
    //             //     resolve(spriteFrame);
    //             // })
    //         })
    //     })
    // }
}