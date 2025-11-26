import { _decorator, Component, Node, instantiate, Label, tween, v3, easing, Prefab, Animation, UIOpacity, Vec3, Tween, sp } from 'cc';
import { type } from 'os';
import { Message } from '../../core/common/event/MessageManager';
import { LanguageLabel } from '../../core/gui/language/LanguageLabel';
import { oops } from '../../core/Oops';
import { CommonUtil } from '../../core/utils/CommonUtil';
import { GameEvent } from '../common/config/GameEvent';
import TableBlindBox from '../common/table/TableBlindBox';
import TableEquipRaity from '../common/table/TableEquipRaity';
import TableMaterialBoxContent from '../common/table/TableMaterialBoxContent';
import TableNfts from '../common/table/TableNfts';
import { PlayerManger } from '../data/playerManager';
import { AudioSoundRes } from '../data/resManger';
import { HomeTurnPagesParam } from '../homeUI/HomeBottom';
import { HOMEPAGEENUM } from '../homeUI/HomeEvent';
import { WalletCard } from '../walletUI/widget/WalletCard';
import { WalletEquipment } from '../walletUI/widget/WalletEquipment';
import { WalletMaterial } from '../walletUI/widget/WalletMaterial';
const { ccclass, property } = _decorator;

enum BlindBoxType {
    BoxCard,
    BoxEquipment,
    BoxMaterialBox,
}

@ccclass('BlindBoxOpenMultiPopUp')
export class BlindBoxOpenMultiPopUp extends Component {
    @property(Node)
    okBtnNode: Node = null;
    @property(Node)
    toCardBtnNode: Node = null;
    @property(Node)
    openEffect: Node = null;
    @property(Prefab)
    materialPrefab: Prefab = null;
    @property(Prefab)
    cardPrefab: Prefab = null;
    @property(Prefab)
    equipPrefab: Prefab = null;
    @property(LanguageLabel)
    nameLbl: LanguageLabel = null;
    @property(Label)
    openNumLbl: Label = null;
    @property(Label)
    numLbl: Label = null;
    @property(Node)
    noneInfoBg: Node = null;
    boxInfo: core.IIdCount;
    cards: core.ICard[] = [];
    equipments: core.IEquipment[] = [];
    materialBoxes: core.IIdCount[] = [];

    blindBoxType: BlindBoxType = null;

    @property(sp.Skeleton)
    cardBoxSk: sp.Skeleton = null;
    @property(sp.Skeleton)
    equipmentBoxSk: sp.Skeleton = null;
    @property(sp.Skeleton)
    materialBoxSk: sp.Skeleton = null;
    curBoxSk: sp.Skeleton = null;
    isFirstOpen = false;
    isClick = true;
    animCurIdx = 0;
    @property(Node)
    exhibitNode: Node = null;
    cardIds: number[] = [];
    start() {

    }

    update(deltaTime: number) {

    }

    public async onAdded(param: BlindBoxOpenMultiPopUpParam) {
        this.animCurIdx = 0;
        this.exhibitNode.children.forEach(e => e.destroyAllChildren());
        this.isFirstOpen = true;
        this.cardBoxSk.node.active = false;
        this.equipmentBoxSk.node.active = false;
        this.materialBoxSk.node.active = false;

        if (param.blindBoxData) {
            let data = param.blindBoxData;
            let blinkBox = TableBlindBox.getInfoById(data.id);
            if (blinkBox.type == core.NftSubType.NftSubBoxCard) {
                this.cards = data.cards;
                this.cardIds = [];
                this.cards.forEach(e => this.cardIds.push(e.id));
                this.blindBoxType = BlindBoxType.BoxCard;
                this.curBoxSk = this.cardBoxSk;
            } else if (blinkBox.type == core.NftSubType.NftSubBoxEquipment) {
                this.equipments = data.equips;
                this.blindBoxType = BlindBoxType.BoxEquipment;
                this.curBoxSk = this.equipmentBoxSk;
            }
        } else {
            let data = param.materialBoxesData;
            this.materialBoxes = data.contents;
            this.blindBoxType = BlindBoxType.BoxMaterialBox;
            this.curBoxSk = this.materialBoxSk;
        }
        this.curBoxSk.node.active = true;
        this.curBoxSk.setCompleteListener(() => {
            this.curBoxSk.setAnimation(0, 'chixu', false)
        });

        // this.blindBoxType = core.NftSubType.NftSubBoxCard;
        // this.cards = [
        //     core.Card.create({ protoId: 1001, level: 1 }),
        //     core.Card.create({ protoId: 1002, level: 1 }),
        //     core.Card.create({ protoId: 1003, level: 1 }),
        //     core.Card.create({ protoId: 1004, level: 1 }),
        //     core.Card.create({ protoId: 1005, level: 1 }),
        // ]
        // this.blindBoxType = core.NftSubType.NftSubBoxEquipment;
        // this.equipments = [
        //     core.Equipment.create({ protoId: 1, equipRarity: 1 }),
        //     core.Equipment.create({ protoId: 2, equipRarity: 1 }),
        //     core.Equipment.create({ protoId: 3, equipRarity: 1 }),
        // ]
        this.updNum();

        // this.okBtnNode.active = false;
        while (true) {
            if (this.cards.length == 0
                && this.equipments.length == 0
                && this.materialBoxes.length == 0) {
                break;
            }
            await this.okClick();
        }
        // this.okBtnNode.active = true;

    }

