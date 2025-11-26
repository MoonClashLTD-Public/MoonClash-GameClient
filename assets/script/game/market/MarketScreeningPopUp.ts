import { _decorator, Component, Node, Button, Toggle, Label, Color } from 'cc';
import List from '../../core/gui/list/List';
import { oops } from '../../core/Oops';
import TableAttrPool from '../common/table/TableAttrPool';
import TableCards from '../common/table/TableCards';
import TableHeroes from '../common/table/TableHeroes';
import TableNfts from '../common/table/TableNfts';
import TableSkill from '../common/table/TableSkill';
import TableSkillEffect from '../common/table/TableSkillEffect';
import { MarketScreeningItem } from './widget/MarketScreening/MarketScreeningItem';
const { ccclass, property } = _decorator;

export enum MarketScreeningItemType {
      
    Multiple,
      
    Single,
      
    Sliding,
      
    RangeSliding,
}

export type MarketScreeningConf = {
    type: MarketScreeningItemType
      
    titleId?: string
      
    smallTitleId?: string
    icon?: string
    data?: MarketScreeningItemParam
      
    isExpand?: boolean
}

export interface itemBtnType {
    btnLblId: string
    isCheck?: boolean   
}
interface LevelList {
    num: number   
    selNum: number[]   
}
interface SubTypeList extends itemBtnType {
    nftSubType: core.NftSubType
}
interface ProtoIdList extends itemBtnType {
    protoId: number
}
interface QualityList extends itemBtnType {
    quality: number
    isCheck?: boolean   
}
interface AttrList extends itemBtnType {
    attrId: number
}
interface RangeSlider {
    attrId: number
    min: number
    max: number
    selMin: number
    selMax: number
    isCheck: boolean
    icon: string
}
export type MarketScreeningItemParam = {
    level?: LevelList,
    subTypeList?: SubTypeList[]
    protoIdList?: ProtoIdList[]
    qualityList?: QualityList[]
    attrList?: AttrList[]
    rangeSlider?: RangeSlider
}

export type MarketScreeningPopUpParam = {
    type: core.NftType
    cb: (d: watrade.ITradeQueryReq, conf: MarketScreeningConf[]) => void
    conf?: MarketScreeningConf[]
}
@ccclass('MarketScreeningPopUp')
export class MarketScreeningPopUp extends Component {
    @property(List)
    list: List = null;

    confs: MarketScreeningConf[] = [];

    param: MarketScreeningPopUpParam = null;

    cardTypeTogs: Toggle[] = [];
    cardTogs: Toggle[] = [];
    cardAttrTogs: Toggle[] = [];
    start() {

    }

    update(deltaTime: number) {

    }

    onAdded(param: MarketScreeningPopUpParam) {
        this.param = param;
        this.init();
    }

    init() {
        this.cardTypeTogs.length = 0;
        this.cardTogs.length = 0;
        this.cardAttrTogs.length = 0;

        let isChcek = false;
        if (!!this.param.conf) {
            this.confs = this.param.conf;
            isChcek = true;
        } else {
            switch (this.param.type) {
                case core.NftType.NftTypeCard:
                    this.initCardConf();
                    break;
                case core.NftType.NftTypeEquipment:
                    this.initEquipmentConf();
                    break;
                case core.NftType.NftTypeItem:
                    this.initItemConf();
                    break;
                default:
                    break;
            }
        }

        this.list.numItems = this.confs.length;

        this.scheduleOnce(() => {
            if (isChcek) {
                // this.cardTypeClick();
                this.cardClick();
                this.cardAttrClick();
            }
        }, 0)
        this.scheduleOnce(() => {
            this.list.scrollTo(0);
        }, 0)
    }

    cardTypeClick(isClick?: boolean) {
        let data: { id: number, isCheck: boolean }[] = [];
        this.cardTypeTogs.forEach(e => {
            if (e.isChecked) {
                let subType = Number(e.node.name);
                data.push({ id: subType, isCheck: true });
            }
        })
        this.cardTogs.forEach(e => {
            let subType = this.getSubType(Number(e.node.name));
            let isChecked = data.length == 0 || !!data.find(v => v.id == subType)?.isCheck;

            if (isChecked) {
                e.interactable = true;
                e.getComponentInChildren(Label).color = Color.WHITE;
            } else {
                for (const conf of this.confs) {
                    if (conf.data.protoIdList) {
                        let d = conf.data.protoIdList.find(v => v.protoId == Number(e.node.name));
                        if (d) d.isCheck = false;
                    }
                }

                e.isChecked = false;
                e.getComponentInChildren(Label).color = Color.GRAY;
                e.interactable = false;
            }
        })

        if (isClick) {
            // this.cardTypeClick();
            this.cardClick();
            // this.cardAttrClick();
        }
    }

