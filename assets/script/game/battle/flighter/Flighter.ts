import { _decorator, Component, Node, Prefab, Animation, animation, tween, Sprite, Vec2, v2, v3, Vec3, instantiate, JsonAsset, log, Color, Label, size, easing, Material, color, Tween, SpriteFrame, sp, sys, UIOpacity } from 'cc';
import { Logger } from '../../../core/common/log/Logger';
import { oops } from '../../../core/Oops';
import { CommonUtil } from '../../../core/utils/CommonUtil';
import TableHeroes, { HeroCfg } from '../../common/table/TableHeroes';
import TableMaps from '../../common/table/TableMaps';
import TableSkill from '../../common/table/TableSkill';
import { BattleManger } from '../BattleManger';
import BattleFlashSprite from '../cmps/BattleFlashSprite';
import { FlighterAnimType } from '../utils/BattleEnum';
import { FlighterGameObjcet } from '../utils/FlighterGameObject';
import { FighterManager } from './FighterManager';
import { FighterTop } from './FighterTop';
import { FighterLog } from './FightLog';
import { FlighterAnim } from './FlighterAnim';
import { FlighterAnimEvent } from './FlighterAnimEvent';
import { FlighterBuff } from './FlighterBuff';
import { FlighterMove } from './FlighterMove';
import { FlighterShadow } from './FlighterShadow';
import { FlighterViewAnimator } from './FlighterViewAnimator';
const { ccclass, property } = _decorator;

@ccclass('Flighter')
export class Flighter extends Component {
    @property(Material)
    blinkWhiteMat: Material   
    @property(Material)
    blinkRedMat: Material   
    @property(Material)
    blinkBlueMat: Material   
    @property(Material)
    blinkBuffSpeedMat: Material   
    @property(Animation)
    dizzinessAnim: Animation   
    @property(JsonAsset)
    animatorJson: JsonAsset
    @property(Node)
    roleParent: Node
    @property(Node)
    skillShaderTmp: Node
    @property([FighterTop])
    fighterTops: FighterTop[] = []   
    fighterTop: FighterTop
    flighterShadow: FlighterShadow
    flighterMove: FlighterMove
    flighterAnim: FlighterAnim
    flighterBuff: FlighterBuff
    atkPoint: Node
    dmgPoint: Node
      
    targetPos: Vec3 = v3();
      
    speed: number = 500;
    animSpeed: number = 1;
    isAir: boolean   
    _dir: number = 0;   
    get dir() {
        let dir = 0;
        if (this._dir >= 0 && this._dir <= 7) {
            dir = 8 - this._dir;
        } else if (this._dir >= 8 && this._dir <= 15) {
            dir = this._dir % 8;
        }
        if (BattleManger.getInstance().meTeam == core.Team.Red) {
            dir = 8 - dir;
        }
        return dir;
    }
      
    get sign() {
        let sign = 1;
        if (this._dir >= 0 && this._dir <= 7) {
        } else if (this._dir >= 8 && this._dir <= 15) {
            sign = -1;
        }
        if (BattleManger.getInstance().meTeam == core.Team.Red) {
            sign = -sign;
        }
        return sign;
    }
    flighterAnimName: string = FlighterAnimType.NONE;   
    targetId: number = 0;
    fGo: FlighterGameObjcet

      
    roleNode: Node;

    shadowSpr: Sprite
    roleSpr: Sprite
    roleAnimation: Animation

    heroInfo: HeroCfg;
      
    animator: FlighterViewAnimator;
    defPos: Vec3 = Vec3.ZERO;

    skillShaders: Node[] = [];
      
    isFlagCharge: boolean = false;
    start() {

    }

    update(deltaTime: number) {

    }

    onDestroy() {
    }

    destoryTmp() {
        this.skillShaders.forEach(e => e.destroy());
        this.skillShaders = [];
    }

