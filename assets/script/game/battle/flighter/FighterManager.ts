import { instantiate, Node, Size, Sprite, Tween, tween, UITransform, v2, v3, Vec2, Vec3 } from "cc";
import { Message } from "../../../core/common/event/MessageManager";
import { oops } from "../../../core/Oops";
import { CommonUtil } from "../../../core/utils/CommonUtil";
import TableHeroes, { HeroCfg } from "../../common/table/TableHeroes";
import { BattleManger } from "../BattleManger";
import { BattleZIndexManager } from "../BattleZIndexManager";
import { BattleBornCostCmp } from "../cmps/BattleInfo/BattleBornCostCmp";
import { BattleBornEffectCmp } from "../cmps/BattleInfo/BattleBornEffectCmp";
import { BattleBornTimeCmp } from "../cmps/BattleInfo/BattleBornTimeCmp";
import { BattleDieEffectCmp } from "../cmps/BattleInfo/BattleDieEffectCmp";
import { BattleEvent, BattlePrefabs, BattleTowerType } from "../utils/BattleEnum";
import { FlighterGameObjcet } from "../utils/FlighterGameObject";
import { FighterTop } from "./FighterTop";
import { Flighter } from "./Flighter";

export class FighterManager {

    private static instance: FighterManager;
    public static getInstance(): FighterManager {
        if (!FighterManager.instance) {
            FighterManager.instance = new FighterManager();
        }
        return FighterManager.instance;
    }

    flighters: Map<number, Flighter> = new Map();   
    redTowerIds: BattleTowerType
    blueTowerIds: BattleTowerType

    fighterTop: Map<number, FighterTop> = new Map();   

    get bm() {
        return BattleManger.getInstance();
    }
    get BZIndex() {
        return BattleZIndexManager.getInstance();
    }
    dataInit() {
        this.fighterTop.clear();
        this.flighters.clear();
        this.redTowerIds = {
            leftTower: 0,
            rightTower: 0,
            centerTower: 0,
            dieFId: 0
        };
        this.blueTowerIds = {
            leftTower: 0,
            rightTower: 0,
            centerTower: 0,
            dieFId: 0
        };
    }

    updFlighter(oldFGo: FlighterGameObjcet, newFGo: FlighterGameObjcet, fChange: core.IFighter, casterSkills: core.IDelayEffect[], targetSkills: core.IDelayEffect[]) {
        if (!this.flighters.get(newFGo.id)) {
            this.createFlighter(newFGo);
        }
        this.flighters.get(newFGo.id).upd(oldFGo, newFGo, fChange, casterSkills, targetSkills);
    }

      
    delFlighter(fId: number) {
        let fighter = this.flighters.get(fId);
        if (fighter) {
              
            let fGo = fighter.fGo;
            let bf = false;
            let towerIds = fGo.props.GetValue(core.PropType.PropTypeTeam).i32 == core.Team.Blue ? this.blueTowerIds : this.redTowerIds;
            if (fGo.props.GetValue(core.PropType.PropTypeTowerType).i32 == core.TowerType.TowerTypeKing) {
                bf = true;
                towerIds.centerTower = 0;
            } else if (fGo.props.GetValue(core.PropType.PropTypeTowerType).i32 == core.TowerType.TowerTypeGuard) {
                bf = true;
                let x = fGo.props.GetValue(core.PropType.PropTypePosX).i32;
                let y = fGo.props.GetValue(core.PropType.PropTypePosY).i32;
                let pos = this.bm.sToCPos(v2(x, y));
                if (pos.x < this.bm.BattleMap.mapSize.width / 2) {
                    towerIds.leftTower = 0;
                } else {
                    towerIds.rightTower = 0;
                }
            }
            if (bf) {
                towerIds.dieFId = fGo.id;
                if (fGo.props.GetValue(core.PropType.PropTypeTeam).i32 == core.Team.Blue) {
                    Message.dispatchEvent(BattleEvent.BLUETOWERREDUCE, towerIds);
                } else {
                    Message.dispatchEvent(BattleEvent.REDTOWERREDUCE, towerIds);
                }
            }

        }
    }
      