    onRemoved() {
    }

    updNum() {
        let num = 0;
        if (this.blindBoxType == BlindBoxType.BoxEquipment) {
            num = this.equipments.length;
        } else if (this.blindBoxType == BlindBoxType.BoxCard) {
            num = this.cards.length;
        } else if (this.blindBoxType == BlindBoxType.BoxMaterialBox) {
            num = this.materialBoxes.length;
        }
        this.numLbl.string = `${num}`
        this.numLbl.node.parent.active = num > 0;
    }

    createCard(cardInfo: core.ICard) {
        let prefab = this.cardPrefab;
        let node = instantiate(prefab);
        let card = node.getComponent(WalletCard);
        this.noneInfoBg.destroyAllChildren();
        this.noneInfoBg.addChild(card.node);
        card.init(cardInfo)
        this.nameLbl.dataID = `${card.baseCard.cardCfg.name}`;
        this.openNumLbl.node.active = false;
        this.openNumLbl.string = '';
        return card.node;
    }

    createEquip(equipInfo: core.IEquipment) {
        let prefab = this.equipPrefab;
        let node = instantiate(prefab);
        let equipment = node.getComponent(WalletEquipment);
        this.noneInfoBg.destroyAllChildren();
        this.noneInfoBg.addChild(equipment.node);
        equipment.init(equipInfo)
        let name = TableEquipRaity.getInfoByEquipIdAndRarity(equipInfo.protoId, equipInfo.equipRarity)?.name;
        this.nameLbl.dataID = `${name}`;
        this.openNumLbl.node.active = false;
        this.openNumLbl.string = '';
        return equipment.node;
    }
    createMaterialBox(materialBox: core.IIdCount) {
        let prefab = this.materialPrefab;
        let node = instantiate(prefab);
        let material = node.getComponent(WalletMaterial);
        this.noneInfoBg.destroyAllChildren();
        this.noneInfoBg.addChild(material.node);
        let box = TableMaterialBoxContent.getInfoById(materialBox.id);
        let nftCfg = TableNfts.getInfoById(box.nft_id);
        let materialInfo = core.Material.create(
            {
                tokenType: nftCfg.material_type,
                total: materialBox.cnt,
            }
        )
        material.init(materialInfo);
        material.hideNum();
        this.nameLbl.dataID = `${material.baseMaterial.nftCfg.display_name}`;
        this.openNumLbl.node.active = true;
        this.openNumLbl.string = `X${materialBox.cnt}`;
        return material.node;
    }

      
    openAction(node: Node) {
        this.isClick = false;

        return new Promise((resolve) => {
            let opt = node.addComponent(UIOpacity);
            opt.opacity = 0;
            let optLbl = this.nameLbl.node.parent.getComponent(UIOpacity) ?? this.nameLbl.node.parent.addComponent(UIOpacity);
            Tween.stopAllByTarget(optLbl);
            this.openEffect.active = false;
            optLbl.opacity = 0;
            node.setWorldPosition(this.curBoxSk.node.parent.worldPosition);
            node.setScale(Vec3.ZERO);
            tween(node)
                .call(() => {
                    if (this.isFirstOpen) {
                        this.curBoxSk.setAnimation(0, 'chuchang', false);
                    } else {
                        this.curBoxSk.setAnimation(0, 'dianji', false);
                    }
                    this.isFirstOpen = false;
                    tween(opt)
                        .to(0.4, { opacity: 255 })
                        .start();
                })
                .delay(0.2)
                .call(() => {
                    tween(optLbl)
                        .delay(0.4)
                        .to(0.1, { opacity: 255 })
                        .start();
                })
                .parallel(
                    tween<Node>()
                        .to(0.3, { eulerAngles: v3(0, 360, 0) }, { easing: easing.smooth }),
                    tween<Node>()
                        .to(0.5, { position: v3(0, 0, 0) }, { easing: easing.smooth }),
                    tween<Node>()
                        .to(0.4, { scale: v3(2, 2, 2) }, { easing: easing.smooth }),
                )
                .call(() => {
                    let pos = node.worldPosition.clone();
                    node.removeFromParent();
                    optLbl.opacity = 0;

                    this.exhibitNode.children[this.animCurIdx++].addChild(node);
                    node.setWorldPosition(pos);
                    tween(node)
                        .delay(0.2)
                        .to(0.2, { position: Vec3.ZERO, scale: v3(1, 1, 1) })
                        .call(() => {
                            this.nameLbl.dataID = '';
                            this.nameLbl.getComponent(Label).string = '';
                            this.openEffect.active = false;

                            if (this.cards.length == 0
                                && this.equipments.length == 0
                                && this.materialBoxes.length == 0) {
                                this.toCardBtnNode.active = true;
                            }
                            this.isClick = true;
                            resolve(true);
                        })
                        .start();

                    this.openEffect.active = true;
                })
                .start();
        })
    }

