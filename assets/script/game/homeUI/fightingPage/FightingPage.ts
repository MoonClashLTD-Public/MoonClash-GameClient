import { _decorator, Component, Node, PageView, instantiate, UITransform, tween, UIOpacity, easing, EventTouch, Label, Sprite, v4, v3, Button, sys } from 'cc';
import { Message } from '../../../core/common/event/MessageManager';
import { Logger } from '../../../core/common/log/Logger';
import { LanguageData } from '../../../core/gui/language/LanguageData';
import { LanguageLabel } from '../../../core/gui/language/LanguageLabel';
import List from '../../../core/gui/list/List';
import { AlertParam } from '../../../core/gui/prompt/Alert';
import { tips } from '../../../core/gui/prompt/TipsManager';
import { oops } from '../../../core/Oops';
import { CommonUtil } from '../../../core/utils/CommonUtil';
import { BattleManger } from '../../battle/BattleManger';
import { BlindBoxOpenMultiPopUpParam } from '../../blindBox/BlindBoxOpenMultiPopUp';
import { BlindBoxOpenPopUpParam } from '../../blindBox/BlindBoxOpenPopUp';
import { UIID } from '../../common/config/GameUIConfig';
import HttpHome from '../../common/net/HttpHome';
import { netChannel } from '../../common/net/NetChannelManager';
import TableBlindBox from '../../common/table/TableBlindBox';
import TableGlobalConfig from '../../common/table/TableGlobalConfig';
import TableMaps from '../../common/table/TableMaps';
import TablePve from '../../common/table/TablePve';
import { DataEvent } from '../../data/dataEvent';
import { PlayerManger } from '../../data/playerManager';
import { AudioSoundRes } from '../../data/resManger';
import { MathcUIParam } from '../../matchUI/MatchUI';
import { IInitPvePopCfg } from '../../pve/PVEPopup';
import WalletUtil, { CurrType } from '../../walletUI/WalletUtil';
import { HOME_EVENT } from '../HomeEvent';
import { HomeLevelPopUp } from '../HomeLevelPopUp';
const { ccclass, property } = _decorator;

@ccclass('FightingPage')
export class FightingPage extends Component {
    @property(Label)
    nameLbl: Label = null;
    @property(Label)
    levelLbl: Label = null;
    @property(LanguageLabel)
    pveLevelName: LanguageLabel = null;
    @property(List)
    list: List = null;
    @property(Node)
    indicatorNode: Node = null;
    @property(Node)
    pageTmp: Node = null;
    @property(Node)
    mailRedPoint: Node = null;   
    @property(Node)
    materialBoxRedPoint: Node = null;   
    @property(Node)
    light: Node = null;  
    @property(Button)
    pvpBtn: Button = null;
    @property(Button)
    pveBtn: Button = null;

    selMapId = 0;
    pveMapId = 0;
    async start() {
        let mapNum = TableMaps.cfg.length;
        this.list.numItems = mapNum;
        for (let index = 0; index < mapNum - 1; index++) {
            let n = instantiate(this.pageTmp);
            this.indicatorNode.addChild(n);
        }
        this.list.skipPage(0, 0);
        this.pageChangeEvent(0);
        this.addEvent();
        this.updInfo();
    }

    updInfo() {
        this.levelLbl.string = `${HomeLevelPopUp.calcLevel().level}`;
        this.nameLbl.string = `${PlayerManger.getInstance().playerSelfInfo.userName}`;
    }
    update(deltaTime: number) {
        let angle = this.light.eulerAngles
        this.light.setRotationFromEuler(v3(angle.x, angle.y, angle.z - 1))
    }

    onDestroy() {
        this.removeEvent();
    }

      
    pageInit() {
        this.updMaterialBoxRedPoint();
        this.updInfo();
        this.updPveLevelInfo();
    }

      
    pageOuit() {
    }

    pageChangeEvent(idx: number) {
        for (let index = 0; index < this.indicatorNode.children.length; index++) {
            let n = this.indicatorNode.children[index];
            n.children[0].active = index == idx;
        }
        this.selMapId = TableMaps.cfg[idx].Id;
    }

