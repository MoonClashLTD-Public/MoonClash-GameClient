import { Color } from "cc";

export interface IEquipmentDisAndCombitCfg {
    tCombit: number
    list: { [key: number]: IEquipDispostionCfg }
}

export interface IEquipmentDisAndCombitCfg2 {
    tCombit: number
    list: IEquipDispostionCfg[]
}

export interface IEquipDispostionCfg {
    attrId: number;
    name: string;
    desc: string;
    showColor: Color
    icon?: string
    num?: string
}