    init(fGo: FlighterGameObjcet) {
        this.flighterAnimName = FlighterAnimType.NONE;
        this.targetId = 0;
        this.animSpeed = 1;
        this.defPos = Vec3.ZERO;
        this.isFlagCharge = false;
        this._dir = 0;
        this.targetPos = v3();

        this.fGo = fGo;
        let protoId = fGo.props.GetValue(core.PropType.PropTypeProtoId).i32;
        let heroInfo = TableHeroes.getInfoById(protoId);
        this.heroInfo = heroInfo;
        this.isAir = heroInfo.type == core.UnitType.UnitFlyer;
        if (!heroInfo) Logger.erroring(`Flighter init error, protoId: ${protoId}`);
        // let rolePrefabs = BattleManger.getInstance().rolePrefabs;
        // if (!rolePrefabs[heroInfo.res_name]) Logger.erroring(`Flighter init error, rolePrefabs: ${protoId}`);
        // let roleNode = instantiate(rolePrefabs[heroInfo.res_name]);
        let roleNode = BattleManger.getInstance().getRoleByPool(heroInfo);
        this.roleParent.addChild(roleNode);
        roleNode.active = true;
        this.roleNode = roleNode;
        this.shadowSpr = this.roleNode.getChildByName('shadow').getComponent(Sprite);

        this.atkPoint = roleNode.getChildByName("atkPoint");
        this.dmgPoint = roleNode.getChildByName("dmgPoint");

        let team = fGo.props.GetValue(core.PropType.PropTypeTeam).i32;
        // let isBlue = team == BattleManger.getInstance().meTeam ? true : false;
        let isBlue = BattleManger.getInstance().getDisplayColorByTeam(team) == core.Team.Blue;

        this.roleNode.getChildByName('sprite_r').active = false;
        this.roleNode.getChildByName('sprite_b').active = false;
        if (isBlue) {
            this.roleSpr = this.roleNode.getChildByName('sprite_b').getComponent(Sprite);
        } else {
            this.roleSpr = this.roleNode.getChildByName('sprite_r').getComponent(Sprite);
        }
        this.roleSpr.node.active = true;

        if (fGo.props.GetValue(core.PropType.PropTypeTowerType).i32 == core.TowerType.TowerTypeNone) {
        } else if (fGo.props.GetValue(core.PropType.PropTypeTowerType).i32 == core.TowerType.TowerTypeKing) {
            let building_b = this.roleNode.getChildByName('building_b')
            let building_r = this.roleNode.getChildByName('building_r')
            building_b.active = isBlue;
            building_r.active = !isBlue;

            let map = TableMaps.getInfoById(BattleManger.getInstance().mapId);
            building_b.children.forEach(e => e.active = e.name.split('_')[0] == `tower${map.pagoda_id}`);
            building_r.children.forEach(e => e.active = e.name.split('_')[0] == `tower${map.pagoda_id}`);
        } else if (fGo.props.GetValue(core.PropType.PropTypeTowerType).i32 == core.TowerType.TowerTypeGuard) {
            let building_b = this.roleNode.getChildByName('building_b');
            let building_r = this.roleNode.getChildByName('building_r');
            let building_b_1 = this.roleNode.getChildByName('building_b_1');
            let building_r_1 = this.roleNode.getChildByName('building_r_1');
            building_b.active = isBlue;
            building_r.active = !isBlue;
            building_b_1.active = isBlue;
            building_r_1.active = !isBlue;
            let map = TableMaps.getInfoById(BattleManger.getInstance().mapId);
            building_b.children.forEach(e => e.active = e.name.split('_')[0] == `tower${map.pagoda_id}`);
            building_r.children.forEach(e => e.active = e.name.split('_')[0] == `tower${map.pagoda_id}`);
            building_b_1.children.forEach(e => e.active = e.name.split('_')[0] == `tower${map.pagoda_id}`);
            building_r_1.children.forEach(e => e.active = e.name.split('_')[0] == `tower${map.pagoda_id}`);
        }
          
        this.resetDefMat();
        this.roleSpr.node.getComponent(BattleFlashSprite)?.destroy();
        this.roleSpr.node.addComponent(BattleFlashSprite);
        this.dmgFlash(false);

        this.roleAnimation = this.roleNode.getComponent(Animation);
        this.defPos = this.roleSpr.node.getPosition().clone();

        this.node.getComponent(FlighterShadow)?.destroy();
        let shadow = this.node.addComponent(FlighterShadow);   
        shadow.init(this);
        this.node.getComponent(FlighterAnim)?.destroy();
        let anim = this.node.addComponent(FlighterAnim);   
        anim.init(this);
        this.node.getComponent(FlighterMove)?.destroy();
        let move = this.node.addComponent(FlighterMove);   
        move.init(this);
        this.roleNode.getComponent(FlighterBuff)?.destroy();
        let buff = this.roleNode.addComponent(FlighterBuff);
        buff.init(this);
        this.roleNode.getComponent(FlighterAnimEvent)?.destroy();
        let animEvent = this.roleNode.addComponent(FlighterAnimEvent);
        animEvent.init(this);
          
        // animator.init(this, this.animatorJson);
        // this.animator = animator;

        // this.flighter.animator.setTrigger(FlighterAnimatorType.Attack);

        this.flighterShadow = shadow;
        this.flighterMove = move;
        this.flighterAnim = anim;
        this.flighterBuff = buff;

        let pos = BattleManger.getInstance().sToCPos(v2(fGo.props.GetValue(core.PropType.PropTypePosX).i32, fGo.props.GetValue(core.PropType.PropTypePosY).i32));
        this.targetPos = v3(pos.x, pos.y);
        this.flighterMove.syncPosWithEntity();


          
          
          
        this.fighterTops.forEach(e => e.node.active = false);
        this.fighterTop = this.fighterTops[fGo.props.GetValue(core.PropType.PropTypeTowerType).i32];
        // this.fighterTop.node.active = true;
        // this.fighterTop.init(fGo, size(w, h));
        FighterManager.getInstance().createFighterTop(this.fighterTop, fGo, this.roleSpr);

          
        if (fGo.props.GetValue(core.PropType.PropTypeState).i32 == core.FighterState.FighterBorn
            && fGo.props.GetValue(core.PropType.PropTypeTowerType).i32 == core.TowerType.TowerTypeNone) {
            this.bornAct(this.fGo.props.GetValue(core.PropType.PropTypeBornCastMs).i32);   
            log("bron pos", fGo.props.GetValue(core.PropType.PropTypeCardProtoId).i32, fGo.props.GetValue(core.PropType.PropTypePosX).i32, fGo.props.GetValue(core.PropType.PropTypePosY).i32)
        }

          
        if (fGo.props.GetValue(core.PropType.PropTypeTowerType).i32 == core.TowerType.TowerTypeNone) {
            this.bornAudio();
        }

          
        // FighterLog.log(heroInfo, this.fGo);
        if (false)
            FighterLog.log3(this.heroInfo, fGo);
    }

