import { _decorator, Component, EventTouch, UITransform, v3, Vec2, Label, v2, Vec3, SpriteFrame, find, Sprite, Node, instantiate, tween, easing, Tween, UIOpacity, Animation, log } from 'cc';
import { resLoader } from '../../../core/common/loader/ResLoader';
import { Logger } from '../../../core/common/log/Logger';
import { LanguageLabel } from '../../../core/gui/language/LanguageLabel';
import { oops } from '../../../core/Oops';
import { CommonUtil } from '../../../core/utils/CommonUtil';
import TableCards from '../../common/table/TableCards';
import TableGlobalConfig from '../../common/table/TableGlobalConfig';
import TableHeroes, { HeroCfg } from '../../common/table/TableHeroes';
import TableSkill from '../../common/table/TableSkill';
import TableSkillEffect from '../../common/table/TableSkillEffect';
import TableSummonOffset from '../../common/table/TableSummonOffset';
import { BattleManger } from '../BattleManger';
import { MapPlacedArea } from '../BattleMap';
import { BattleZIndexManager } from '../BattleZIndexManager';
import { FighterManager } from '../flighter/FighterManager';
import { BattlePowerType } from '../utils/BattleEnum';
import { BattleUtils } from '../BattleUtils';
const { ccclass, property } = _decorator;

@ccclass('BattleCard')
export class BattleCard extends Component {
    @property(Sprite)
    cardSp: Sprite
    @property(Label)
    cardCostLbl: Label
    pb: Sprite
    isTouchStart = false;
    defPos: Vec3 = v3();

    cardId: number = 0;
    isNextCard: boolean = false;
    heroModel: Node = null;
    onLoad() {
        // this.defPos = this.node.getPosition();
    }

    update(deltaTime: number) {
        if (this.pb && !this.isNextCard) {
            let bc = BattleManger.getInstance().Battle.battleCards;
            if (bc.allTime == 0) return;
            let card = TableCards.getInfoById(this.cardId);

            let singleTime = bc.singleTime;;
            let allTime = card.cost * singleTime;
            if (bc.curTime >= allTime) {
                this.pb.fillRange = 0;
                this.cardSp.grayscale = false;
            } else {
                this.cardSp.grayscale = true;
                this.pb.fillRange = 1 - bc.curTime / allTime;
            }
        }
    }

    shakeTween: Tween<Node>
    showAct(idx: number) {
        if (this.shakeTween) {
            this.shakeTween.start();
        } else {
            // this.shakeTween = tween(this.cardSp.node)
            //     .to(0.3, { angle: -3 })
            //     .to(0.3, { angle: 3 })
            //     .union()
            //     .repeatForever()
            //     .start();
            this.shakeTween = tween(this.cardSp.node)
                .delay(idx / 10)
                .to(0.1, { eulerAngles: v3(0, 0, 2) })
                .to(0.1, { eulerAngles: v3(0, 0, 0) })
                .to(0.1, { eulerAngles: v3(0, 0, 2) })
                .to(0.1, { eulerAngles: v3(0, 0, 0) })
                .to(0.1, { eulerAngles: v3(0, 0, 2) })
                .to(0.1, { eulerAngles: v3(0, 0, 0) })
                .delay(0.2)
                .union()
                .repeatForever()
                .start();
        }
    }
    hideAct() {
        if (this.shakeTween) {
            this.shakeTween.stop();
            this.cardSp.node.angle = 0;
        }
    }

