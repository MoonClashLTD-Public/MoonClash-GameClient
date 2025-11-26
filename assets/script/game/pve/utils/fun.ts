import { CardPrefab } from "../../common/common/CardPrefab";
import { EquipmentPrefab } from "../../common/equipment/EquipmentPrefab";
import { PVECardClickPop, PVEEquipClickPop } from "./enum";

export type PVEBtmItemCardClickListener = (type: PVECardClickPop, cardNode: CardPrefab) => void;
export type PVEBtmItemEquipClickListener = (type: PVEEquipClickPop, cardNode: EquipmentPrefab) => void;