    async renderEvent(item: Node, idx: number) {
        item.children.forEach(e => e.active = false);
        let mapInfo = TableMaps.cfg[idx];
        let mapName = mapInfo.res_name;
        let mapNode = item.getChildByName(mapName);
        if (mapNode) {
            mapNode.active = true;
        } else {
            let prefab = await BattleManger.getInstance().loadMiniatureMap(mapName);
            let map = instantiate(prefab);
            item.addChild(map);
            map.setPosition(item.getComponent(UITransform).width / 2, 100, 0);
            let uio = map.addComponent(UIOpacity);
            uio.opacity = 0;
            tween(uio)
                .to(0.5, { opacity: 255 }, { easing: easing.smooth })
                .start();
        }
    }

    async matchPvPClick() {
        oops.gui.open<MathcUIParam>(UIID.MatchUI, {
            mapId: this.selMapId,
            matchType: core.MatchType.MatchTypeArena,
        });
        oops.audio.playEffect(AudioSoundRes.clickMatch);
    }
    async matchPvEClick() {
        const args: IInitPvePopCfg = {
            confim: () => {
                oops.gui.open(UIID.MatchUI, {
                    mapId: this.pveMapId,
                    matchType: core.MatchType.MatchTypeChallenge,
                });
                oops.audio.playEffect(AudioSoundRes.clickMatch);
            }
        }
        oops.gui.open(UIID.PVEPop, args)

    }