    destoryFlighter(fId: number) {
        let fighter = this.flighters.get(fId);
        if (fighter) {
            BattleManger.getInstance().putRoleByPool(fighter.heroInfo, fighter.roleNode);
            // this.BZIndex.delFighter(fighter.node, fighter.isAir);
            this.bm.putFlighterByPool(fighter.node);
            this.flighters.delete(fId);
        }
    }

    private createFlighter(fGo: FlighterGameObjcet) {
        // role_drudgery
        // role_harvester
        // let battlePrefabs = this.bm.battlePrefabs;
        // let roleNode = instantiate(battlePrefabs[BattlePrefabs.Flighter]);
        let roleNode = this.bm.getFlighterByPool();
        let flighter = roleNode.getComponent(Flighter);

        this.BZIndex.addFighter(roleNode,
            this.isFly(fGo.props.GetValue(core.PropType.PropTypeProtoId).i32),
            this.isMagic(fGo.props.GetValue(core.PropType.PropTypeProtoId).i32)
        );

        flighter.init(fGo);

        this.flighters.set(fGo.id, flighter);

          
        let towerIds = fGo.props.GetValue(core.PropType.PropTypeTeam).i32 == core.Team.Blue ? this.blueTowerIds : this.redTowerIds;
        if (fGo.props.GetValue(core.PropType.PropTypeTowerType).i32 == core.TowerType.TowerTypeKing) {
            towerIds.centerTower = fGo.id;
        } else if (fGo.props.GetValue(core.PropType.PropTypeTowerType).i32 == core.TowerType.TowerTypeGuard) {
            let x = fGo.props.GetValue(core.PropType.PropTypePosX).i32;
            let y = fGo.props.GetValue(core.PropType.PropTypePosY).i32;
            let pos = this.bm.sToCPos(v2(x, y));
            if (pos.x < this.bm.BattleMap.mapSize.width / 2) {
                towerIds.leftTower = fGo.id;
            } else {
                towerIds.rightTower = fGo.id;
            }
        }
    }

      
    createFighterTop(fighterTop: FighterTop, fGo: FlighterGameObjcet, roleSprite: Sprite) {
        let _fighterTop = instantiate(fighterTop.node).getComponent(FighterTop);
        this.BZIndex.addFighterTop(_fighterTop.node, this.isFly(fGo.props.GetValue(core.PropType.PropTypeProtoId).i32));
        _fighterTop.init(fGo, roleSprite);
        this.fighterTop.set(fGo.id, _fighterTop);
    }
    getFighterTop(fId: number) {
        return this.fighterTop.get(fId);
    }
      
    updFighterTop(fChange: core.IFighter) {
        let fTop = this.fighterTop.get(fChange.id);
        fTop?.updGo(fChange)
    }
      
    delFighterTop(fId: number) {
        let fTop = this.fighterTop.get(fId);
        if (fTop) {
            this.BZIndex.delFighterTop(fTop.node, this.isFly(fTop.fGo.props.GetValue(core.PropType.PropTypeProtoId).i32));
            this.fighterTop.delete(fId);
        }
    }

    getKingPos(team: core.Team) {
        let king: Flighter = null;
        if (team == core.Team.Blue) {
            king = this.flighters.get(this.blueTowerIds.centerTower);
        } else {
            king = this.flighters.get(this.redTowerIds.centerTower);
        }
        if (king) {
            return king.node.getPosition();
        } else {
            return Vec3.ZERO;
        }
    }

