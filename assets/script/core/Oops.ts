/*
 * @Author: dgflash
 * @Date: 2022-02-11 09:32:47
 * @LastEditors: dgflash
 * @LastEditTime: 2022-05-09 09:42:22
 */
import { dynamicAtlasManager, Layers, Layout, Node, ScrollView, Size, Sprite, SpriteFrame, UITransform, Vec3, view } from "cc";
import { AudioManager } from "./common/audio/AudioManager";
import { TimerManager } from "./common/manager/TimerManager";
import { storage } from "./common/storage/StorageManager";
import { GameManager } from "./game/GameManager";
import { LanguageManager } from "./gui/language/Language";
import { LayerManager } from "./gui/layer/LayerManager";
import { ECSRootSystem } from "./libs/ecs/ECSSystem";
import { HttpRequest } from "./network/HttpRequest";

  
export var version: string = "1.0.5";

export class oops {
    /** ECS */
    static ecs: ECSRootSystem;
      
    static language: LanguageManager;
      
    static timer: TimerManager;
      
    static audio: AudioManager;
      
    static gui: LayerManager;
      
    static game: GameManager;
    /** HTTP */
    static http: HttpRequest;
      
    static storage = storage;

    static showDynamicAtlaDebug() {
        let scNode = new Node('dynamicAtla');
        let scCom = scNode.addComponent(ScrollView)
        let uiTracom = scNode.getComponent(UITransform);
        uiTracom.setContentSize(new Size(view.getVisibleSize().width, view.getVisibleSize().height));
        let content = new Node('CONTENT');
        let layout = content.addComponent(Layout);
        content.parent = scNode;
        content.getComponent(UITransform).anchorY = 1;
        content.getComponent(UITransform).setContentSize(new Size(2048, 2048));
        layout.resizeMode = Layout.ResizeMode.CONTAINER;
        layout.type = Layout.Type.VERTICAL;
        //@ts-ignore
        let data = dynamicAtlasManager._atlases;
        let length = dynamicAtlasManager.atlasCount;
        scCom.content = content;
        scCom.horizontal = true;
        scCom.vertical = true;
        scNode.layer = Layers.Enum.UI_2D;
        for (let index = 0; index < length; index++) {
            let item = new Node('atlas');
            let sp = item.addComponent(Sprite);
            item.layer = Layers.Enum.UI_2D;
            let sprFra = new SpriteFrame();
            sprFra.texture = data[index]._texture;
            sp.spriteFrame = sprFra;
            content.addChild(item);
            // find('Canvas').addChild(scNode);
            oops.gui.root.addChild(scNode);
            scNode.setPosition(new Vec3(0, 0, 0))
        }
    }
}