    levelClick() {
        oops.gui.open(UIID.HomeLevelPopUp);
    }

      
    async materialBoxesClick(param: { useAssistPts?: boolean, useGold?: boolean, num?: number }) {
        // if (true) {
        //     let d = pkgsc.ScMaterialBoxesOpenPush.create();
        //     d.contents = [
        //         {
        //             id: 1,
        //             cnt: 10
        //         },
        //         {
        //             id: 2,
        //             cnt: 10
        //         },
        //         {
        //             id: 3,
        //             cnt: 5
        //         },
        //     ]
        //     oops.gui.open<BlindBoxOpenPopUpParam>(UIID.BlindBoxOpenPopUp, {
        //         materialBoxesData: d
        //     });
        //     return
        // }

        // let num = PlayerManger.getInstance().playerSelfInfo.offChainMaterialBoxes;
        // for (let index = 0; index < 10; index++) {
        //     let d = await netChannel.home.reqUnique(opcode.OpCode.CsMaterialBoxesOpenReq, opcode.OpCode.ScMaterialBoxesOpenResp, pkgcs.CsMaterialBoxesQueryReq.create());
        //     if (d?.code == errcode.ErrCode.WaitComplete) {
        //         let _d = await tips.showNetLoadigMask<pkgsc.ScMaterialBoxesOpenPush>({
        //             content: "blind_page_alert_0",
        //             closeEventName: `${opcode.OpCode.ScMaterialBoxesOpenPush}`,
        //         })
        //         if (_d?.code != errcode.ErrCode.Ok) break;
        //     }
        // }
        // return

        let okCB = async () => {
            tips.showNetLoadigMask<pkgsc.ScMaterialBoxesOpenPush | pkgsc.ScBlindBoxBuyAndOpenPush | pkgsc.ScBlindBoxOpenPush>({
                content: "blind_page_alert_0",
                closeEventName: [
                    `${opcode.OpCode.ScMaterialBoxesOpenPush}`,
                    `${opcode.OpCode.ScBlindBoxBuyAndOpenPush}`,
                    `${opcode.OpCode.ScBlindBoxOpenPush}`,
                ],
            }, async () => {
                let d = await netChannel.home.reqUnique(opcode.OpCode.CsMaterialBoxesOpenReq, opcode.OpCode.ScMaterialBoxesOpenResp, pkgcs.CsMaterialBoxesOpenReq.create({ useAssistPts: !!param.useAssistPts, useGold: !!param.useGold }));
                if (d.code == errcode.ErrCode.WaitComplete || d.code == errcode.ErrCode.Ok) {
                } else {
                    tips.hideNetLoadigMask();
                }
            }).then(_d => {
                if (_d?.code == errcode.ErrCode.Ok) {
                    if (_d instanceof pkgsc.ScBlindBoxBuyAndOpenPush) {
                        oops.gui.open<BlindBoxOpenPopUpParam>(UIID.BlindBoxOpenPopUp, {
                            blindBoxData: _d
                        });
                    } else if (_d instanceof pkgsc.ScMaterialBoxesOpenPush) {
                        oops.gui.open<BlindBoxOpenPopUpParam>(UIID.BlindBoxOpenPopUp, {
                            materialBoxesData: _d
                        });
                    } else if (_d instanceof pkgsc.ScBlindBoxOpenPush) {
                        oops.gui.open<BlindBoxOpenPopUpParam>(UIID.BlindBoxOpenPopUp, {
                            boxData: _d
                        });
                    }
                    // PlayerManger.getInstance().playerSelfInfo.offChainMaterialBoxes--;
                }
            })
        }

        let gas = "0";
        let usd = "0";
        let _d = await HttpHome.queryGas("CsMaterialBoxesOpenReq", null);
        if (_d) {
            gas = `${CommonUtil.weiToEther(_d.gas).toFixed()}`;
            usd = _d.usd;
        } else {
            return;
        }

        let content = "";
        if (param.useAssistPts) {
              
            content = LanguageData.getLangByIDAndParams('blind_box_buy_tips5', [
                { key: 'points', value: param.num.toString() },
                { key: 'gas', value: gas },
            ]);
        } else if (param.useGold) {
              
            content = LanguageData.getLangByIDAndParams('blind_box_buy_tips6', [
                { key: 'points', value: param.num.toString() },
                { key: 'gas', value: gas },
            ]);
        } else {
              
            content = LanguageData.getLangByIDAndParams('blind_box_buy_tips1', [
                { key: 'gas', value: gas }
            ]);
        }
        oops.gui.open<AlertParam>(UIID.Alert, {
            content: content,
            okCB: () => { okCB(); },
            cancelCB: () => { },
        });
    }

      
    async summonChestClick() {
        // if (true) {
        //     let cards = PlayerManger.getInstance().cardManager.playCard.netCards;
        //     let _cards: core.ICard[] = []
        //     for (let index = 0; index < cards.length; index++) {
        //         const c = cards[index];
        //         if (_cards.findIndex(e => c.protoId == e.protoId) == -1) {
        //             _cards.push(c);
        //         }
        //         if (_cards.length >= 6) break;
        //     }
        //     oops.gui.open<BlindBoxOpenMultiPopUpParam>(UIID.BlindBoxOpenMultiPopUp, {
        //         blindBoxData: {
        //             id: 1,
        //             cards: _cards,
        //         }
        //     });
        //     return
        // }

        let boxIdx = 1;
        let cnt = 1;
        let boxInfo = TableBlindBox.getInfoById(boxIdx);
        // let item = this.list.getItemByListId(boxIdx);
        // let blindBoxItem = item.getComponent(BlindBoxItem);
        // let num = blindBoxItem._num;
        let boxId = boxInfo.id;

        let data = pkgcs.CsBlindBoxBuyAndOpenReq.create({
            id: boxId,
            cnt: cnt,
        });
        let okCB = async () => {
            let d = await netChannel.home.reqUnique(opcode.OpCode.CsBlindBoxBuyAndOpenReq, opcode.OpCode.ScBlindBoxBuyAndOpenResp, data);
            if (d.code == errcode.ErrCode.WaitComplete) {
                let _d = await tips.showNetLoadigMask<pkgsc.ScBlindBoxBuyAndOpenPush>({
                    content: "blind_page_alert_1",
                    closeEventName: `${opcode.OpCode.ScBlindBoxBuyAndOpenPush}`,
                })
                if (_d?.code == errcode.ErrCode.Ok) {
                    oops.gui.open<BlindBoxOpenMultiPopUpParam>(UIID.BlindBoxOpenMultiPopUp, { blindBoxData: _d });
                }
            }
        }

        let gas = "0";
        let usd = "0";
        let price = "0";
        let __d = await HttpHome.checkBuySixCardNftPrice();
        if (__d) {
            price = CommonUtil.weiToEther(__d.price).toFixed();
        } else {
            return;
        }

        let allBNB = WalletUtil.getTotalCurrByType(CurrType.BNB);
        if (new BigNumber(price).gt(CommonUtil.weiToEther(allBNB))) {
            oops.gui.toast('not_enough_bnb', true);
            return;
        }

        let _d = await HttpHome.queryGas("BuySixCardNftReq", data);
        if (_d) {
            gas = `${CommonUtil.weiToEther(_d.gas).toFixed()}`;
            usd = _d.usd;
        } else {
            return;
        }

        let costPrice = new BigNumber(price);
        costPrice = costPrice.plus(gas, 10);
        let costPriceStr = costPrice.toFixed(3);


        oops.gui.open<AlertParam>(UIID.Alert, {
            content: LanguageData.getLangByIDAndParams('blind_box_buy_tips4', [
                {
                    key: "num1",
                    value: `${costPriceStr}`
                },
                {
                    key: "num2",
                    value: `${cnt}`
                },
            ]),
            okCB: () => {
                let allBNB = WalletUtil.getTotalCurrByType(CurrType.BNB);
                if (costPrice.gt(CommonUtil.weiToEther(allBNB))) {
                    oops.gui.toast('not_enough_bnb', true);
                    return;
                }
                okCB();
            },
            cancelCB: () => { },
        });
    }

      
    async boundChestClick(useAffBoxPts = false) {
        // if (true) {
        //     let cards = PlayerManger.getInstance().cardManager.playCard.netCards;
        //     let _cards: core.ICard[] = []
        //     for (let index = 0; index < cards.length; index++) {
        //         const c = cards[index];
        //         if (_cards.findIndex(e => c.protoId == e.protoId) == -1) {
        //             _cards.push(c);
        //         }
        //         if (_cards.length >= 6) break;
        //     }
        //     oops.gui.open<BlindBoxOpenMultiPopUpParam>(UIID.BlindBoxOpenMultiPopUp, {
        //         blindBoxData: {
        //             id: 1,
        //             cards: _cards,
        //         }
        //     });
        //     return
        // }

        let data = pkgcs.CsBuyBoundBoxReq.create({ useAffBoxPts });
        let okCB = async () => {
            let d = await netChannel.home.reqUnique(opcode.OpCode.CsBuyBoundBoxReq, opcode.OpCode.ScBuyBoundBoxResp, data);
            if (d.code == errcode.ErrCode.WaitComplete) {
                let _d = await tips.showNetLoadigMask<pkgsc.ScBuyBoundBoxPush>({
                    content: "blind_page_alert_1",
                    closeEventName: `${opcode.OpCode.ScBuyBoundBoxPush}`,
                })
                if (_d?.code == errcode.ErrCode.Ok) {
                    oops.gui.open<BlindBoxOpenMultiPopUpParam>(UIID.BlindBoxOpenMultiPopUp, { blindBoxData: _d });
                }
            }
        }

        let gas = "0";
        let usd = "0";

        let _d = await HttpHome.queryGas("CsBlindBoxBuyAndOpenReq",
            pkgcs.CsBlindBoxBuyAndOpenReq.create({
                id: 1,
                cnt: 6,
            }));
        if (_d) {
            gas = `${CommonUtil.weiToEther(_d.gas).toFixed()}`;
            usd = _d.usd;
        } else {
            return;
        }

        let datdId = "blind_box_buy_tips8";   
        if (useAffBoxPts) {
            datdId = "blind_box_buy_tips7";   
        }
          
        oops.gui.open<AlertParam>(UIID.Alert, {
            content: LanguageData.getLangByIDAndParams(datdId, [
                {
                    key: "gas",
                    value: `${gas}`
                },
            ]),
            okCB: () => {
                let allBNB = WalletUtil.getTotalCurrByType(CurrType.BNB);
                if (CommonUtil.weiToEther(allBNB).lt(gas)) {
                    oops.gui.toast('not_enough_bnb', true);
                    return;
                }
                okCB();
            },
            cancelCB: () => { },
        });
    }

      
    async surpriseChestClick() {
        let num = PlayerManger.getInstance().playerSelfInfo.offChainMaterialBoxes;
        if (num <= 0) {
            oops.gui.toast("no_material_box", true);
            return
        }

        this.materialBoxesClick({ useAssistPts: false });
    }

      
    async pointsChestClick() {
        let num = PlayerManger.getInstance().playerSelfInfo.assistPts;
        let points = TableGlobalConfig.cfg.spbox_price;   
        if (num < points) {
            oops.gui.toast(LanguageData.getLangByIDAndParams("no_points_box", [
                {
                    key: "num",
                    value: `${points}`,
                }
            ]), false);
            return
        }
        this.materialBoxesClick({ useAssistPts: true, num: points });
    }

      
    async goldChestClick() {
        let num = CommonUtil.weiToEther(WalletUtil.getTotalCurrByType(CurrType.DNA));
        let gold = TableGlobalConfig.cfg.goldbox_price / 10000;   
        if (num.lt(gold)) {
            oops.gui.toast(LanguageData.getLangByIDAndParams("no_gold_box", [
                {
                    key: "num",
                    value: `${gold}`,
                }
            ]), false);
            return
        }
        this.materialBoxesClick({ useGold: true, num: gold });
    }

      
    boundBoxClick() {
        let num = PlayerManger.getInstance().playerSelfInfo.boundBoxPts;
        let pts = TableGlobalConfig.cfg.bound_box_price;   
        if (num < pts) {
            oops.gui.toast("no_bound_box", true);
            return
        }

        this.boundChestClick();
    }

      
    affBoxClick() {
        let num = PlayerManger.getInstance().playerSelfInfo.affBoxPts;
          
        if (num <= 0) {
            oops.gui.toast("no_aff_box", true);
            return
        }

        this.boundChestClick(true);
    }