    /**
     * 
  
  
  
  
  
     */
    upd(oldFGo: FlighterGameObjcet, newFGo: FlighterGameObjcet, fChange: core.IFighter, casterSkills: core.IDelayEffect[], targetSkills: core.IDelayEffect[]) {
        this.fGo = newFGo;

        FighterManager.getInstance().updFighterTop(fChange);

        let newPos = v2(-1, -1);   
        let isChangeState = false;   
        let propTypeTargetId = 0;   
        let flyTime = 0;   

          
        for (const prop of fChange.props) {
            let fighterType = prop.t;
            let i32 = prop.i32;
            if (fighterType == core.PropType.PropTypeState) {
                this.flighterAnimName = FlighterAnimType.NONE;
                if (i32 == core.FighterState.FighterBorn) {
                      
                    if (this.fGo.props.GetValue(core.PropType.PropTypeTowerType).i32 == core.TowerType.TowerTypeNone) {
                        this.flighterAnimName = FlighterAnimType.RUN;
                    } else if (this.fGo.props.GetValue(core.PropType.PropTypeTowerType).i32 == core.TowerType.TowerTypeKing) {
                        this.flighterAnimName = FlighterAnimType.PROTECT;
                    } else {
                        this.flighterAnimName = FlighterAnimType.IDLE;
                    }
                } else if (i32 == core.FighterState.FighterIdle) {
                    this.flighterAnimName = FlighterAnimType.IDLE;
                } else if (i32 == core.FighterState.FighterSafe) {
                    this.flighterAnimName = FlighterAnimType.PROTECT;
                } else if (i32 == core.FighterState.FighterGuard) {
                    this.flighterAnimName = FlighterAnimType.GUARD;
                } else if (i32 == core.FighterState.FighterMoving) {
                    this.flighterAnimName = FlighterAnimType.RUN;
                } else if (i32 == core.FighterState.FighterAttacking) {
                    let bf = true;
                    if (casterSkills[0]) {
                        let skillInfo = TableSkill.getInfoById(casterSkills[0].skProtoId);
                        if (skillInfo.action_name) {
                            this.flighterAnimName = skillInfo.action_name;
                            bf = false;
                        }
                    }
                    if (bf)
                        this.flighterAnimName = FlighterAnimType.ATTACK;   
                } else if (i32 == core.FighterState.FighterJumping) {   
                    this.flighterAnimName = FlighterAnimType.JUMPING;
                } else if (i32 == core.FighterState.FighterDead) {
                    this.flighterAnimName = FlighterAnimType.NONE;
                    this.die();
                }
                isChangeState = true;
            } else if (fighterType == core.PropType.PropTypePosX) {
                newPos.x = i32;
            } else if (fighterType == core.PropType.PropTypePosY) {
                newPos.y = i32;
            } else if (fighterType == core.PropType.PropTypeHp) {
                // this.fighterTop?.setHp(i32);
                  
                if (oldFGo && oldFGo.props.GetValue(core.PropType.PropTypeHp).i32 > i32) {
                    this.dmgFlash(true);
                }
            } else if (fighterType == core.PropType.PropTypeHp1) {
                // this.fighterTop?.setHp(i32);
                  
                if (oldFGo && oldFGo.props.GetValue(core.PropType.PropTypeHp1).i32 > i32) {
                    this.dmgFlash(true);
                }
            } else if (fighterType == core.PropType.PropTypeTargetId) {
                // propTypeTargetId = i32;
            } else if (fighterType == core.PropType.PropTypeOrientation) {
                this._dir = i32
                isChangeState = true;
            } else if (fighterType == core.PropType.PropTypeDieAfterMs) {
                flyTime = i32;   
            } else if (fighterType == core.PropType.PropTypeFlagCharge) {
                let isFlagCharge = i32 == 1;
                if (this.isFlagCharge != isFlagCharge)
                    isChangeState = true;
                this.isFlagCharge = isFlagCharge;
            }
        }

        if (this.isFlagCharge && this.flighterAnimName == FlighterAnimType.RUN) {
            // log(this.fGo.id, 'rush')
            this.flighterAnimName = FlighterAnimType.RUSH;   
        }

        if (this.fGo.props.GetValue(core.PropType.PropTypeHp1).i32 > 0 && this.heroInfo.isShield) {
              
            if (isChangeState && this.flighterAnimName != FlighterAnimType.NONE) {
                let dp = '_dp_';
                if (this.flighterAnimName.indexOf(dp) >= 0)
                    this.flighterAnimName += dp;
            }
        }

          
        //     console.log("---------", this.heroInfo, flyTime)
        // }
        if (this.heroInfo.skill_born_place == core.SkillBornPlace.SkillBornPlaceInPlace) {
              
            let toPos = v2(this.fGo.props.GetValue(core.PropType.PropTypePosX).i32, this.fGo.props.GetValue(core.PropType.PropTypePosY).i32)
            let _pos = BattleManger.getInstance().sToCPos(v2(toPos.x, toPos.y));
            this.node.setPosition(v3(_pos.x, _pos.y));
        } else if (this.heroInfo.skill_born_place == core.SkillBornPlace.SkillBornPlaceKingTower) {
            if (flyTime > 0) {
                let t = flyTime / 1000;
                  
                let toPos = v2(this.fGo.props.GetValue(core.PropType.PropTypePosX).i32, this.fGo.props.GetValue(core.PropType.PropTypePosY).i32)
                let _pos = BattleManger.getInstance().sToCPos(v2(toPos.x, toPos.y));
                let team = this.fGo.props.GetValue(core.PropType.PropTypeTeam).i32;

                if (this.heroInfo.res_name == "role_skill_magic_arrow") {
                    let __pos = FighterManager.getInstance().getKingWPos(team);
                      
                    this.node.setPosition(v3(_pos.x, _pos.y));
                    let skillNode = this.roleNode.getChildByName('skillNode');
                    let fly = skillNode.getChildByName('fly');
                    let hitNode = skillNode.getChildByName('hit');
                    let idx = 0;
                    let hit = instantiate(hitNode);
                    this.roleNode.addChild(hit);
                    hit.children.forEach(e => {
                        let totalT = 1.5;
                        let _t = t - totalT;
                        if (_t < 0) {
                            _t = 0;
                            totalT = t;
                        }

                        let tt = totalT / 3;
                        let addTime = Math.floor(idx / (hit.children.length / 3)) * tt;
                        idx++;
                        let f = instantiate(fly);
                        this.roleNode.addChild(f);
                        f.setWorldPosition(__pos);
                        e.active = false;
                        f.active = false;

                        let targetPos = e.getWorldPosition();
                        let angle = CommonUtil.calcAngle(__pos, targetPos);
                        if (team == BattleManger.getInstance().meTeam) {
                            f.getComponent(Animation).play('idle8');
                            f.angle = angle;
                        } else {
                            f.getComponent(Animation).play('idle0');
                            f.angle = angle - 180;
                        }
                        tween(f)
                            .call(() => {
                                f.active = true;
                            })
                            .delay(_t + addTime)
                            .to(tt, {
                                worldPosition: targetPos
                            })
                            .call(() => {
                                f.active = false;
                                e.active = true;
                            })
                            .start();
                    })
                } else {
                    let __pos = FighterManager.getInstance().getKingPos(team);
                      
                    let node = this.roleNode.getChildByName('runSk') || this.roleNode.getChildByName('fly');
                    let sk = node?.getComponent(sp.Skeleton) || node?.getComponentInChildren(sp.Skeleton);
                    this.node.setPosition(v3(__pos.x, __pos.y));
                    tween(this.node)
                        .call(() => {
                            let skAnim = sk?.findAnimation('animation');
                            if (skAnim) {
                                sk.node.active = true;
                                sk.timeScale = skAnim.duration / t;   
                                sk.setAnimation(0, "animation", false);
                            }
                        })
                        // .to(t, {
                        //     position: v3(_pos.x, _pos.y)
                        // })
                        .start();
                    this.moveNode({
                        t: t,
                        moveNode: this.node,
                        bezierNode: this.roleNode.getChildByName('bezier'),
                        localPos: v2(__pos.x, __pos.y),
                        targetPos: v2(_pos.x, _pos.y),
                    });
                    let skillShader = instantiate(this.skillShaderTmp);
                    skillShader.active = true;
                    this.skillShaders.push(skillShader);
                    this.node.parent.addChild(skillShader);
                    this.moveNode({
                        t: t,
                        moveNode: skillShader,
                        localPos: v2(__pos.x, __pos.y),
                        targetPos: v2(_pos.x, _pos.y),
                    });
                }
            }
        } else if ((newPos.x >= 0 || newPos.y >= 0) && oldFGo) {
              
            let oldPos = v2(oldFGo.props.GetValue(core.PropType.PropTypePosX).i32, oldFGo.props.GetValue(core.PropType.PropTypePosY).i32)
            newPos.x = newPos.x > -1 ? newPos.x : oldPos.x;
            newPos.y = newPos.y > -1 ? newPos.y : oldPos.y;
            if (!newPos.equals(oldPos)) {
                let pos = BattleManger.getInstance().sToCPos(v2(newPos.x, newPos.y));
                // let _pos = BattleManger.getInstance().sToCPos(v2(oldPos.x, oldPos.y));
                  
                // this.node.setPosition(pos.x, pos.y);
                this.targetPos = v3(pos.x, pos.y, 0);
                this.flighterMove.smoothSyncPosWithEntity();

                // let node = instantiate(BattleManger.getInstance().Battle.startNode);
                // BattleManger.getInstance().BattleMap.getAirLayer().addUserNode(node);
                // node.setPosition(v3(pos.x, pos.y));
                // node.active = true;
            } else {
                Logger.erroring("--------!" + this.fGo.id + "-" + newPos.x + "-" + newPos.y)
            }
        }

          
        if (propTypeTargetId != 0) {
            let targetF = FighterManager.getInstance().flighters.get(propTypeTargetId);
            if (targetF) {
                  
                // let tPos = v2(targetF.fGo.props.GetValue(core.PropType.PropTypePosX).i32, targetF.fGo.props.GetValue(core.PropType.PropTypePosY).i32);
                // let cPos = v2(this.fGo.props.GetValue(core.PropType.PropTypePosX).i32, this.fGo.props.GetValue(core.PropType.PropTypePosY).i32);
                // let pos = BattleManger.getInstance().sToCPos(v2(tPos.x, tPos.y));
                // let _pos = BattleManger.getInstance().sToCPos(v2(cPos.x, cPos.y));
                  

                this.targetId = propTypeTargetId;
                  
                // BattleSkillManager.getInstance().createSkill(this.fGo.id, propTypeTargetId)
            } else {
                Logger.erroring("--------!" + propTypeTargetId)
            }
        }

          
        if (isChangeState) {
            // let isAtk = false;
            // if (this.flighterAnimType == FlighterAnimType.ATTACK) {
            //     if (this.targetId != 0) {
            //         let protoId = this.fGo.props.GetValue(core.PropType.PropTypeProtoId).i32;
            //         let hero = TableHeroes.getInfoById(protoId);
            //         let skId = hero.sk_ids[0];
            //         if (skId) {
            //             isAtk = true;
            //             BattleSkillManager.getInstance().createSkill(this.fGo.id, this.targetId, skId);
            //         }
            //     }
            // }
            // let protoId = this.fGo.props.GetValue(core.PropType.PropTypeProtoId).i32;
            // let heroInfo = TableHeroes.getInfoById(protoId);

            // if (heroInfo.name == 'giant') {
            // }
            // log(this.fGo.id, heroInfo.name, new Date().getTime(),
            //     this.flighterAnimType, BattleManger.getInstance().isBlue,
            //     "_dir", this._dir,
            //     "dir", this.dir,
            //     "sign", this.sign);
            if (this.flighterAnimName && this.flighterAnimName != FlighterAnimType.NONE) {
                this.roleSpr.node.setPosition(this.defPos);
                this.flighterAnim?.playDirAnim(true);
            }
        }

          
        this.flighterBuff.playBuffs(fChange);
        // for (const skill of casterSkills) {
        //     let _skill = TableSkill.getInfoById(skill.skProtoId);
        //     this[`play${_skill.buff_action_name}`] && this[`play${_skill.buff_action_name}`]();
        //     if (_skill.buff_action_name)
        //         log('casterSkills.buff_action_name', _skill.buff_action_name)
        // }
        // for (const skill of targetSkills) {
        //     let _skill = TableSkill.getInfoById(skill.skProtoId);
        //     if (_skill.buff_action_name)
        //         log('targetSkills.buff_action_name', _skill.buff_action_name)
        //     this[`play${_skill.buff_action_name}`] && this[`play${_skill.buff_action_name}`]();
        // }

          
        if (sys.isBrowser && false)
            FighterLog.log2(this.heroInfo, oldFGo, newFGo);
        // FighterLog.log(this.heroInfo, this.fGo, fChange);
    }

      
    die() {
        this.scheduleOnce(() => {
            this.flighterBuff.die();
            FighterManager.getInstance().delFlighter(this.fGo.id);
        }, 0);
        let fTop = FighterManager.getInstance().getFighterTop(this.fGo.id);
        if (fTop) {
            fTop.scheduleOnce(() => {
                FighterManager.getInstance().delFighterTop(fTop.fGo.id);
            }, 0.1);
        }
        let delCB = () => {
            this.destoryTmp();
            FighterManager.getInstance().destoryFlighter(this.fGo.id);
        };

        let killerId = this.fGo.props.GetValue(core.PropType.PropTypeKillerId).i32;
        if (this.fGo.id == killerId) {   
            let animationState = this.roleAnimation.getState(FlighterAnimType.DIE);
            if (animationState) {   
                this.roleAnimation.play(FlighterAnimType.DIE);
                this.scheduleOnce(() => {
                    delCB();
                }, animationState.duration / animationState.speed);
            } else {   
                this.scheduleOnce(() => {
                    delCB();
                }, 0)
            }
        } else {
              
            let noAnim = {
                'role_deads': true,
            }
            if (noAnim[this.heroInfo.res_name]) {
                this.scheduleOnce(() => {
                    delCB();
                }, 0.5);
            } else {
                this.roleNode.active = false;
                  
                FighterManager.getInstance().showDieEffect(this.node, this.roleNode.getWorldPosition(), () => {
                    delCB();
                }, this.fGo.props.GetValue(core.PropType.PropTypeTowerType).i32, this.heroInfo);
            }
        }

        let sound = this.heroInfo.sound;
        if (sound?.dead_res)
            BattleManger.getInstance().Battle.battleAudio.playEffect(sound.dead_res, sound.dead_volume);
    }

