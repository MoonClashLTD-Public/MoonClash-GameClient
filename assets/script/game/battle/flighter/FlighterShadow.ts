import { _decorator, Component, Sprite, v3 } from 'cc';
import { Flighter } from './Flighter';
const { ccclass, property } = _decorator;

  
const SHADOW = {
      
    GROUND: {
        P: v3(0, 0, 0),
        R: v3(50, 50, 0),
        S: v3(1, -1, 0),
    },
      
    AIR: {
        P: v3(-30, -70, 0),
        R: v3(20, 50, 0),
        S: v3(1, 1, 0),
    }
}

@ccclass('FlighterShadow')
export class FlighterShadow extends Component {
    flighter: Flighter;
    start() {
    }

    init(f: Flighter) {
        this.flighter = f;
        // this.flighter.shadowSpr.node.setPosition(SHADOW.GROUND.P);
        // this.flighter.shadowSpr.node.setRotationFromEuler(SHADOW.GROUND.R);
        // this.flighter.shadowSpr.node.setScale(SHADOW.GROUND.S);
    }

    update(dt: number) {
        let scale = this.flighter.shadowSpr.node.scale.clone();
        if (this.flighter.roleSpr.node.scale.x > 0) {
            scale.x = Math.abs(scale.x);
        } else {
            scale.x = -Math.abs(scale.x);
        }
        this.flighter.shadowSpr.node.setScale(scale)
        this.flighter.shadowSpr.spriteFrame = this.flighter.roleSpr.spriteFrame;
    }
}

