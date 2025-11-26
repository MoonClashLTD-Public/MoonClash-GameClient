/*
 * @Author: dgflash
 * @Date: 2021-07-03 16:13:17
 * @LastEditors: dgflash
 * @LastEditTime: 2022-05-12 12:00:29
 */
import { Component, director, game, Game, log, Node, view, _decorator } from "cc";
import { AudioManager } from "./common/audio/AudioManager";
import { EngineMessage } from "./common/event/EngineMessage";
import { Message } from "./common/event/MessageManager";
import { TimerManager } from "./common/manager/TimerManager";
import { GameManager } from "./game/GameManager";
import { GUI } from "./gui/GUI";
import { LanguageManager } from "./gui/language/Language";
import { LayerManager } from "./gui/layer/LayerManager";
import { HttpRequest } from "./network/HttpRequest";
import { oops, version } from "./Oops";

const { ccclass, property } = _decorator;

export class Root extends Component {
    @property({
        type: Node,
        tooltip: ""
    })
    game: Node | null = null;

    @property({
        type: Node,
        tooltip: ""
    })
    gui: Node | null = null;

    onLoad() {
        log(`oops-framework version:${version}`);

        this.init();
    }

    protected init() {
        oops.language = LanguageManager.instance;
        oops.timer = new TimerManager(this);
        oops.audio = AudioManager.instance;
        oops.http = new HttpRequest();
        oops.gui = new LayerManager(this.gui!);
        oops.game = new GameManager(this.game!);

          
        game.on(Game.EVENT_SHOW, () => {
            log("Game.EVENT_SHOW");
            oops.timer.load();       
            oops.audio.resumeAll();
            director.resume();
            game.resume();
            Message.dispatchEvent(EngineMessage.GAME_ENTER);
        });

          
        game.on(Game.EVENT_HIDE, () => {
            log("Game.EVENT_HIDE");
            oops.timer.save();       
            oops.audio.pauseAll();
            director.pause();
            game.pause();
            Message.dispatchEvent(EngineMessage.GAME_EXIT);
        });

          
        var c_gui = this.gui?.addComponent(GUI)!;
        view.setResizeCallback(() => {
            c_gui.resize();
            Message.dispatchEvent(EngineMessage.GAME_RESIZE);
        });
    }
}