    shakeXX: Tween<Node>
      
    dmgFlash(anim: boolean = false) {
        if (this.heroInfo.type == core.UnitType.UnitBuilding) return;   

        if (this.animSpeed != 1) return;
        if (anim) {
            this.roleSpr.getComponent(BattleFlashSprite).clickFlash();
        } else {
            this.roleSpr.getComponent(BattleFlashSprite).defaultColor();
        }
        if (!this.shakeXX) {
            // this.shakeXX = tween(this.roleSpr.node)
            //     .to(0.02, { scale: v3(1.03, 1.03, 1.03) })
            //     // .delay(0.020)
            //     .to(0.02, { scale: v3(0.98, 0.98, 0.98) })
            //     .delay(0.010)
            //     // .to(0.03, { scale: v3(1.1, 1.1, 1.1) })
            //     // .delay(0.020)
            //     .to(0.02, { scale: v3(1.0, 1.0, 1.0) })
            //     .call(() => {
            //         this.shakeXX = null;
            //     })
            //     .start();

            this.shakeXX = tween(this.roleSpr.node)
                .to(0.02, {}, {
                    onUpdate(target?: Node, ratio?) {
                        target.setScale(v3(target.scale.x, 1 + 0.03 * ratio, target.scale.z));
                    },
                })
                .to(0.02, {}, {
                    onUpdate(target?: Node, ratio?) {
                        target.setScale(v3(target.scale.x, 1.03 - 0.05 * ratio, target.scale.z));
                    },
                })
                .delay(0.010)
                .to(0.02, {}, {
                    onUpdate(target?: Node, ratio?) {
                        target.setScale(v3(target.scale.x, 0.98 + 0.02 * ratio, target.scale.z));
                    },
                })
                .call(() => {
                    this.shakeXX = null;
                })
                .start();
        }
    }