    async updCard(cardId: number, isNextCard: boolean = false, isInit: boolean = false) {
        this.pb = find('pb', this.node).getComponent(Sprite);

        let isAct = this.cardId == 0 || this.cardId != cardId;
        if (isInit) isAct = false;

        this.cardId = cardId;
        let card = TableCards.getInfoById(cardId);
        this.getComponentInChildren(Label).string = `${card.Id}`;

        if (BattleManger.getInstance().isTest) {
            this.node.getChildByName("testNode").active = true;
            let testNode = this.node.getChildByName("testNode");
            find("name", testNode).getComponent(Label).string = `${card.inn_name}`;
            find("lv", testNode).getComponent(Label).string = `lv:${card.level}`;
        } else {
            this.node.getChildByName("testNode").active = false;
        }

        let res = await card.res_name;
        this.cardCostLbl.string = `${card.cost}`;
        this.cardCostLbl.node.getComponentInChildren(Label).string = this.cardCostLbl.string;
        this.cardSp.spriteFrame = res;
        this.pb.spriteFrame = res;

        this.isNextCard = isNextCard;

        if (isAct && isNextCard == false) {
            this.showCardAct();
        }
        if (isNextCard) {
            this.node.getComponent(UIOpacity).opacity = 0;
            if (this.nextCdAct) {
                this.nextCdAct.stop();
            }
            this.cardSp.grayscale = true;
            this.nextCdAct = tween(this.node)
                .delay(2)
                .call(() => {
                    this.cardSp.grayscale = false;
                })
                .start();
            this.node.getComponent(UIOpacity).opacity = 255;
            // this.node.active = true;
        }
    }
    nextCdAct: Tween<Node> = null;
      
    isUse() {
        if (!this.node.active) return false;
        if (this.isNextCard) return false;
        if (BattleManger.getInstance().gameState >= core.BattleState.BattleSettle) return false;
        let bf = Math.abs(this.pb?.fillRange) == 0;
        return bf;
    }

      
    showCardAct(t: number = -1) {
        this.node.active = false;
        let tt = t;
        if (t == -1) {
            tt = 0;
        }

        let card = TableCards.getInfoById(this.cardId);

        let nextNode = BattleManger.getInstance().Battle.battleCards.nextBattleCard.node;
        let pos = nextNode.getPosition();
        let targetPos = this.cardSp.node.getComponent(UITransform).convertToWorldSpaceAR(Vec3.ZERO);
        targetPos = nextNode.parent.getComponent(UITransform).convertToNodeSpaceAR(targetPos);
        let n = instantiate(this.cardSp.node);
        n.setPosition(pos);
        n.setScale(v3(0.7, 0.7, 0.7));
        n.active = true;
        nextNode.parent.addChild(n);
        tween(n)
            .call(async () => {
                n.getComponent(Sprite).spriteFrame = await card.res_name;
            })
            .delay(tt)
            .call(() => {
                if (t >= 0)
                    oops.audio.playEffect('audios/');
            })
            .parallel(
                tween(n).to(0.5, { position: targetPos }, { easing: easing.backOut }),
                tween(n).to(0.5, { scale: v3(1, 1, 1) }, { easing: easing.backOut }),
            )
            .call(() => {
                this.node.active = true;
                n.destroy();
            })
            .start();

        // let node = this.cardSp.node;
        // node.setPosition(v3(0, -120, 0));
        // this.pb.node.active = false;
        // tween(node)
        //     .to(1, { position: v3(0, 4, 0) }, { easing: easing.backOut })
        //     .call(() => {
        //         if (this.isNextCard == false)
        //             this.pb.node.active = true;
        //     })
        //     .start();
    }

    public onTouchStart(event: EventTouch) {
        if (!this.isUse()) return;
        this.isTouchStart = true;

        let bm = BattleManger.getInstance();
        let fm = FighterManager.getInstance();
        if (this.enemyArea() == false) {
            let towerIds = bm.meTeam == core.Team.Blue ? fm.redTowerIds : fm.blueTowerIds;
            BattleManger.getInstance().Battle.battleInfo.battleTouchFighterCmp.show(towerIds);
        }

        let card = TableCards.getInfoById(this.cardId);
        bm.Battle.battleCards.showCostBg(card.cost);
    }
    // public onTouchMove(UIDelta: Vec2, UILocation: Vec2) {
    //     if (this.isNextCard) return;
    //     // if (!this.isTouchStart) return;
    //     let pos = this.node.getPosition();
    //     let x = pos.x + UIDelta.x;
    //     let y = pos.y + UIDelta.y;

