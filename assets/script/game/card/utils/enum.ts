export enum ECardSystemPop {
    POLL_CARD_INNFO = 0,
    KNAPSACK_CARD_INFO,
    NO_CARD_INFO
}


export enum ECardSystemUpdateStatus {
    CARD_SYSTEM_UI = 'card_system_ui',
    CARD_SYSTEM_POP = 'card_system_pop',
}
export interface ICSCardPopCfg {
      
    netId?: number
      
    lId?: number
}
export interface ICSCardPopNetCfg {
      
    cardId: number
}

export interface ICSResetAttrPopCfg {
      
    id: number

      
    funName?: "onResetSingle" | "onResetAll" | "onRefined"
}

