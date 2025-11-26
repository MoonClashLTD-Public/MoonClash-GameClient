import { LanguageData } from "../../../core/gui/language/LanguageData"
import { LangLabelParamsItem } from "../../../core/gui/language/LanguageLabel"
import { PlayerManger } from "../../data/playerManager"
import { ATK_TYPES, CsPropType, ICardAttrCfg, IDispostionCfg, LOCAL_ATTRS, LOCAL_ATTR_SKILLS } from "../contants/CardCost"
import TableAttrs from "../table/TableAttrs"
import TableCards, { CardCfg } from "../table/TableCards"
import TableFighterAi from "../table/TableFighterAi"
import TableHeroes from "../table/TableHeroes"
import TableSkill from "../table/TableSkill"
import TableSkillEffect from "../table/TableSkillEffect"
import TableSkillEffectCall from "../table/TableSkillEffectCall"

export class CardUtils {

    public static isToDay(time: number) {
        function padTo2Digits(num) {
            return num.toString().padStart(2, '0');
        }
        const date = new Date();
        // const gmtDateTime = date.toUTCString();
        let str = [
            padTo2Digits(date.getUTCFullYear()),
            padTo2Digits(date.getUTCMonth() + 1),
            padTo2Digits(date.getUTCDate()),
        ].join('');
        return time == Number(str)
    }

      
    public static formatSkillUnits(units: core.UnitType[]): string | undefined {
        const len = units?.length ?? 0
          
        if (len == 0) return 'card_attr_Target1'
          
        let flyer = 0
          
        let ground = 0
          
        let building = 0
          
        let bomb = 0
        let tower = 0
        for (const u of units) {
            if (u == core.UnitType.UnitBuilding) {
                building++
            } else if (u == core.UnitType.UnitGround) {
                ground++
            } else if (u == core.UnitType.UnitFlyer) {
                flyer++
            } else if (u == core.UnitType.UnitBomb) {
                bomb++
            } else if (u == core.UnitType.UnitTower) {
                tower++
            }
        }
        if (flyer > 0) return 'card_attr_Target1'
        if (tower > 0 && ground > 0) return 'card_attr_Target2'
        if (building > 0 && ground == 0) return 'card_attr_Target3'
        if (bomb > 0) return 'card_attr_Target4'
        return
    }

    public static formatHeroesUnit(unit: core.UnitType): string | undefined {
        switch (unit) {
            case core.UnitType.UnitBuilding:
                return 'card_unitType_1'
            case core.UnitType.UnitGround:
                return 'card_unitType_2'
            case core.UnitType.UnitFlyer:
                return 'card_unitType_3'
            case core.UnitType.UnitBomb:
                return 'card_unitType_4'
            case core.UnitType.UnitTower:
                return 'card_unitType_5'
            default:
                break;
        }
    }


    public static getCardAttrItems(params: { netId?: number, cfgId?: number, netCard?: core.ICard }): ICardAttrCfg[] {
        const netId = params?.netId
        const cfgId = params?.cfgId
        const netCard = params?.netCard
        if (!netId && !cfgId && !netCard) return [];
        const cardManager = PlayerManger.getInstance().cardManager.playCard
        let cardCfg: CardCfg
        let nextCfg: CardCfg
        let isMax = false
        if (netId) {
            cardCfg = cardManager.getTableCfgByNetId(netId)
            nextCfg = cardManager.getNextTableCfgByNetId(netId)
            isMax = !!!nextCfg
        } else if (netCard) {
            cardCfg = TableCards.getInfoByProtoIdAndLv(netCard.protoId, netCard.level);
            nextCfg = TableCards.getInfoByProtoIdAndLv(netCard.protoId, netCard.level + 1);
            isMax = !!!nextCfg
        } else {
            cardCfg = cardManager.getTableCfgByLIdMixLevel(cfgId)
            isMax = true
        }
        if (!cardCfg) return []
        return CardUtils.formatCardAttrItems(isMax, cardCfg, nextCfg) || []
    }