    async okClick() {
        if (this.isClick == false) return;

        if (this.cards.length == 0
            && this.equipments.length == 0
            && this.materialBoxes.length == 0) {
            this.closeClick();
            return
        }
        if (this.blindBoxType == BlindBoxType.BoxMaterialBox) {
            oops.audio.playEffect(AudioSoundRes.clickGetEquip);

            let node = this.createMaterialBox(this.materialBoxes.shift());
            await this.openAction(node);
        } else if (this.blindBoxType == BlindBoxType.BoxEquipment) {
            oops.audio.playEffect(AudioSoundRes.clickGetEquip);

            let node = this.createEquip(this.equipments.shift());
            await this.openAction(node);
        } else if (this.blindBoxType == BlindBoxType.BoxCard) {
            oops.audio.playEffect(AudioSoundRes.clickGetEquip);

            let node = this.createCard(this.cards.shift());
            await this.openAction(node);
        }


        this.updNum();
    }

    async toCard() {
        // Message.dispatchEvent(GameEvent.HomeTurnPages,
        //     <HomeTurnPagesParam>{ page: HOMEPAGEENUM.CARDSPAGE });
        // oops.gui.removeByNode(this.node, true);
        let playCardGroup = PlayerManger.getInstance().cardManager.playCardGroup;
        let len = playCardGroup.cardGroupLen;
        let emptyIdx = -1;
        for (let index = 0; index < len; index++) {
            let d = playCardGroup.isEmptyCardGroupByIndx(index);
            if (d.ok) {
            } else {
                emptyIdx = index;
                break;
            }
        }

        let groupId = playCardGroup.getCardGroupIdByIndx(emptyIdx);
        if (emptyIdx == -1 && groupId != -1) {
            oops.gui.toast("tip_empty_group", true);
        } else {
            let bf = await playCardGroup.upMultiGroup(groupId, this.cardIds);
            if (bf) {
                playCardGroup.setCurrCardGroupInd(emptyIdx);
                this.cardIds.forEach(e => PlayerManger.getInstance().cardManager.readHot(e));
                oops.gui.removeByNode(this.node, true);
            }
        }

    }

    closeClick() {
        oops.gui.removeByNode(this.node, true);
    }
}

export type BlindBoxOpenMultiPopUpParam = {
      
    blindBoxData?: {
        id: number
        cards?: core.ICard[]
        equips?: core.IEquipment[]
    }
      
    materialBoxesData?: pkgsc.ScMaterialBoxesOpenPush
}