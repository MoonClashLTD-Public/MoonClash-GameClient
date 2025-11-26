import { _decorator, Component, Node, SpriteFrame, Sprite, ProgressBar, Label, Size, UITransform, tween, easing, Tween, Material, color, find, UIOpacity, size, v3, math } from 'cc';
import TableEquip from '../../common/table/TableEquip';
import TableHeroes, { HeroCfg } from '../../common/table/TableHeroes';
import { WalletEquipment } from '../../walletUI/widget/WalletEquipment';
import { BattleManger } from '../BattleManger';
import { FlighterGameObjcet } from '../utils/FlighterGameObject';
import { FighterManager } from './FighterManager';
const { ccclass, property } = _decorator;

let defSize: { [key: string]: math.Rect } = {}

@ccclass('FighterTop')
export class FighterTop extends Component {
    @property(Node)
    topNode: Node
    @property(ProgressBar)
    pb: ProgressBar
    @property(Label)
    lvLbl: Label
    @property(Label)
    hpLbl: Label

    @property([SpriteFrame])
    lvSf: SpriteFrame[] = [];
    @property([SpriteFrame])
    hpSf: SpriteFrame[] = [];

    @property(Sprite)
    lvBg: Sprite
    @property(Sprite)
    hpBg: Sprite

    _hp: number = 0;
    _maxHp: number = 0;
    maxHp: number = 0;   
    maxHp1: number = 0;   

    isShowPB = false;   
    isShowLevel = false;   

    heroInfo: HeroCfg;

    fGo: FlighterGameObjcet
    start() {

    }

    update(deltaTime: number) {
        let f = FighterManager.getInstance().flighters.get(this.fGo?.id);
        if (f) {
            this.node.setPosition(f.node.getPosition());
        }
    }

    showTest(heroInfo: HeroCfg) {
        if (BattleManger.getInstance().isTest) {
            let testNode = this.node.getChildByName("testNode");
            testNode.active = true;
            find("name", testNode).getComponent(Label).string = `${heroInfo.inn_name}`;
            find("lv", testNode).getComponent(Label).string = `lv:${heroInfo.level}`;
        } else {
            this.node.getChildByName("testNode").active = false;
        }
    }