    getKingWPos(team: core.Team) {
        let king: Flighter = null;
        if (team == core.Team.Blue) {
            king = this.flighters.get(this.blueTowerIds.centerTower);
        } else {
            king = this.flighters.get(this.redTowerIds.centerTower);
        }
        if (king) {
            return king.node.getWorldPosition();
        } else {
            return Vec3.ZERO;
        }
    }

      
    autoBattleEnd(endCB: Function, winner: core.Team) {
        let subHP = (id: number, hp: number, team: core.Team) => {
            let f = this.fighterTop.get(id);
            if (f) {
                f._hp -= hp;
                if (f._hp <= 0) {
                    if (team != winner) {
                        f.updHp();
                        this.flighters.get(id).die();
                        return true;
                    }
                } else {
                    f.updHp();
                }
            }
            return false;
        }

        let red = [
            this.redTowerIds.centerTower,
            this.redTowerIds.leftTower,
            this.redTowerIds.rightTower,
        ]
        let blue = [
            this.blueTowerIds.centerTower,
            this.blueTowerIds.leftTower,
            this.blueTowerIds.rightTower,
        ]

        let maxHp = this.flighters.get(this.redTowerIds.centerTower).fGo.props.GetValue(core.PropType.PropTypeHpMax).i32;
        let _t = 10 / maxHp;
        let minHp = maxHp;
        let f = red.concat(blue);
        f.forEach(e => {
            let hp = this.flighters.get(e)?.fGo.props.GetValue(core.PropType.PropTypeHp).i32;
            if (hp)
                minHp = Math.min(hp, minHp);
        })

        let t = minHp * _t;
        let defHp = 0;

        let cb = (hp: number) => {
            let bf = false;
            for (let index = 0; index < red.length; index++) {
                const id = red[index];
                bf = subHP(id, hp, core.Team.Red);
                if (bf) { return bf; }
            }
            for (let index = 0; index < blue.length; index++) {
                const id = blue[index];
                bf = subHP(id, hp, core.Team.Blue);
                if (bf) { return bf; }
            }
        }
        let animNode = new Node();
        this.bm.Battle.node.addChild(animNode);
        animNode.setPosition(v3(0))
        tween(animNode)
            .to(t, { position: v3(minHp) },
                {
                    onUpdate() {
                        let hp = Math.floor(animNode.getPosition().x);
                        let _hp = hp - defHp;
                        defHp = hp;
                        let bf = cb(_hp);
                        if (bf) {
                            animNode.destroy();
                            endCB && endCB();
                        }
                    }
                }
            ).start();

        tween(this.bm.Battle)
            .delay(0.5)
            .call(() => {
                for (let index = 0; index < blue.length; index++) {
                    const id = blue[index];
                    let f = this.flighters.get(id);
                    if (f) {
                        f.dmgFlash(true);
                    }
                }
                for (let index = 0; index < red.length; index++) {
                    const id = red[index];
                    let f = this.flighters.get(id);
                    if (f) {
                        f.dmgFlash(true);
                    }
                }
            })
            .union()
            .repeatForever()
            .start();

    }

      
    isFly(heroId: number) {
        let protoId = heroId;
        let cardInfo = TableHeroes.getInfoById(protoId);
        let bf = false;
        if (cardInfo.type == core.UnitType.UnitFlyer) {
            bf = true;
        }
        return bf;
    }
      
