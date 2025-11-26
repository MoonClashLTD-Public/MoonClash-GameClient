import { Animation, Label, Node, Sprite, UIOpacity, Vec3, easing, instantiate, tween, v3 } from "cc";
import TableCards from "../common/table/TableCards";
import TableHeroes, { HeroCfg } from "../common/table/TableHeroes";
import { FighterManager } from "./flighter/FighterManager";
import { BattleZIndexManager } from "./BattleZIndexManager";
import { LanguageLabel } from "../../core/gui/language/LanguageLabel";
import { BattleManger } from "./BattleManger";
import TableSkill from "../common/table/TableSkill";
import TableSkillEffect from "../common/table/TableSkillEffect";
import { CommonUtil } from "../../core/utils/CommonUtil";
import TableSummonOffset from "../common/table/TableSummonOffset";
import { Logger } from "../../core/common/log/Logger";

export class BattleUtils {
      
    static showHeroModel(heroModel: Node, cardId: number, pos: Vec3, team: core.Team) {
        if (!heroModel) {
            let isBlue = BattleManger.getInstance().getDisplayColorByTeam(team) == core.Team.Blue;
            let isMe = BattleManger.getInstance().meTeam == team;   

            let card = TableCards.getInfoById(cardId);
            let base = instantiate(BattleManger.getInstance().Battle.battleCards.heroPlace);   
            base.active = true;
            heroModel = base;
            let isFly = FighterManager.getInstance().isFly(card.summons[0].id);
            let isMagic = FighterManager.getInstance().isMagic(card.summons[0].id);
            BattleZIndexManager.getInstance().addFighter(heroModel, isFly, isMagic);
            let tipsNode = base.getChildByName("tipsNode");
            tipsNode.getChildByName("name").getComponent(LanguageLabel).dataID = `${card.name}`;
            tipsNode.getChildByName("lv").getComponent(Label).string = `lv.${card.level}`;
            let radiusNode = base.getChildByName("radiusNode");
            if (card.summons.length == 1) {
                let cardInfo = TableHeroes.getInfoById(card.summons[0].id);
                if (cardInfo.type == core.UnitType.UnitBuilding
                    || cardInfo.skill_born_place == core.SkillBornPlace.SkillBornPlaceKingTower
                    || cardInfo.skill_born_place == core.SkillBornPlace.SkillBornPlaceInPlace
                ) {
                      
                    let isDmg = (skIds: number[]) => {
                        for (const id of skIds) {
                            for (const eId of TableSkill.getInfoById(id).effect_ids) {
                                let eInfo = TableSkillEffect.getInfoById(eId);
                                if (eInfo.type == skill.EffectType.EffectTypeAtk) {
                                    return true;
                                }
                            };
                        }
                        return false;
                    }
                    if (isDmg(cardInfo.sk_ids))
                        if (cardInfo.threat_radius > 0) {
                            let r = CommonUtil.findHypotenuse(cardInfo.collision.width, cardInfo.collision.height) / 2;
                            let s = cardInfo.threat_radius / (22.2 + r);
                            radiusNode.setScale(v3(s, s, s));
                            radiusNode.active = true;
                        }
                }
            }
            let bg = base.getChildByName("bg");
            tween(bg)
                .call(() => {
                    bg.setScale(v3(2, 2, 2));
                })
                .to(3, { scale: v3(1, 1, 1) }, { easing: easing.smooth })
                .union()
                .repeatForever()
                .start();

            let rolePrefabs = BattleManger.getInstance().rolePrefabs;
            let addHeroModel = (hero: HeroCfg, pos: Vec3) => {
                let roleNode = instantiate(rolePrefabs[hero.res_name]);
                base.addChild(roleNode);
                roleNode.setPosition(pos);

                let roleSpr = roleNode.getChildByName('sprite_b')?.getComponent(Sprite);
                if (roleSpr && roleSpr.spriteFrame) {
                    let h = roleSpr.spriteFrame.rect.height
                    tipsNode.setPosition(v3(0, roleSpr.node.position.y + h + 20, 0));
                } else {
                    tipsNode.setPosition(v3(0, 100, 0));
                }

                roleNode.addComponent(UIOpacity).opacity = 180;
                roleNode.getChildByName("shadow").active = false;
                let anim = roleNode.getComponent(Animation);
                if (anim.getState('place')) {
                    roleNode.getComponent(Animation).play('place');
                } else {
                    let idle = isMe ? "idle8" : "idle0"
                    roleNode.getComponent(Animation).play(idle);
                }

                // ======================================================================
                let _roleSpr: Sprite = null;
                roleNode.getChildByName('sprite_r').active = false;
                roleNode.getChildByName('sprite_b').active = false;
                if (isBlue) {
                    _roleSpr = roleNode.getChildByName('sprite_b').getComponent(Sprite);
                } else {
                    _roleSpr = roleNode.getChildByName('sprite_r').getComponent(Sprite);
                }
                _roleSpr.node.active = true;
            }

            for (const summon of card.summons) {
                let hero = TableHeroes.getInfoById(summon.id);
                for (let index = 0; index < summon.count; index++) {
                    if (summon.offset_id) {
                        // let offset = TableSu
                        let info = TableSummonOffset.getInfoById(summon.offset_id);
                        let pos = Vec3.ZERO;
                        if (info?.offsets[index]) {
                            let ratio = BattleManger.getInstance().mapSizeRatio;
                            pos = v3(info.offsets[index].x * ratio, info.offsets[index].y * ratio, 0);
                        } else {
                            Logger.erroring("TableSummonOffset error: summon.offset_id " + summon.offset_id);
                        }
                        addHeroModel(hero, pos);
                    } else {
                        addHeroModel(hero, v3(0, 0, 0));
                    }
                }
            }

        }
        // let pos = BattleManger.getInstance().BattleMap.UITransform.node.parent.getComponent(UITransform).convertToNodeSpaceAR(uiPos);
        heroModel.active = true;
        heroModel.setPosition(pos);
        return heroModel;
    }
    static hideHeroModel(heroModel: Node, cardId: number, isDestory: boolean = false) {
        if (heroModel && isDestory) {
            let card = TableCards.getInfoById(cardId);
            let hero = TableHeroes.getInfoById(card.summons[0].id);
            let isFly = FighterManager.getInstance().isFly(hero.Id);
            BattleZIndexManager.getInstance().delFighter(heroModel, isFly);
            heroModel = null;
        } else if (heroModel) {
            heroModel.active = false;
        }
    }
}