import { CardPrefab } from "../../common/common/CardPrefab";
import { EquipmentPrefab } from "../../common/equipment/EquipmentPrefab";

export enum PVECardClickPop {
      
    POLL_CARD_INNFO = 0,
      
    POLL_CARD_ASSIST,
    KNAPSACK_CARD_INFO
}

export enum PVEEquipClickPop {
    POLL_CARD_INNFO = 0,
    KNAPSACK_CARD_INFO
}

export type PveCardFunction = (cardPrefab: CardPrefab, idx?: number) => void
export type PveEquipFunction = (equipPrefab: EquipmentPrefab) => void