    public static formatCardAttrItems(isMax: boolean, cardCfg: CardCfg, nextCfg: CardCfg) {
        const attrs: ICardAttrCfg[] = []
        const summons = cardCfg.summons || []
        const nextSummons = nextCfg?.summons || []
        if (!isMax && summons.length != nextSummons.length) return
        if (summons.length == 1) {
            const summon = summons[0]
            const heroInfo = TableHeroes.getInfoById(summon.id)
            const nextSummon = isMax ? undefined : nextSummons[0]
            const nextHeroInfo = isMax ? undefined : TableHeroes.getInfoById(nextSummon.id)
            if (!isMax && heroInfo?.props?.length != nextHeroInfo?.props?.length) return

              
            const _cfgHeros = this.getICardAttrCfg(CsPropType.PropTypeHeros)
            if (_cfgHeros) {
                const _count = summon?.count ?? 1
                if (_count > 1) {
                    const _changeCfg: ICardAttrCfg = _cfgHeros
                    _changeCfg.isMaxLevel = isMax
                    // _changeCfg.name = `${heroInfo?.inn_name}`
                    _changeCfg.name = `${LanguageData.getLangByID(heroInfo?.name)}`
                    _changeCfg.num1 = `${_count}`
                    attrs.push(_changeCfg)
                }
            }

            for (const key in heroInfo.props) {
                const currProp = heroInfo.props[key]
                const nextProp = isMax ? undefined : nextHeroInfo.props[key]
                const _currCfg = this.getICardAttrCfg(currProp.t)
                if (_currCfg) {
                    const _changeCfg: ICardAttrCfg = _currCfg
                    _changeCfg.isMaxLevel = isMax
                    let currI32 = currProp.i32 || 0
                    let nextI32 = nextProp?.i32
                      
                    if (core.PropType.PropTypeBornCastMs == currProp.t) {
                        currI32 = currI32 / 1000
                        if (nextI32) nextI32 = nextI32 / 1000
                    } else if (core.PropType.PropTypeHpMax == currProp.t) {
                          
                        if (currI32 == 1) continue
                    }
                    _changeCfg.num1 = `${currI32}`
                    _changeCfg.num2 = `${nextI32 || ''}`
                      
                    if (currI32 != 0) attrs.push(_currCfg)
                }
            }
            const skids = heroInfo?.sk_ids || []
            const nextSkids = isMax ? undefined : (nextHeroInfo?.sk_ids || [])
            if (!isMax && skids.length != nextSkids.length) return
            let cd_ms = 0
            for (const skKey in skids) {
                const skid = skids[skKey]
                let skillInfo = TableSkill.getInfoById(skid);
                if (skillInfo?.client_display == 0) continue
                cd_ms = skillInfo?.cd_ms ?? 0

                const nextSkid = isMax ? undefined : nextSkids[skKey]
                const nextSkillInfo = isMax ? undefined : TableSkill.getInfoById(nextSkid);
                const hasAtk = attrs.find((item) => !!ATK_TYPES[item?.attrType])
                if (hasAtk) {
                    const _cfg2 = this.getICardAttrCfg(CsPropType.PropTypeEffectRadius)
                      
                    if (_cfg2 && skillInfo?.effect_radius) {
                        if (hasAtk) {
                            hasAtk.attrType = _cfg2.attrType
                            hasAtk.name = _cfg2.name
                        }
                    }

                      
                    const cAtk = hasAtk?.num1 ?? "0"
                    if (cAtk != '0') {
                          
                        const formatUnit = CardUtils.formatSkillUnits(heroInfo?.threat_units)
                        if (formatUnit) {
                            const _cfg3 = this.getICardAttrCfg(CsPropType.PropTypeTarget)
                            if (_cfg3) {
                                const _changeCfg: ICardAttrCfg = _cfg3
                                _changeCfg.isMaxLevel = isMax
                                _changeCfg.num1 = `${LanguageData.getLangByID(formatUnit)}`
                                attrs.push(_changeCfg)
                            }
                        }

                          
                        if (cd_ms != 0) {
                            const _cfg3 = this.getICardAttrCfg(core.PropType.PropTypeAtkSpeed)
                            if (_cfg3) {
                                const _changeCfg: ICardAttrCfg = _cfg3
                                _changeCfg.num1 = `${cd_ms / 1000}`
                                attrs.push(_changeCfg)
                            }
                        }
                    }
                }

                  
                if (skillInfo.client_display == 1) {
                    const _cfg1 = this.getICardAttrCfg(CsPropType.PropTypeAtDistance)
                    if (_cfg1) {
                        const _changeCfg: ICardAttrCfg = _cfg1
                        _changeCfg.isMaxLevel = isMax
                        _changeCfg.num1 = `${skillInfo.cast_distance}`
                        _changeCfg.num2 = `${nextSkillInfo?.cast_distance || ''}`
                        attrs.push(_changeCfg)
                    }
                      
                } else if (skillInfo.client_display == 2) {
                    for (const effectId of skillInfo.effect_ids) {
                        let effectInfo = TableSkillEffect.getInfoById(effectId);
                        if (effectInfo.type == skill.EffectType.EffectTypeNone) continue
                          
                        if (effectInfo.type == skill.EffectType.EffectTypeCall) {
                            let call = TableSkillEffectCall.getInfoById(effectInfo.value);
                            let callHeroInfo = TableHeroes.getInfoById(call.hero_id);
                            const _skillEffect = this.getICardAttrCfg(CsPropType.PropTypeSkillEffects)
                            const _cfgCall = this.getICardAttrCfg(CsPropType.PropTypeEffectTypeCall)
                            if (_skillEffect && _cfgCall) {
                                const _changeCfg: ICardAttrCfg = _cfgCall
                                _skillEffect.num1 = `${LanguageData.getLangByID(_changeCfg.name)}`
                                attrs.push(_skillEffect)
                                _changeCfg.isMaxLevel = isMax
                                _changeCfg.num1 = `${call.cnt || 0}`
                                _changeCfg.nameAddStr = `${callHeroInfo?.name}`
                                attrs.push(_changeCfg)
                            }
                        } else if (effectInfo.type == skill.EffectType.EffectTypeAtk) {   
                            const v = effectInfo?.value || 0
                            const per = effectInfo?.percentage || 0
                            let num = 0
                            if (v != 0) {
                                num = v / 10000
                            } else if (per != 0) {
                                num = per / 100
                            }
                            const _cfg1 = this.getSkillICardAttrCfg(skill.EffectType.EffectTypeAtk)
                            if (_cfg1 && num != 0) {
                                const cdMs = skillInfo.cd_ms || 1
                                  
                                const sPercenntage = num / cdMs * 1000 / 100
                                const _changeCfg: ICardAttrCfg = _cfg1
                                _changeCfg.num1 = `${(1 / sPercenntage).toFixed(2)}`
                                attrs.push(_changeCfg)
                            }
                        }

                        // ChangeProp
                        //  else if (effectInfo.type == skill.EffectType.EffectTypeChangeProp) {
                        //     let changeV: number
                        //     const _baseValue = attrs.find((item) => item?.attrType == effectInfo?.prop_type)
                        //     if (!_baseValue) continue
                        //     if (effectInfo.prop_pos == core.PropPos.PropPosGlobalAdd) {
                        //         // effectInfo.value / 10000
                        //         changeV = Number(_baseValue.num1) + effectInfo.value / 10000
                        //     } else if (effectInfo.prop_pos == core.PropPos.PropPosMul) {
                        //         changeV = Number(_baseValue.num1) * (1 + effectInfo.value / 10000)
                        //     }
                        //     const _cfg1 = this.getICardAttrCfg(skill.EffectType.EffectTypeChangeProp)
                        //     if (_cfg1 && changeV) {
                        //         const _changeCfg: ICardAttrCfg = _cfg1
                        //         _changeCfg.isMaxLevel = isMax
                        //         _changeCfg.num1 = `${changeV}`
                        //         attrs.push(_changeCfg)
                        //     }
                        // }
                    }
                }
            }

            if (heroInfo.ai != 1) {
                const buffId = TableFighterAi.getInfoById(heroInfo.ai)?.buf_id
                let skillInfo = TableSkill.getInfoById(buffId);
                const effectIds = skillInfo?.effect_ids || []
                for (const effectId of effectIds) {
                    let effectInfo = TableSkillEffect.getInfoById(effectId);
                    if (effectInfo.type == skill.EffectType.EffectTypeNone) continue
                      
                    if (effectInfo.type == skill.EffectType.EffectTypeChangeAtk) {
                        const _baseValue = attrs.find((item) => !!ATK_TYPES[item?.attrType])
                        if (!_baseValue) continue
                        let changeV1: number
                        let changeV2: number
                        if (effectInfo.prop_pos == core.PropPos.PropPosGlobalAdd) {
                            // effectInfo.value / 10000
                            changeV1 = Number(_baseValue.num1) + effectInfo.value / 10000
                            if (_baseValue.showAdd && _baseValue.num2 != '') changeV2 = Number(_baseValue.num2) + effectInfo.value / 10000
                        } else if (effectInfo.prop_pos == core.PropPos.PropPosMul) {
                            changeV1 = Number(_baseValue.num1) * (1 + effectInfo.value / 10000)
                            if (_baseValue.showAdd && _baseValue.num2 != '') changeV2 = Number(_baseValue.num2) * (1 + effectInfo.value / 10000)
                        }
                        const _cfg1 = this.getSkillICardAttrCfg(skill.EffectType.EffectTypeChangeAtk)
                        if (_cfg1) {
                            _baseValue.attrType = skill.EffectType.EffectTypeChangeAtk
                            _baseValue.icon = _cfg1.icon
                            _baseValue.name = _cfg1.name
                            _baseValue.num1 = `${changeV1}`
                            if (changeV2) _baseValue.num2 = `${changeV2}`
                        }
                    }
                }
            }

        } else {
            for (const summon of summons) {
                const heroInfo = TableHeroes.getInfoById(summon.id)
                const _cfg = this.getICardAttrCfg(CsPropType.NONE)
                if (_cfg) {
                    const _changeCfg: ICardAttrCfg = _cfg
                    _changeCfg.isMaxLevel = isMax
                    // _changeCfg.name = `${heroInfo?.inn_name}`
                    _changeCfg.name = `${LanguageData.getLangByID(heroInfo?.name)}`
                    _changeCfg.num1 = `${summon?.count || 1}`
                    attrs.push(_changeCfg)
                }
            }
        }
        return attrs ?? []
    }