    //     let m = 200 - (y - this.defPos.y) + 50;
    //     m = m > 0 ? m : 0;
    //     let s = Math.min(m / 200, 1);
    //     this.node.setScale(s, s, s);

    //     let p = this.inGrid(UILocation);
    //     if (p) {
    //         let _p = this.node.parent.getComponent(UITransform).convertToNodeSpaceAR(p);
    //         if (!this.node.getPosition().equals(_p)) {
    //             let bm = BattleManger.getInstance();
    //             let _pos = bm.BattleMap.UITransform.node.parent.getComponent(UITransform).convertToNodeSpaceAR(p);
    //             if (_pos.x >= 0 && _pos.x <= bm.BattleMap.mapSize.width && _pos.y >= 0 && _pos.y <= bm.BattleMap.mapSize.width) {
    //                 if (this.isPlacedArea(_pos)) {
    //                     this.node.setPosition(_p);
    //                 }
    //             }
    //         }
    //         s = 0.25;
    //         this.node.setScale(s, s, s);
    //     } else {
    //         this.node.setPosition(v3(x, y));
    //     }
    // }
    public onTouchMove(event: EventTouch) {
        if (!this.isTouchStart) return;
        if (!this.isUse()) return;
        let pos = this.node.getPosition();
        let x = pos.x + event.getUIDelta().x;
        let y = pos.y + event.getUIDelta().y;

        let m = 200 - (y - this.defPos.y) + 50;
        m = m > 0 ? m : 0;
        let s = Math.min(m / 200, 1);
        this.node.setScale(s, s, s);

        let card = TableCards.getInfoById(this.cardId);
        let hero = TableHeroes.getInfoById(card.summons[0].id);
        let isBuild = hero.type == core.UnitType.UnitBuilding;
        let p = this.inGrid(event.getUILocation());
        if (p) {
            let _p = this.node.parent.getComponent(UITransform).convertToNodeSpaceAR(p);
            if (!this.node.getPosition().equals(_p)) {
                let wP = this.node.getComponent(UITransform).convertToWorldSpaceAR(Vec3.ZERO);
                let p1 = v3(p.x, wP.y);
                let p2 = v3(wP.x, p.y);
                let bm = BattleManger.getInstance();
                if (this.canBePlaced(p, isBuild)) {
                    let _pos = bm.BattleMap.UITransform.node.parent.getComponent(UITransform).convertToNodeSpaceAR(p);
                    this.node.setPosition(_p);
                    this.heroModel = BattleUtils.showHeroModel(this.heroModel, this.cardId, _pos, bm.meTeam);
                } else if (this.canBePlaced(p1, isBuild)) {   
                    let _pos = bm.BattleMap.UITransform.node.parent.getComponent(UITransform).convertToNodeSpaceAR(p1);
                    this.node.setPosition(this.node.parent.getComponent(UITransform).convertToNodeSpaceAR(p1));
                    this.heroModel = BattleUtils.showHeroModel(this.heroModel, this.cardId, _pos, bm.meTeam);
                } else if (this.canBePlaced(p2, isBuild)) {   
                    let _pos = bm.BattleMap.UITransform.node.parent.getComponent(UITransform).convertToNodeSpaceAR(p2);
                    this.node.setPosition(this.node.parent.getComponent(UITransform).convertToNodeSpaceAR(p2));
                    this.heroModel = BattleUtils.showHeroModel(this.heroModel, this.cardId, _pos, bm.meTeam);
                }
                let __pos = this.getPlaceCardPos();
                if (!!__pos) {
                      
                    BattleManger.getInstance().prePlaceCard(this.cardId, __pos.x, __pos.y);
                }
            }
            // s = 0.25;
            s = 0;
            this.node.setScale(s, s, s);
        } else {
            BattleUtils.hideHeroModel(this.heroModel, this.cardId);
            this.node.setPosition(v3(x, y));
        }
        this.node.getComponent(UIOpacity).opacity = 255 * s;
    }
    public async onTouchEnd(event: EventTouch) {
        if (!this.isTouchStart) return;
        BattleManger.getInstance().Battle.battleCards.hideCostBg();
        BattleManger.getInstance().Battle.battleInfo.battleTouchFighterCmp.hide();

        this.isTouchStart = false;
        let bf = true;

        // let pos = event.getUILocation();
        let __pos = this.getPlaceCardPos();
        if (!!__pos) {
            bf = !await BattleManger.getInstance().placeCard(this.cardId, __pos.x, __pos.y);
        }

        if (bf) {
            this.node.setPosition(v3(this.defPos.x, 20));
        } else {
            this.node.setPosition(v3(this.defPos.x, 0));
              
            BattleManger.getInstance().prePlaceCard(this.cardId, -1, -1);
        }
        // this.node.setScale(1, 1, 1);
        // this.node.getComponent(UIOpacity).opacity = 255;
        this.setNodeDef();
        this.node.active = bf;
    }

