import { _decorator } from "cc";
import { CardInfoPrefab } from "../CardInfoPrefab";
import { CardInfoBase } from "./CardInfoBase";

const { ccclass, property } = _decorator;

@ccclass('CardInfoNone')
export class CardInfoNone extends CardInfoBase {
    start() { }
}