    private static getICardAttrCfg(attrType: core.PropType | CsPropType): ICardAttrCfg {
        const c = LOCAL_ATTRS[attrType]
        if (c?.cfgAttrId) {
            const cfg = TableAttrs.getInfoById(c.cfgAttrId)
            if (cfg) {
                c.name = cfg.display_name
                c.icon = cfg.res_name
            }
        }
        if (c) return JSON.parse(JSON.stringify(c))
    }
    private static getSkillICardAttrCfg(attrType: skill.EffectType): ICardAttrCfg {
        const c = LOCAL_ATTR_SKILLS[attrType]
        if (c?.cfgAttrId) {
            const cfg = TableAttrs.getInfoById(c.cfgAttrId)
            if (cfg) {
                c.name = cfg.display_name
                c.icon = cfg.res_name
            }
        }
        if (c) return JSON.parse(JSON.stringify(c))
    }


    /*  
      
      
    * */
    public static getDispostionItems(param: { cardId?: number, netCard?: core.ICard }): IDispostionCfg[] {
        let cardId = param.cardId;
        let netCard = param.netCard;
        if (!cardId && !netCard) return [];
        let cardInfo: core.ICard = null;
        if (netCard) {
            cardInfo = netCard;
        } else {
            cardInfo = PlayerManger.getInstance().cardManager.playCard.getNetCardById(cardId)
        }
        if (!cardInfo) return [];
        const attrs = cardInfo.attrs || []
        // const list: { [key: number]: IDispostionCfg } = {}
        const list: IDispostionCfg[] = []
        for (const attr of attrs) {
            const skillInfo = TableSkill.getInfoById(attr.attrId)
            const effect_ids = skillInfo?.effect_ids
            // list[attr.attrId] = { name: skillInfo?.name, desc: "", attrId: attr.attrId, icon: skillInfo?.icon_res }
            list.push({ name: skillInfo?.name, desc: "", attrId: attr.attrId, icon: skillInfo?.icon_res })
            if (!effect_ids) continue
            let str = '';
              
            if (effect_ids.length == 1) {
                const skillDesc = skillInfo?.description || ""
                if (skillDesc != '') str += LanguageData.getLangByID(skillInfo?.description);
                const skillEffectInfo = TableSkillEffect.getInfoById(effect_ids[0])
                let v = skillEffectInfo?.value || 0
                let per = skillEffectInfo?.percentage || 0
                if (attr.effectVals[effect_ids[0]]) {
                    v = attr.effectVals[effect_ids[0]].val || 0
                    per = attr.effectVals[effect_ids[0]].percentage || 0
                }
                let num = 0
                if (v != 0) num = v / 100
                else if (per != 0) num = per / 100
                if (str != "") str += '\n'
                const params: LangLabelParamsItem[] = [{ key: 'key', value: `${num}%` }, { key: 'negateKey', value: `${-num}%` }]
                str += LanguageData.getLangByIDAndParams(skillEffectInfo?.description, params);
                // list[attr.attrId].num = `${num}`
                list.forEach(e => {
                    if (e.attrId == attr.attrId) {
                        e.num = `${num}`
                    }
                })
                  
            } else if (effect_ids.length > 1) {
                for (const effectId of effect_ids) {
                    const effectIds2 = TableSkill.getInfoById(effectId)?.effect_ids ?? []
                    if (effectIds2.length > 0) {
                        const skillEffectInfo = TableSkillEffect.getInfoById(effectIds2[0])
                        let v = skillEffectInfo?.value || 0
                        let per = skillEffectInfo?.percentage || 0
                        if (attr.effectVals[effectIds2[0]]) {
                            v = attr.effectVals[effectIds2[0]].val || 0
                            per = attr.effectVals[effectIds2[0]].percentage || 0
                        }
                        let num = 0
                        if (v != 0) num = v / 100
                        else if (per != 0) num = per / 100
                        if (str != "") str += '\n'
                        const params: LangLabelParamsItem[] = [{ key: 'key', value: `${num}%` }, { key: 'negateKey', value: `${-num}%` }]
                        str += LanguageData.getLangByIDAndParams(skillEffectInfo?.description, params);
                    }
                }
            }
            // list[attr.attrId].desc = str;
            list.forEach(e => {
                if (e.attrId == attr.attrId) {
                    e.desc = str;
                }
            })
        }
        return list ?? []
    }