    cardClick(isClick?: boolean) {
        let data: { id: number, isCheck: boolean }[] = [];
        let subTypeData: { id: number, isCheck: boolean }[] = [];
        this.cardTogs.forEach(e => {
            if (e.isChecked) {
                let subType = this.getSubType(Number(e.node.name));
                subTypeData.push({ id: subType, isCheck: true });

                let protoId = Number(e.node.name);
                let hero = TableCards.getInfoByProtoIdAndLv(protoId, 1);
                let attrs = TableAttrPool.cfg.filter(v => v.pool_id == hero.attr_pool_id);
                attrs.forEach(e => {
                    data.push({ id: e.attr_id, isCheck: true })
                })
            }
        })

        this.cardAttrTogs.forEach(e => {
            let isChecked = data.length == 0 || !!data.find(v => v.id == Number(e.node.name))?.isCheck;

            if (isChecked) {
                e.interactable = true;
                e.getComponentInChildren(Label).color = Color.WHITE;
            } else {
                for (const conf of this.confs) {
                    if (conf.data.attrList) {
                        let d = conf.data.attrList.find(v => v.attrId == Number(e.node.name));
                        if (d) d.isCheck = false;
                    }
                }

                e.isChecked = false;
                e.getComponentInChildren(Label).color = Color.GRAY;
                e.interactable = false;
            }
        })

        // this.cardTypeTogs.forEach(e => {
        //     let isChecked = data.length == 0 || !!subTypeData.find(v => v.id == Number(e.node.name))?.isCheck;

        //     if (isChecked) {
        //         e.interactable = true;
        //         e.getComponentInChildren(Label).color = Color.WHITE;
        //     } else {
        //         e.isChecked = isChecked;
        //         e.getComponentInChildren(Label).color = Color.GRAY;
        //         e.interactable = false;
        //     }
        // })

        if (isClick) {
            // this.cardTypeClick();
            // this.cardClick();
            // this.cardAttrClick();
        }
    }
    cardAttrClick(isClick?: boolean) {
        let data: { id: number, isCheck: boolean }[] = [];
        let attrIds: number[] = []
        this.cardAttrTogs.forEach(e => {
            if (e.isChecked) {
                let attrId = Number(e.node.name);
                attrIds.push(attrId);
            }
        })
        let checkCB = (protoId: number) => {
            let card = TableCards.getInfoByProtoIdAndLv(protoId, 1);
            let attrs = TableAttrPool.cfg.filter(v => v.pool_id == card.attr_pool_id);
            let bf = true;
            if (attrIds.length > 0) {
                for (const attr of attrIds) {
                    let idx = attrs.findIndex(v => v.attr_id == attr);
                    if (idx == -1) {
                        bf = false;
                        break;
                    }
                }
            }
            return bf;
        }
        for (const conf of this.confs) {
            if (!conf.data?.protoIdList) continue;
            for (const proto of conf.data.protoIdList) {
                let card = TableCards.getInfoByProtoIdAndLv(proto.protoId, 1);
                if (checkCB(card.proto_id)) {
                    data.push({ id: card.proto_id, isCheck: true })
                } else {
                    data.push({ id: card.proto_id, isCheck: false })
                }
            }
        }
        // this.cardAttrTogs.forEach(e => {
        //     if (e.isChecked) {
        //         let attrId = Number(e.node.name);
        //         let pool_id = TableAttrPool.cfg.find(v => v.attr_id == attrId).pool_id;
        //         for (const conf of this.confs) {
        //             if (!conf.data?.protoIdList) continue;
        //             for (const proto of conf.data.protoIdList) {
        //                 let card = TableCards.getInfoByProtoIdAndLv(proto.protoId, 1);
        //                 if (card.attr_pool_id == pool_id) {
        //                     data.push({ id: card.proto_id, isCheck: true })
        //                 }
        //             }
        //         }
        //     }
        // })

        this.cardTogs.forEach(e => {
            let isChecked = data.length == 0 || !!data.find(v => v.id == Number(e.node.name))?.isCheck;

            if (isChecked) {
                e.interactable = true;
                e.getComponentInChildren(Label).color = Color.WHITE;
            } else {
                for (const conf of this.confs) {
                    if (conf.data.protoIdList) {
                        let d = conf.data.protoIdList.find(v => v.protoId == Number(e.node.name));
                        if (d) d.isCheck = false;
                    }
                }

                e.isChecked = false;
                e.getComponentInChildren(Label).color = Color.GRAY;
                e.interactable = false;
            }
        })

        if (isClick) {
            // this.cardTypeClick();
            // this.cardClick();
            // this.cardAttrClick();
        }
    }

