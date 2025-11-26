import { Vec3 } from "cc";
import { EquipmentPrefab } from "../../common/equipment/EquipmentPrefab";
import { EEquipmentPop } from "./enum";


export type BtmItemEquipClickListener = (type: EEquipmentPop, cardNode: EquipmentPrefab) => void;
export type EEquipPopFunction = (type: EEquipmentPop, vec: Vec3, ind: number) => void;
type RNVec3 = (vec: Vec3) => void
export type EquipTouchFunction = { start?: RNVec3, move?: RNVec3, end?: RNVec3 };
export type ETCardGroupClickItemListener = { itemClick?: (cardNode: EquipmentPrefab) => void, onListPageChange?: (pageNum: number) => void };