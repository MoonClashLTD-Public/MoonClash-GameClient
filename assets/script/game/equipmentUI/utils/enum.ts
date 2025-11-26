export enum EEquipmentPop {
    POLL_CARD_INNFO = 0,
    KNAPSACK_CARD_INFO,
    NO_CARD_INFO
}

export interface IEquipCardPopCfg {
      
    id: number
    cb?: Function
}
export interface IEquipInfoPopCfg {
      
    id: number

      
    isGroup?: boolean

    equipClick?: (id: number) => void
}

export interface IEquipMergeInfoPopCfg {
      
    id: number

    checkClick?: (id: number) => void
}

export interface IEquipResetAttrPopCfg {
      
    id: number

      
    funName?: "onResetSingle" | "onResetAll" | "onRefined"
}

export interface IEquipGroupPopCfg {
      
    id: number
}