    isMagic(heroId: number) {
        let protoId = heroId;
        let cardInfo = TableHeroes.getInfoById(protoId);
        let bf = false;
        if (cardInfo.type == core.UnitType.UnitBomb) {
            bf = true;
        }
        return bf;
    }

      
    calcBornTime(fGos: FlighterGameObjcet[]) {
        let fs: { [key: string]: { pos: Vec3, t: number, isBlue: boolean }[] } = {};
        // let heroes: { [key: string]: HeroCfg } = {}
        fGos.forEach(fGo => {
            if (fGo.props.GetValue(core.PropType.PropTypeState).i32 == core.FighterState.FighterBorn
                && fGo.props.GetValue(core.PropType.PropTypeTowerType).i32 == core.TowerType.TowerTypeNone) {
                let callerId = fGo.props.GetValue(core.PropType.PropTypeCallerId).i32;
                if (!!!callerId) {   
                    // let cardProtoId = fGo.props.GetValue(core.PropType.PropTypeCardProtoId).i32;
                    let protoId = fGo.props.GetValue(core.PropType.PropTypeProtoId).i32;
                    let armyId = fGo.props.GetValue(core.PropType.PropTypeArmyId).i32;
                    let t = fGo.props.GetValue(core.PropType.PropTypeBornCastMs).i32;
                    let _pos = v2(fGo.props.GetValue(core.PropType.PropTypePosX).i32, fGo.props.GetValue(core.PropType.PropTypePosY).i32)
                    let team = fGo.props.GetValue(core.PropType.PropTypeTeam).i32;
                    let isBlue = team == BattleManger.getInstance().meTeam ? true : false;

                    let pos = BattleManger.getInstance().sToCPos(v2(_pos.x, _pos.y));
                    let key = `${protoId}_${armyId}`;

                    fs[key] = fs[key] ? fs[key] : [];
                    fs[key].push({
                        pos: v3(pos.x, pos.y),
                        t: t,
                        isBlue: isBlue,
                    });

                    // heroes[key] = TableHeroes.getInfoById(protoId);
                }
            }
        })

        for (const key in fs) {
            let d = fs[key];
            if (d.length > 0) {
                let p: Vec3[] = [];
                for (const item of d) {
                    p.push(item.pos);
                }
                let pos = CommonUtil.getCenterPoint(p);
                this.showBronTime(d[0].t, d[0].isBlue, v3(pos.x, pos.y));
            }
        }
    }
      
    showDieEffect(parentNode: Node, wPos: Vec3, cb: Function, towerType: core.TowerType, hero: HeroCfg) {
        let battlePrefabs = this.bm.battlePrefabs;
        let node: Node = instantiate(battlePrefabs[BattlePrefabs.BattleDieEffect]);;
        parentNode.addChild(node);
        node.setWorldPosition(wPos);
        node.getComponent(BattleDieEffectCmp).show(towerType, hero, () => {
            cb && cb();
        });
    }
      
    showBronEffect(parentNode: Node, isBlue: boolean) {
        let battlePrefabs = this.bm.battlePrefabs;
        let node = instantiate(battlePrefabs[BattlePrefabs.BattleBornEffect]);
        parentNode.addChild(node);
        node.getComponent(BattleBornEffectCmp).show(() => {
            node.destroy();
        });
    }
      
    showBronCostEffect(pos: Vec3, cost: number) {
        let battlePrefabs = this.bm.battlePrefabs;
        let node = instantiate(battlePrefabs[BattlePrefabs.BattleBornCost]);
        let _pos = this.bm.BattleMap.UITransform.convertToWorldSpaceAR(pos);
        let __pos = this.bm.Battle.fgNode.getComponent(UITransform).convertToNodeSpaceAR(_pos);
        this.bm.Battle.fgNode.addChild(node);
        node.setPosition(__pos);
        node.getComponent(BattleBornCostCmp).show(cost, () => {
            node.destroy();
        });
    }
      
    showBronTime(timeMs: number, isBlue: boolean, pos: Vec3) {
        let battlePrefabs = this.bm.battlePrefabs;
        let node = instantiate(battlePrefabs[BattlePrefabs.BattleBornTime]);
        let _pos = this.bm.BattleMap.UITransform.convertToWorldSpaceAR(pos);
        let __pos = this.bm.Battle.fgNode.getComponent(UITransform).convertToNodeSpaceAR(_pos);
        this.bm.Battle.fgNode.addChild(node);
        node.setPosition(__pos);
        node.getComponent(BattleBornTimeCmp).show(timeMs, isBlue, () => {
            node.destroy();
        });
    }
}