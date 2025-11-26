import { Vec3, Node } from "cc";
import { CardPrefab } from "../../common/common/CardPrefab";
import { EquipmentPrefab } from "../../common/equipment/EquipmentPrefab";
import { ECardSystemPop } from "./enum";

export type CardSystemPopFunction = (type: ECardSystemPop, vec: Vec3, ind: number) => void;
type RNVec3 = (vec: Vec3) => void
export type CardSystemTouchFunction = { start?: RNVec3, move?: RNVec3, end?: RNVec3 };
export type CardDataListener = { update?: () => void, init?: () => void };


export type CardClickItemListener = (cardNode: Node) => void;
export type BtmItemCardClickListener = (type: ECardSystemPop, cardNode: CardPrefab) => void;
export type CardGroupClickItemListener = {
    itemClick?: (cardNode: CardPrefab, idx?: number) => void,
    removeClick?: (cardNode: CardPrefab, idx?: number) => void
    itemEquipClick?: (cardNode: EquipmentPrefab) => void,
    removeEquipClick?: (cardNode: EquipmentPrefab, idx?: number) => void
    onListPageChange?: (pageNum: number) => void
};