    bornAct(t: number) {
        // let protoId = this.fGo.props.GetValue(core.PropType.PropTypeProtoId).i32;
        // let heroInfo = TableHeroes.getInfoById(protoId);
        let team = this.fGo.props.GetValue(core.PropType.PropTypeTeam).i32;
        // let isBlue = team == BattleManger.getInstance().meTeam ? true : false;
        let isBlue = BattleManger.getInstance().getDisplayColorByTeam(team) == core.Team.Blue;

        FighterManager.getInstance().showBronEffect(this.node, isBlue);

        let defScale = this.roleNode.getScale();
        this.roleNode.setPosition(v3(0, 50))
        this.roleNode.setScale(v3(defScale.x - 0.2, defScale.y, defScale.z))
        tween(this.roleNode)
            .to(0.5, { position: v3(0) }, { easing: easing.circIn })
            .to(0.5, { scale: defScale }, { easing: easing.bounceIn })
            .start();
    }

    async bornAudio() {
        let sound = this.heroInfo.sound;
        if (sound?.born_res) {
            let delay = sound.born_delay ?? 1;
            await CommonUtil.waitCmpt(this, delay);
            BattleManger.getInstance().Battle.battleAudio.playEffect(sound.born_res, sound.born_volume);
        }
    }

      
    resetDefMat() {
        let team = this.fGo.props.GetValue(core.PropType.PropTypeTeam).i32;
        // let isBlue = team == BattleManger.getInstance().meTeam ? true : false;
        let isBlue = BattleManger.getInstance().getDisplayColorByTeam(team) == core.Team.Blue;
        this.roleSpr.setMaterial(isBlue ? this.blinkBlueMat : this.blinkRedMat, 0);   
    }

      
    moveNode(param: {
        t: number
        moveNode: Node
        bezierNode?: Node
        localPos: Vec2
        targetPos: Vec2
    }) {
        param.moveNode.setPosition(v3(param.localPos.x, param.localPos.y));
        let localPos = param.localPos;
        let targetPos = param.targetPos;
        if (param.bezierNode) {
            let diffX = targetPos.x - localPos.x;
            let diffY = targetPos.y - localPos.y;
            // let x = diffX * bezier.position.x;
            // let y = diffY * bezier.position.y;
            // let controlPoint = v2(this.localPos.x + x, this.localPos.y + y);
            let x = param.bezierNode.position.x;
            let y = param.bezierNode.position.y;
            let dis = Vec2.distance(localPos, targetPos);
            let controlPoint = CommonUtil.getCenterPoint([v3(localPos.x, localPos.y), v3(targetPos.x, targetPos.y)]);
            if (diffY > 0) {
                controlPoint.y += dis * y;
            } else {
                controlPoint.y -= dis * y;
            }
            if (diffX > 0) {
                controlPoint.x -= dis * x;
            } else {
                controlPoint.x += dis * x;
            }
            CommonUtil.bezierTo(param.moveNode, param.t, localPos, v2(targetPos.x, controlPoint.y), v3(targetPos.x, targetPos.y), {})
                .start();
        } else {
            // let dis = Vec2.distance(localPos, targetPos);
            tween(param.moveNode)
                .to(param.t, { position: this.targetPos })
                .start();
        }
    }
}