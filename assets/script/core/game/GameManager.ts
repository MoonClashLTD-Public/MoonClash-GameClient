/*
 * @Author: dgflash
 * @Date: 2022-02-10 09:50:41
 * @LastEditors: dgflash
 * @LastEditTime: 2022-04-21 17:58:20
 */
import { game, Game, Node } from 'cc';

var timeScale = 1;

  
export class GameManager {
      
    root!: Node;

    constructor(root: Node) {
        this.root = root;
        this.gameTimeScaleExtend();
    }

      
    setTimeScale(scale: number) {
        timeScale = scale;
    }

    private gameTimeScaleExtend() {
        //@ts-ignore
        game._calculateDT = function (now: number) {
            if (!now) now = performance.now();
            //@ts-ignore
            this._deltaTime = now > this._startTime ? (now - this._startTime) / 1000 : 0;
            //@ts-ignore
            if (this._deltaTime > Game.DEBUG_DT_THRESHOLD) {
                //@ts-ignore
                this._deltaTime = this.frameTime / 1000;
            }
            //@ts-ignore
            this._startTime = now;
            //@ts-ignore
            return this._deltaTime * timeScale;
        };
    }
}