    public static getDispostionIconNameItems(param: { cardId?: number, netCard?: core.ICard }): IDispostionCfg[] {
        let cardId = param.cardId;
        let netCard = param.netCard;
        if (!cardId && !netCard) return [];
        let cardInfo: core.ICard = null;
        if (netCard) {
            cardInfo = netCard;
        } else {
            cardInfo = PlayerManger.getInstance().cardManager.playCard.getNetCardById(cardId)
        }
        if (!cardInfo) return [];
        const attrs = cardInfo.attrs || []
        const list: IDispostionCfg[] = []
        for (const attr of attrs) {
            const skillInfo = TableSkill.getInfoById(attr.attrId)
            const effect_ids = skillInfo?.effect_ids
            const disConfig: IDispostionCfg = { name: skillInfo?.name, desc: "", attrId: attr.attrId, icon: skillInfo?.icon_res }
            if (!effect_ids) continue
            let str = '';
              
            if (effect_ids.length == 1) {
                const skillDesc = skillInfo?.description || ""
                if (skillDesc != '') str += LanguageData.getLangByID(skillInfo?.description);
                const skillEffectInfo = TableSkillEffect.getInfoById(effect_ids[0])
                let v = skillEffectInfo?.value || 0
                let per = skillEffectInfo?.percentage || 0
                if (attr.effectVals[effect_ids[0]]) {
                    v = attr.effectVals[effect_ids[0]].val || 0
                    per = attr.effectVals[effect_ids[0]].percentage || 0
                }
                let num = 0
                if (v != 0) num = v / 100
                else if (per != 0) num = per / 100
                if (str != "") str += '\n'
                const params: LangLabelParamsItem[] = [{ key: 'key', value: `${num}%` }, { key: 'negateKey', value: `${-num}%` }]
                str += LanguageData.getLangByIDAndParams(skillEffectInfo?.description, params);
                disConfig.num = `${num}`
                  
            } else if (effect_ids.length > 1) {
                for (const effectId of effect_ids) {
                    const effectIds2 = TableSkill.getInfoById(effectId)?.effect_ids ?? []
                    if (effectIds2.length > 0) {
                        const skillEffectInfo = TableSkillEffect.getInfoById(effectIds2[0])
                        let v = skillEffectInfo?.value || 0
                        let per = skillEffectInfo?.percentage || 0
                        if (attr.effectVals[effectIds2[0]]) {
                            v = attr.effectVals[effectIds2[0]].val || 0
                            per = attr.effectVals[effectIds2[0]].percentage || 0
                        }
                        let num = 0
                        if (v != 0) num = v / 100
                        else if (per != 0) num = per / 100
                        if (str != "") str += '\n'
                        const params: LangLabelParamsItem[] = [{ key: 'key', value: `${num}%` }, { key: 'negateKey', value: `${-num}%` }]
                        str += LanguageData.getLangByIDAndParams(skillEffectInfo?.description, params);
                    }
                }
            }
            disConfig.desc = str;
              
            const iconStr = disConfig?.icon ?? ''
            if (iconStr.trim().length != 0) {
                list.push(disConfig)
            }
        }
        return list
    }

}