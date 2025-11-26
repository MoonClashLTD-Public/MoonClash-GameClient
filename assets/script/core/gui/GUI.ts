/*
 * @Author: dgflash
 * @Date: 2021-07-03 16:13:17
 * @LastEditors: dgflash
 * @LastEditTime: 2022-05-09 19:34:22
 */
import { Camera, Component, math, ResolutionPolicy, screen, UITransform, view, _decorator } from "cc";
import { Logger } from "../common/log/Logger";

const { ccclass, menu } = _decorator;

  
@ccclass('GUI')
export class GUI extends Component {
      
    transform!: UITransform;
      
    camera!: Camera;
      
    portrait!: boolean;

      
    private portraitDrz: math.Size = null!;
      
    private landscapeDrz: math.Size = null!;

    onLoad() {
        this.init();
    }

      
    protected init() {
        this.transform = this.getComponent(UITransform)!;
        this.camera = this.getComponentInChildren(Camera)!;

        if (view.getDesignResolutionSize().width > view.getDesignResolutionSize().height) {
            this.landscapeDrz = view.getDesignResolutionSize();
            this.portraitDrz = new math.Size(this.landscapeDrz.height, this.landscapeDrz.width);
        }
        else {
            this.portraitDrz = view.getDesignResolutionSize();
            this.landscapeDrz = new math.Size(this.portraitDrz.height, this.portraitDrz.width);
        }

        this.resize();
    }

    resize() {
        let dr;
        if (view.getDesignResolutionSize().width > view.getDesignResolutionSize().height) {
            dr = this.landscapeDrz;
        }
        else {
            dr = this.portraitDrz
        }

        var s = screen.windowSize;
        var rw = s.width;
        var rh = s.height;
        var finalW = rw;
        var finalH = rh;

        if ((rw / rh) > (dr.width / dr.height)) {
              
            finalH = dr.height;
            finalW = finalH * rw / rh;
            this.portrait = false;
        }
        else {
              
            finalW = dr.width;
            finalH = finalW * rh / rw;
            this.portrait = true;
        }

          
        view.setDesignResolutionSize(finalW, finalH, ResolutionPolicy.UNKNOWN);
        this.transform!.width = finalW;
        this.transform!.height = finalH;

        Logger.trace(dr, "");
        Logger.trace(s, "");
    }
}