    getSubType(cardProtoId: number) {
        let protoId = Number(cardProtoId);
        let card = TableCards.getInfoByProtoIdAndLv(protoId, 1);
        let hero = TableHeroes.getInfoById(card.summons[0].id);
        let isSkill = hero.type == core.UnitType.UnitBomb;
        let isBuild = hero.type == core.UnitType.UnitBuilding;
        let subType = core.NftSubType.NftSubCardHero;
        if (isSkill) {
            subType = core.NftSubType.NftSubCardSkill;
        } else if (isBuild) {
            subType = core.NftSubType.NftSubCardBuilding;
        } else {
            subType = core.NftSubType.NftSubCardHero;
        }
        return subType;
    }

    initCardConf() {
        this.confs = [
            {
                type: MarketScreeningItemType.Multiple,
                titleId: "market_title_spe",
                icon: 'icon_Species',
                data: {
                    subTypeList: [
                        {
                            btnLblId: "market_btn_arms",   
                            nftSubType: core.NftSubType.NftSubCardHero,
                        },
                        {
                            btnLblId: "market_btn_building",   
                            nftSubType: core.NftSubType.NftSubCardBuilding,
                        },
                        {
                            btnLblId: "market_btn_spell",   
                            nftSubType: core.NftSubType.NftSubCardSkill,
                        },
                    ]
                }
            },
            {
                type: MarketScreeningItemType.Sliding,
                titleId: "market_title_lv",
                icon: 'icon_Level',
                data: {
                    level: {
                        num: 9,   
                        selNum: [],
                    },
                }
            },
        ]

        let _data: MarketScreeningConf = {
            type: MarketScreeningItemType.RangeSliding,
            titleId: "market_title_attr",
            icon: 'icon_Attribute',
            isExpand: false,
            data: {}
        }

        let idx = 0;
        let attrs = TableAttrPool.cfg.filter(v => v.pool_id == 100);
        for (const attr of attrs) {
            let data: MarketScreeningConf = {
                type: MarketScreeningItemType.RangeSliding,
                // titleId: "market_title_attr",
                // icon: 'icon_Attribute',
                isExpand: false,
                data: {}
            }

            let skill = TableSkill.getInfoById(attr.attr_id);
            let icon = skill.icon_res;
            let effect = TableSkillEffect.getInfoById(skill.effect_ids[0]);

            let min = Math.floor(effect.percentage / 1000) * 10;
            let max = Math.ceil(effect.percentage_max / 1000) * 10;
            data.data.rangeSlider = {
                attrId: attr.attr_id,
                min: min,
                max: max,
                selMin: min,
                selMax: max,
                isCheck: true,
                icon: icon,
            };

            if (idx == 0) {
                _data.data.rangeSlider = data.data.rangeSlider;
                this.confs.push(_data);
            } else {
                this.confs.push(data);
            }
            idx++;
        }

        // let _data: MarketScreeningConf = {
        //     type: MarketScreeningItemType.Multiple,
        //     titleId: "market_title_card",
        //     icon: 'icon_cards',
        //     isExpand: true,
        //     data: {
        //         protoIdList: [],
        //     }
        // }
          
        // TableNfts.cfg.forEach(e => {
        //     if (e.nft_type == core.NftType.NftTypeCard) {
        //         _data.data.protoIdList.push({
        //             btnLblId: e.display_name,
        //             protoId: e.Id,
        //         });
        //     }
        // })
        // this.confs.push(_data);

        // let idx = 0;
        // for (const key in TableAttrPool.attrKeyKV) {
        //     let infos = TableAttrPool.attrKeyKV[key];
        //     let btns: AttrList[] = [];
        //     for (const info of infos) {
        //         let name = TableSkill.getInfoById(info.attr_id).name;
        //         btns.push(
        //             {
        //                 btnLblId: name,
        //                 attrId: info.attr_id,
        //             }
        //         )
        //     }
        //     if (idx == 0) {
        //         this.confs.push({
        //             smallTitleId: key,
        //             icon: 'icon_Attribute',
        //             type: MarketScreeningItemType.Multiple,
        //             titleId: "market_title_attr",
        //             isExpand: true,
        //             data: {
        //                 attrList: btns,
        //             },
        //         })
        //     } else {
        //         this.confs.push({
        //             type: MarketScreeningItemType.Multiple,
        //             smallTitleId: key,
        //             isExpand: true,
        //             data: {
        //                 attrList: btns,
        //             },
        //         })
        //     }
        //     idx++;
        // }
    }