    init(fGo: FlighterGameObjcet, roleSpr: Sprite) {
        this.node.active = true;
        this.fGo = fGo;
        let team = fGo.props.GetValue(core.PropType.PropTypeTeam).i32;
        let hp = fGo.props.GetValue(core.PropType.PropTypeHp).i32;
        let maxHp = fGo.props.GetValue(core.PropType.PropTypeHpMax).i32;
        let hp1 = fGo.props.GetValue(core.PropType.PropTypeHp1).i32;
        let maxHp1 = fGo.props.GetValue(core.PropType.PropTypeHpMax1).i32;
        let towerType = fGo.props.GetValue(core.PropType.PropTypeTowerType).i32;
        let protoId = fGo.props.GetValue(core.PropType.PropTypeProtoId).i32;
        let heroInfo = TableHeroes.getInfoById(protoId);
        this.heroInfo = heroInfo;
        let lv = heroInfo.level;

        let meTeam = BattleManger.getInstance().meTeam;

        this.maxHp = maxHp;
        this.maxHp1 = maxHp1;
        if (this.heroInfo.isShield) {   
            hp = hp1;
            this._maxHp = maxHp1;
        }

        this.showTest(heroInfo);

        let resName = roleSpr.node?.parent.name ?? "";
        let pScale = roleSpr.node?.parent?.getScale() ?? v3(1, 1, 1);
        let size = defSize[resName] ?? roleSpr.spriteFrame?.rect ?? new math.Rect();
        defSize[resName] = size;   

        let isFly = FighterManager.getInstance().isFly(protoId);

        this.topNode.setPosition(0, roleSpr.node.getPosition().y + (isFly ? size.height / 2 : size.height) * pScale.y);
        this.isShowPB = false;
        if (towerType == core.TowerType.TowerTypeNone) {   
        } else if (towerType == core.TowerType.TowerTypeGuard) {
            lv = BattleManger.getInstance().armies[team].level;
            if (meTeam == team) {
                this.topNode.setPosition(0, -20);
            } else {
                this.topNode.setPosition(0, size.height + 40);
                this.isShowPB = true;
            }
        } else if (towerType == core.TowerType.TowerTypeKing) {
            lv = BattleManger.getInstance().armies[team].level;
            if (meTeam == team) {
                this.topNode.setPosition(0, -50);
            } else {
                this.topNode.setPosition(0, size.height + 60);
            }
        }

        this.isShowLevel = true;
        let colorTeam = BattleManger.getInstance().getDisplayColorByTeam(team);
        if (meTeam == team) {
            this.isShowLevel = false;
        }

        if (towerType == core.TowerType.TowerTypeKing) {
            this.isShowLevel = true;
        }
        if (this.isShowPB) {
            this.isShowLevel = true;
        }

          
        if (this.heroInfo.type == core.UnitType.UnitBomb) {
            this.isShowLevel = false;
        }

        this.lvBg.spriteFrame = this.lvSf[colorTeam];
        this.hpBg.spriteFrame = this.hpSf[colorTeam];

        this._hp = hp;
        this._maxHp = maxHp;
        this.lvLbl.string = `${lv}`;

        this.lvLbl.node.parent.active = this.isShowLevel;   


        if (towerType == core.TowerType.TowerTypeNone) {   
            let w = size.width * 0.6 * pScale.x;
            this.pb.totalLength = w;
            this.pb.node.getComponent(UITransform).width = w;
            this.pb.node.children.forEach(e => {
                e.getComponent(UITransform).width = w;
            });
        }

        this.updHp();

        this.dmgFlash(false);
    }
    updGo(fChange: core.IFighter) {
        let hp = -1;
        let hp1 = -1;   
        for (const prop of fChange.props) {
            let fighterType = prop.t;
            let i32 = prop.i32;
            if (fighterType == core.PropType.PropTypeHp) {
                hp = i32;
            } else if (fighterType == core.PropType.PropTypeHp1) {
                hp1 = i32;
            }
        }

        let isHp1 = false;
        if (hp1 != -1 && this.heroInfo.isShield) {
            this._maxHp = this.maxHp1;

            this.setHp(hp1);

            isHp1 = true;
        }
        if (hp != -1 && isHp1 == false) {
            this._maxHp = this.maxHp;
            this.setHp(hp);

        }

        // if (this.heroInfo.isShield && hp1 == 0) {
          
        //     tween(this.pb)
        //         .delay(1)
        //         .call(() => {
        //             this.isShowPB = true;
        //             this.setHp(this.maxHp);
        //         })
        // }
    }
    setHp(hp: number) {
        this.dmgFlash(this._hp > hp);
        this._hp = hp;
        this.updHp(true);
    }

    updHp(anim: boolean = false) {
        if (this.hpLbl)
            this.hpLbl.string = `${this._hp}`;
        let progress = this._hp / this._maxHp;
        if (this.isShowPB) {
            this.pb.node.active = true;
        } else {
            this.pb.node.active = progress < 1;
        }

        if (progress < 1) {
            this.lvLbl.node.parent.active = true;   
        }

        // let animW = this.pb.totalLength * this.pb.progress;
        // let uiTransform = this.animBar.getComponent(UITransform);
        if (anim) {
            Tween.stopAllByTarget(this.pb);
            tween(this.pb)
                .to(0, { progress: progress }, { easing: easing.smooth })
                .call(() => {
                    this.pb.progress = progress;
                })
                .start();
        } else {
            this.pb.progress = progress;
        }
    }

    dmgFlash(anim: boolean = false) {
        if (anim) {
            tween(this.pb.barSprite.node.getComponent(UIOpacity))   
                .to(0.1, { opacity: 255 })
                .to(0.1, { opacity: 1 })
                .start();
        } else {
            this.pb.barSprite.node.getComponent(UIOpacity).opacity = 1;
        }
    }
}