    itemClick(e: EventTouch, ind: string) {
        if (UIID[ind]) {
            oops.gui.open(UIID[ind]);

            if (UIID[ind] == UIID.EmailPop) {
                this.mailRedPoint.active = false;   
            }
        } else {
            Logger.erroring("not homeUI open " + ind)
        }
    }

    updPveLevelInfo() {
        const pveBattleId = PlayerManger.getInstance().playerSelfInfo.pveBattleId;
        let max = TablePve.cfg[TablePve.cfg.length - 1].id;
        const pveCfg = TablePve.getInfoById(pveBattleId > max ? max : pveBattleId);
        this.pveLevelName.dataID = pveCfg.name;
        this.pveMapId = pveCfg.map_id;
    }

    updMaterialBoxRedPoint() {
        let num = PlayerManger.getInstance().playerSelfInfo.offChainMaterialBoxes;
        this.materialBoxRedPoint.active = num > 0;
        this.materialBoxRedPoint.getComponentInChildren(Label).string = `${num}`
    }

    addEvent() {
        Message.on(HOME_EVENT.CLICK_AFFBOX, this.affBoxClick, this);
        Message.on(HOME_EVENT.CLICK_BOUNDBOX, this.boundBoxClick, this);
        Message.on(DataEvent.DATA_NICKNAME_CHANGE, this.DATA_NICKNAME_CHANGE, this);
        Message.on(DataEvent.DATA_MATERIALBOXES_CHANGE, this.DATA_MATERIALBOXES_CHANGE, this);
        Message.on(`${opcode.OpCode.ScNewMailPush}`, this.ScNewMailPush, this);
    }
    removeEvent() {
        Message.off(HOME_EVENT.CLICK_AFFBOX, this.affBoxClick, this);
        Message.off(HOME_EVENT.CLICK_BOUNDBOX, this.boundBoxClick, this);
        Message.off(DataEvent.DATA_PVEBATTLEID_CHANGE, this.DATA_PVEBATTLEID_CHANGE, this);
        Message.off(DataEvent.DATA_NICKNAME_CHANGE, this.DATA_NICKNAME_CHANGE, this);
        Message.off(DataEvent.DATA_MATERIALBOXES_CHANGE, this.DATA_MATERIALBOXES_CHANGE, this);
        Message.off(`${opcode.OpCode.ScNewMailPush}`, this.ScNewMailPush, this);
    }

    DATA_PVEBATTLEID_CHANGE(event: string, data: number) {
        this.updPveLevelInfo();
    }
    DATA_MATERIALBOXES_CHANGE(event: string, data: number) {
        this.updMaterialBoxRedPoint();
    }
    DATA_NICKNAME_CHANGE(event: string, data: number) {
        this.updInfo();
    }
    ScNewMailPush(event: string, data: pkgsc.ScNewMailPush) {
        this.mailRedPoint.active = data.unreadMails > 0;
    }
}

