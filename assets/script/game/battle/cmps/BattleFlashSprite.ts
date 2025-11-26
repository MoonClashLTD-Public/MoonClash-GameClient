import { _decorator, Component, Material, Sprite, sp, AnimationState, tween, Tween, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BattleFlashSprite')
export default class BattleFlashSprite extends Component {
    targetRate: number = 0.4;
    duration: number = 0.2;
    _median: number = 0;
    _time: number = 0;

    _material: Material = null!;

    uiOf: UIOpacity;
    onLoad() {
        // this._median = this.duration / 2;
          
        // this._material = this.node.getComponent(Sprite)!.getMaterialInstance(0)!;
          
        this.uiOf = this.node.addComponent(UIOpacity);
        this.defaultColor();
    }

    update(dt: number) {
        // if (this._time > 0) {
        //     this._time -= dt;

        //     this._time = this._time < 0 ? 0 : this._time;
        //     let rate = Math.abs(this._time - this._median) * 2 / this.duration;
        //     this._material.setProperty("u_rate", rate * this.targetRate);
        // } else {
        //     this._material.setProperty("u_rate", 1);
        // }
    }

    clickFlash() {
        // Tween.stopAllByTarget(this);
        // this.targetRate = 0.4;
        // tween<BattleFlashSprite>(this)
        //     .to(0.26, { targetRate: 1 }, {
        //         onUpdate(target?: BattleFlashSprite, ratio?) {
        //             target._material.setProperty("u_rate", target.targetRate);
        //         },
        //     })
        //     .start();

        // this._time = this.duration;

        Tween.stopAllByTarget(this.uiOf);
        this.uiOf.opacity = 102;
        tween(this.uiOf)
            .to(0.26, { opacity: 1 })
            .start();
    }

    defaultColor() {
        Tween.stopAllByTarget(this.uiOf);
        this.uiOf.opacity = 1;

        // this._time = 0;
        // this._material.setProperty("u_rate", 1);
    }
}