    initEquipmentConf() {
        this.confs = [
            {
                type: MarketScreeningItemType.Multiple,
                titleId: "market_title_spe",
                icon: 'icon_Species',
                data: {
                    subTypeList: [
                        {
                            btnLblId: "market_btn_weapon",   
                            nftSubType: core.NftSubType.NftSubEquipmentWeapon,
                        },
                        {
                            btnLblId: "market_btn_armor",   
                            nftSubType: core.NftSubType.NftSubEquipmentArmor,
                        },
                        {
                            btnLblId: "market_btn_jewelry",   
                            nftSubType: core.NftSubType.NftSubEquipmentJewelry,
                        },
                    ]
                }
            },
            {
                type: MarketScreeningItemType.Multiple,
                titleId: "market_title_quality",
                icon: 'icon_Quality',
                data: {
                    qualityList: [
                        {
                            btnLblId: "market_equip_quality1",
                            quality: 1,
                        },
                        {
                            btnLblId: "market_equip_quality2",
                            quality: 2,
                        },
                        {
                            btnLblId: "market_equip_quality3",
                            quality: 3,
                        },
                        {
                            btnLblId: "market_equip_quality4",
                            quality: 4,
                        },
                    ]
                }
            },
        ]
    }

    initItemConf() {
        this.confs = [
            {
                type: MarketScreeningItemType.Single,
                titleId: "market_title_purpose",
                icon: 'icon_Purpose',
                data: {
                    subTypeList: [
                        {
                            btnLblId: "market_btn_itemcard",   
                            nftSubType: core.NftSubType.NftSubBoxCard,
                        },
                        {
                            btnLblId: "market_btn_itemequip",   
                            nftSubType: core.NftSubType.NftSubBoxEquipment,
                        },
                        // {
                          
                        //     nftSubType: core.NftSubType.NftSubBoxTreasure,
                        // },
                        // {
                          
                        //     nftSubType: core.NftSubType.NftSubItem,
                        // },
                    ]
                }
            },
            // {
            //     type: MarketScreeningItemType.Multiple,
            //     titleId: "market_title_lv",
            //     icon: 'icon_Level',
            //     data: {
            //     }
            // },
        ]
    }

    renderEvent(item: Node, idx: number) {
        let conf = this.confs[idx];
        item.getComponent(MarketScreeningItem).init(this, conf);
    }

    closeClick() {
        oops.gui.removeByNode(this.node, true);
    }

    resetClick() {
        this.param.conf = null;
        this.init();
    }

    confirmClick() {
        let d = watrade.TradeQueryReq.create();

        this.confs.forEach(e => {
            if (e.data.level) {
                d.levelList = e.data.level.selNum.filter(v => v > 0);
            } else if (e.data.rangeSlider) {
                if (e.data.rangeSlider.isCheck) {
                    d.attrMinVals[e.data.rangeSlider.attrId] = Math.round(e.data.rangeSlider.selMin * 100);
                    d.attrMaxVals[e.data.rangeSlider.attrId] = Math.round(e.data.rangeSlider.selMax * 100);
                    d.attrList.push(e.data.rangeSlider.attrId);
                }
            } else if (e.data.attrList) {
                e.data.attrList.forEach(e => {
                    if (e.isCheck) {
                        d.attrList.push(e.attrId);
                    }
                })
            } else if (e.data.protoIdList) {
                e.data.protoIdList.forEach(e => {
                    if (e.isCheck) {
                        d.protoIdList.push(e.protoId);
                    }
                })
            } else if (e.data.qualityList) {
                e.data.qualityList.forEach(e => {
                    if (e.isCheck) {
                        d.qualityList.push(e.quality);
                    }
                })
            } else if (e.data.subTypeList) {
                e.data.subTypeList.forEach(e => {
                    if (e.isCheck) {
                        d.subTypeList.push(e.nftSubType);
                    }
                })
            }
        });
        this.closeClick();
        this.param.cb && this.param.cb(d, this.confs);
    }
}