    setNodeDef() {
        BattleUtils.hideHeroModel(this.heroModel, this.cardId, true);
        this.heroModel = null;
        this.node.setScale(1, 1, 1);
        this.node.getComponent(UIOpacity).opacity = 255;
    }

    getPlaceCardPos() {
        let pos = this.node.getComponent(UITransform).convertToWorldSpaceAR(Vec3.ZERO);
        let battleMap = BattleManger.getInstance().BattleMap;
        let _pos = this.worldPosToMapPos(pos);
        if (_pos.x >= 0 && _pos.x <= battleMap.mapSize.width && _pos.y >= 0 && _pos.y <= battleMap.mapSize.height) {
            let __pos = BattleManger.getInstance().cToSPos(v2(_pos.x, _pos.y));
            if (this.isUse()) {
                return __pos;
            }
        }
        return null;
    }



    inGrid(pos: Vec2) {
        let bpa = BattleManger.getInstance().BattlePlacedArea;
        return bpa.getTilePosByWorld(v3(pos.x, pos.y));
    }

    canBePlaced(wPos: Vec3, isBuild: boolean) {
        let bm = BattleManger.getInstance();
        let area = BattleManger.getInstance().BattlePlacedArea.touchGrid.size;
        let w = area.width;
        let h = area.height;
        let cb = (p) => {
            let _pos = bm.BattleMap.UITransform.node.parent.getComponent(UITransform).convertToNodeSpaceAR(p);
            if (_pos.x >= 0 && _pos.x <= bm.BattleMap.mapSize.width && _pos.y >= 0 && _pos.y <= bm.BattleMap.mapSize.height) {
                if (this.isPlacedArea(_pos) && this.notPlacedBuildingByWorldPos(p)) {
                    return true;
                }
            }
            return false;
        }
        let pos = [wPos];
        if (isBuild) {
            pos = [
                // v3(wPos.x, wPos.y + h * 2),
                v3(wPos.x - w / 2, wPos.y + h), v3(wPos.x, wPos.y + h), v3(wPos.x + w / 2, wPos.y + h),
                v3(wPos.x - w / 2, wPos.y), v3(wPos.x, wPos.y), v3(wPos.x + w / 2, wPos.y),
                v3(wPos.x - w / 2, wPos.y - h), v3(wPos.x, wPos.y - h), v3(wPos.x + w / 2, wPos.y - h),
                // v3(wPos.x, wPos.y - h * 2),
            ];
        } else {
            pos = [
                v3(wPos.x, wPos.y + h),
                v3(wPos.x, wPos.y),
                // v3(wPos.x, wPos.y - h),
            ];
            // pos = [
            //     v3(wPos.x - w, wPos.y + h), v3(wPos.x, wPos.y + h), v3(wPos.x + w, wPos.y + h),
            //     v3(wPos.x - w, wPos.y), v3(wPos.x, wPos.y), v3(wPos.x + w, wPos.y),
            //     v3(wPos.x - w, wPos.y - h), v3(wPos.x, wPos.y - h), v3(wPos.x + w, wPos.y - h),
            // ];
        }
        let flag = true;
        for (const p of pos) {
            if (!cb(p)) {
                flag = false;
                break;
            }
        }
        return flag;
    }

      
    isPlacedArea(_pos: Vec3) {
        let bf = false;
        let bm = BattleManger.getInstance();
        let fm = FighterManager.getInstance();
        let towerIds = bm.meTeam == core.Team.Blue ? fm.redTowerIds : fm.blueTowerIds;
        let meTowerIds = bm.meTeam == core.Team.Blue ? fm.blueTowerIds : fm.redTowerIds;
          
        let mapPlacedArea = bm.BattleMap.getBluePlacedArea(_pos.x, _pos.y);
        if (mapPlacedArea == MapPlacedArea.BLOCK) {   
            bf = false;
        } else if (mapPlacedArea == MapPlacedArea.PLACEDAREA) {   
            bf = true;
        } else if (mapPlacedArea == MapPlacedArea.PLACEDAREALEFT) {   
            bf = towerIds.leftTower == 0;
            if (bf == false) {
                bf = this.enemyArea();
            }
        } else if (mapPlacedArea == MapPlacedArea.PLACEDAREARIGHT) {   
            bf = towerIds.rightTower == 0;
            if (bf == false) {
                bf = this.enemyArea();
            }
        } else if (mapPlacedArea == MapPlacedArea.PLACEDAREALEFTME) {   
            bf = meTowerIds.leftTower == 0;
            if (bf == false) {
                bf = this.meTowerArea();
            }
        } else if (mapPlacedArea == MapPlacedArea.PLACEDAREARIGHTME) {   
            bf = meTowerIds.rightTower == 0;
            if (bf == false) {
                bf = this.meTowerArea();
            }
        } else {
            bf = this.enemyArea();
        }
        return bf;
    }

      
    meTowerArea() {
        let card = TableCards.getInfoById(this.cardId);
        let idx = card.summons.findIndex((v, k) => {
            let bf = TableHeroes.getInfoById(v.id).type == core.UnitType.UnitBuilding ||
                TableHeroes.getInfoById(v.id).type == core.UnitType.UnitGround ||
                TableHeroes.getInfoById(v.id).type == core.UnitType.UnitFlyer ||
                TableHeroes.getInfoById(v.id).type == core.UnitType.UnitTower;
            return bf;
        })
        return idx == -1;
    }
      
