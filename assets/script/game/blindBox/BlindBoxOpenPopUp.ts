import { _decorator, Component, Node, instantiate, Label, tween, v3, easing, Prefab, Animation, UIOpacity, Vec3, Tween, sp } from 'cc';
import { type } from 'os';
import { LanguageLabel } from '../../core/gui/language/LanguageLabel';
import { oops } from '../../core/Oops';
import { CommonUtil } from '../../core/utils/CommonUtil';
import TableBlindBox from '../common/table/TableBlindBox';
import TableEquipRaity from '../common/table/TableEquipRaity';
import TableGoldBoxContent from '../common/table/TableGoldBoxContent';
import TableMaterialBoxContent from '../common/table/TableMaterialBoxContent';
import TableNfts from '../common/table/TableNfts';
import TableSpBoxContent from '../common/table/TableSpBoxContent';
import { PlayerManger } from '../data/playerManager';
import { AudioSoundRes } from '../data/resManger';
import { WalletCard } from '../walletUI/widget/WalletCard';
import { WalletEquipment } from '../walletUI/widget/WalletEquipment';
import { WalletMaterial } from '../walletUI/widget/WalletMaterial';
const { ccclass, property } = _decorator;

enum BlindBoxType {
    BoxCard,
    BoxEquipment,
    BoxMaterialBox,
    BoxDna,
}

@ccclass('BindBoxOpenPopUp')
export class BindBoxOpenPopUp extends Component {
    @property(Node)
    openEffect: Node = null;
    @property(Prefab)
    materialPrefab: Prefab = null;
    @property(Prefab)
    cardPrefab: Prefab = null;
    @property(Prefab)
    equipPrefab: Prefab = null;
    @property(Node)
    dnaNode: Node = null;
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
    dnaBoxs: string[] = [];

    blindBoxType: BlindBoxType = null;

    @property(sp.Skeleton)
    cardBoxSk: sp.Skeleton = null;
    @property(sp.Skeleton)
    equipmentBoxSk: sp.Skeleton = null;
    @property(sp.Skeleton)
    materialBoxSk: sp.Skeleton = null;
    @property(sp.Skeleton)
    pointsBoxSk: sp.Skeleton = null;
    @property(sp.Skeleton)
    goldBoxSk: sp.Skeleton = null;
    curBoxSk: sp.Skeleton = null;
    isFirstOpen = false;
    isClick = true;

    boxVersion: string = '';
    start() {

    }

    update(deltaTime: number) {

    }

    public onAdded(param: BlindBoxOpenPopUpParam) {
        this.isFirstOpen = true;
        this.boxVersion = "";
        this.cardBoxSk.node.active = false;
        this.equipmentBoxSk.node.active = false;
        this.materialBoxSk.node.active = false;
        this.pointsBoxSk.node.active = false;
        this.goldBoxSk.node.active = false;

        if (param.blindBoxData) {
            let data = param.blindBoxData;
            let blinkBox = TableBlindBox.getInfoById(data.id);
            if (blinkBox.type == core.NftSubType.NftSubBoxCard) {
                this.cards = data.cards;
                this.blindBoxType = BlindBoxType.BoxCard;
                this.curBoxSk = this.cardBoxSk;
            } else if (blinkBox.type == core.NftSubType.NftSubBoxEquipment) {
                this.equipments = data.equips;
                this.blindBoxType = BlindBoxType.BoxEquipment;
                this.curBoxSk = this.equipmentBoxSk;
            }
        } else if (param.materialBoxesData) {
            let data = param.materialBoxesData;
            this.boxVersion = data.version;
            this.materialBoxes = data.contents;
            this.blindBoxType = BlindBoxType.BoxMaterialBox;
        } else if (param.boxData) {
            let data = param.boxData;
            this.boxVersion = data.version;
            this.dnaBoxs = [data.dnaWei];
            this.blindBoxType = BlindBoxType.BoxDna;
        }

        if (this.boxVersion == "v1") {
            this.curBoxSk = this.materialBoxSk;
        } else if (this.boxVersion == "v2") {
            this.curBoxSk = this.pointsBoxSk;
        } else if (this.boxVersion == "v3") {
            this.curBoxSk = this.goldBoxSk;
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
        this.okClick();
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
        if (this.boxVersion == "v2") {
            box = TableSpBoxContent.getInfoById(materialBox.id);
        } else if (this.boxVersion == "v3") {
            box = TableGoldBoxContent.getInfoById(materialBox.id);
        }
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
    createDna(dnaWei: string) {
        let prefab = this.dnaNode;
        let node = instantiate(prefab);
        node.setPosition(Vec3.ZERO);
        this.noneInfoBg.destroyAllChildren();
        this.noneInfoBg.addChild(node);
        this.nameLbl.dataID = `DNA`;
        this.nameLbl.node.active = false;
        this.openNumLbl.node.active = true;
        this.openNumLbl.string = 'x' + CommonUtil.weiToEther(dnaWei).toFixed();
        return node;
    }

      
    openAction(node: Node) {
        this.isClick = false;

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
                this.openEffect.active = true;
                this.isClick = true;
            })
            .start();
    }

    okClick() {
        if (this.isClick == false) return;

        if (this.cards.length == 0
            && this.equipments.length == 0
            && this.dnaBoxs.length == 0
            && this.materialBoxes.length == 0) {
            this.closeClick();
            return
        }
        if (this.blindBoxType == BlindBoxType.BoxMaterialBox) {
            oops.audio.playEffect(AudioSoundRes.clickGetEquip);

            let node = this.createMaterialBox(this.materialBoxes.shift());
            this.openAction(node);
        } else if (this.blindBoxType == BlindBoxType.BoxEquipment) {
            oops.audio.playEffect(AudioSoundRes.clickGetEquip);

            let node = this.createEquip(this.equipments.shift());
            this.openAction(node);
        } else if (this.blindBoxType == BlindBoxType.BoxCard) {
            oops.audio.playEffect(AudioSoundRes.clickGetEquip);

            let node = this.createCard(this.cards.shift());
            this.openAction(node);
        } else if (this.blindBoxType == BlindBoxType.BoxDna) {
            oops.audio.playEffect(AudioSoundRes.clickGetEquip);

            let node = this.createDna(this.dnaBoxs.shift());
            this.openAction(node);
        }


        this.updNum();
    }

    closeClick() {
        oops.gui.removeByNode(this.node, true);
    }
}

export type BlindBoxOpenPopUpParam = {
      
    blindBoxData?: {
        id: number
        cards?: core.ICard[]
        equips?: core.IEquipment[]
    }
      
    materialBoxesData?: pkgsc.ScMaterialBoxesOpenPush
      
    boxData?: pkgsc.ScBlindBoxOpenPush
}