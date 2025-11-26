import { _decorator, Component, Node, tween, sp, UIOpacity, instantiate, UITransform, v3, Vec3, Animation } from 'cc';
import { HeroCfg } from '../../../common/table/TableHeroes';
import { BattleManger } from '../../BattleManger';
const { ccclass, property } = _decorator;

@ccclass('BattleDieEffectCmp')
export class BattleDieEffectCmp extends Component {
    @property(sp.Skeleton)
    commonSk: sp.Skeleton = null;   
    @property(Animation)
    warriorAnim: Animation = null;   
    @property(sp.Skeleton)
    castleSk: sp.Skeleton = null;   

    @property(Node)
    guardRuins: Node = null;   
    @property(Node)
    kingRuins: Node = null;   

    onLoad() {
        this.castleSk.node.active = false;
        this.commonSk.node.active = false;
        this.warriorAnim.node.active = false;
    }
    start() {

    }

    update(deltaTime: number) {

    }

    show(towerType: core.TowerType, hero: HeroCfg, cb: Function) {
        let ruins: Node = null;   
        let sk: sp.Skeleton = null;
        let anim: Animation = null;
        if (towerType == core.TowerType.TowerTypeNone) {
            if (hero.type == core.UnitType.UnitBuilding) {   
                sk = this.castleSk;
                sk.timeScale = 0.6;
            } else if (hero.res_name == 'role_warrior') {   
                anim = this.warriorAnim;
            } else {
                sk = this.commonSk;   

                let s = hero.collision.width / 2;   
                this.node.setScale(v3(s, s, s));
            }
        } else {   
            sk = this.castleSk;
            sk.timeScale = 0.6;
            if (towerType == core.TowerType.TowerTypeKing) {
                ruins = this.kingRuins;
            } else if (towerType == core.TowerType.TowerTypeGuard) {
                ruins = this.guardRuins;
            }
        }

        if (anim) {
            anim.node.active = true;
            let t = anim.defaultClip.duration;
            tween(this.node)
                .delay(t)
                .call(() => {
                    cb && cb();
                })
                .start();
        }

        if (sk) {
            sk.node.active = true;
            sk.setAnimation(0, 'animation', false);
            let skAnim = sk.findAnimation('animation');
            let t = skAnim.duration;

            tween(this.node)
                .delay(t)
                .call(() => {
                    cb && cb();
                })
                .start();

            if (ruins) {
                let shadowNode = BattleManger.getInstance().BattleMap.bg;
                let _ruins = instantiate(ruins);
                shadowNode.addChild(_ruins);
                let pos = this.node.getComponent(UITransform).convertToWorldSpaceAR(Vec3.ZERO);
                let _pos = _ruins.getComponent(UITransform).convertToNodeSpaceAR(pos);
                _ruins.setPosition(_pos);

                _ruins.active = true;
                let uiOf = _ruins.getComponent(UIOpacity) || _ruins.addComponent(UIOpacity);
                uiOf.opacity = 0;
                tween(uiOf)
                    .to(t, { opacity: 255 })
                    .start();
            }
        }
    }
}