    enemyArea() {
        let card = TableCards.getInfoById(this.cardId);
        return card.cast_range == core.CastRange.CastRangeFull;
    }

    worldPosToMapPos(pos: Vec3) {
        let mapUITransform = BattleManger.getInstance().BattleMap.UITransform;
        let _pos = mapUITransform.convertToNodeSpaceAR(v3(pos.x, pos.y));
        return _pos;
    }

      
    notPlacedBuildingByWorldPos(_pos: Vec3) {
        let bpa = BattleManger.getInstance().BattlePlacedArea;
        let fs = FighterManager.getInstance().flighters.values();
        let __pos = bpa.getTileWroldPos(_pos);
        for (const f of fs) {
            let protoId = f.fGo.props.GetValue(core.PropType.PropTypeProtoId).i32;
            let heroInfo = TableHeroes.getInfoById(protoId);
            if (heroInfo.type == core.UnitType.UnitBuilding) {
                let pos = f.node.getComponent(UITransform).convertToWorldSpaceAR(Vec3.ZERO);
                let ___pos = bpa.getTileWroldPos(pos);
                let dx = 2
                if (__pos.x <= ___pos.x + dx
                    && __pos.x >= ___pos.x - 1
                    && __pos.y <= ___pos.y + 1
                    && __pos.y >= ___pos.y - 1
                ) {
                    return false;
                }
            }
        }
        return true;
    }
}

