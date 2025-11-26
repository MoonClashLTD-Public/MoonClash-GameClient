export const ATK_TYPES: { [num: number]: core.PropType } = {
    [core.PropType.PropTypeAtk]: core.PropType.PropTypeAtk,
    [core.PropType.PropTypeFlyerAtk]: core.PropType.PropTypeFlyerAtk,
    [core.PropType.PropTypeTowerAtk]: core.PropType.PropTypeTowerAtk,
    [core.PropType.PropTypeGroundAtk]: core.PropType.PropTypeGroundAtk,
    [core.PropType.PropTypeBuildingAtk]: core.PropType.PropTypeBuildingAtk,
}

export interface IDispostionCfg {
    attrId: number;
    name: string;
    desc: string;
    icon: string
      
    num?: string
}

export enum CsPropType {
      
    PropTypeAtDistance = 1000,
      
    PropTypeEffectRadius,
      
    PropTypeEffectTypeCall,
      
    PropTypeHeros,
      
    PropTypeSkillEffects,
      
    PropTypeTarget,
    NONE,
}
export interface ICardAttrCfg {
    attrType: core.PropType | CsPropType | skill.EffectType
    name?: string
    nameAddStr?: string
    icon?: string
    num1?: string
    num2?: string
    showAdd?: boolean
    isMaxLevel?: boolean
    cfgAttrId?: number
    showNum2?: boolean
    isEffectType?: boolean
      
}
export const LOCAL_ATTRS: { [num: number]: ICardAttrCfg } = {
    // [core.PropType.PropTypeHp]: {
    //     attrType: core.PropType.PropTypeHp,
    //     showAdd: true,
    //     cfgAttrId: 1
    // },
    [core.PropType.PropTypeHpMax]: {
        attrType: core.PropType.PropTypeHpMax,
        showAdd: true,
        cfgAttrId: 1
    },
    [core.PropType.PropTypeAtk]: {
        attrType: core.PropType.PropTypeAtk,
        showAdd: true,
        cfgAttrId: 2
    },
    [core.PropType.PropTypeBuildingAtk]: {
        attrType: core.PropType.PropTypeBuildingAtk,
        showAdd: true,
        cfgAttrId: 2
    },
    [core.PropType.PropTypeGroundAtk]: {
        attrType: core.PropType.PropTypeGroundAtk,
        showAdd: true,
        cfgAttrId: 2
    },
    [core.PropType.PropTypeFlyerAtk]: {
        attrType: core.PropType.PropTypeFlyerAtk,
        showAdd: true,
        cfgAttrId: 2
    },
    [core.PropType.PropTypeTowerAtk]: {
        attrType: core.PropType.PropTypeTowerAtk,
        showAdd: true,
        cfgAttrId: 15
    },
    [core.PropType.PropTypeMotionSpeed]: {
        attrType: core.PropType.PropTypeMotionSpeed,
        showAdd: true,
        cfgAttrId: 6
    },
    [core.PropType.PropTypeAtkSpeed]: {
        attrType: core.PropType.PropTypeAtkSpeed,
        cfgAttrId: 9
    },
    // {
    //     attrType: core.PropType.PropTypeHp1,
      
    //     icon: 'Hitspeed_icon',
    // },
      
    // [core.PropType.PropTypeBornCastMs]: {
    //     attrType: core.PropType.PropTypeBornCastMs,
    //     cfgAttrId: 5
    // },
    [CsPropType.PropTypeAtDistance]: {
        attrType: CsPropType.PropTypeAtDistance,
        cfgAttrId: 8
    },
    [CsPropType.PropTypeEffectRadius]: {
        attrType: CsPropType.PropTypeEffectRadius,
        name: 'card_attr_EffectRadius',
        icon: 'Areadamage_icon',
        showAdd: true,
        cfgAttrId: 14
    },
    [CsPropType.PropTypeEffectTypeCall]: {
        attrType: CsPropType.PropTypeEffectTypeCall,
        name: 'card_attr_EffectTypeCall',
        icon: 'Conut_icon',
    },
    [CsPropType.PropTypeHeros]: {
        attrType: CsPropType.PropTypeHeros,
        cfgAttrId: 16
    },
    [CsPropType.PropTypeSkillEffects]: {
        attrType: CsPropType.PropTypeSkillEffects,
        cfgAttrId: 4
    },
    [CsPropType.PropTypeTarget]: {
        attrType: CsPropType.PropTypeTarget,
        cfgAttrId: 10
    },
    [CsPropType.NONE]: {
        attrType: CsPropType.NONE,
        name: '',
        icon: 'Conut_icon',
    },
}

export const LOCAL_ATTR_SKILLS: { [num: number]: ICardAttrCfg } = {
    [skill.EffectType.EffectTypeAtk]: {
        attrType: skill.EffectType.EffectTypeAtk,
        isEffectType: true,
        cfgAttrId: 11
    },
    [skill.EffectType.EffectTypeChangeAtk]: {
        attrType: skill.EffectType.EffectTypeChangeAtk,
        isEffectType: true,
        showAdd: true,
        cfgAttrId: 3
    }
}