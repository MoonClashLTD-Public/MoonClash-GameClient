import { _decorator, Component, Node, Vec3, instantiate, ScrollView, EventTouch, Label, Toggle, Sprite, color, RichText, Widget, tween, UITransform, v3, Tween, UIOpacity } from 'cc';
import { LanguageData } from '../../../../core/gui/language/LanguageData';
import { tips } from '../../../../core/gui/prompt/TipsManager';
import { oops } from '../../../../core/Oops';
import { CommonUtil } from '../../../../core/utils/CommonUtil';
import { UIID } from '../../../common/config/GameUIConfig';
import { EquipInfoPrefabBtnColor, EquipInfoPrefabParam, EquipmentInfoPrefab } from '../../../common/equipment/EquipmentInfoPrefab';
import { EquipmentPrefab, EquipPrefabType } from '../../../common/equipment/EquipmentPrefab';
import HttpHome, { EGasType } from '../../../common/net/HttpHome';
import { netChannel } from '../../../common/net/NetChannelManager';
import { IAlertPopConfig } from '../../../common/pop/CommonAlert';
import TableEquip from '../../../common/table/TableEquip';
import TableEquipAttr from '../../../common/table/TableEquipAttr';
import TableEquipCompose, { TableEquipComposeCfg } from '../../../common/table/TableEquipCompose';
import TableNfts from '../../../common/table/TableNfts';
import { PlayerManger } from '../../../data/playerManager';
import { AudioSoundRes, ResManger } from '../../../data/resManger';
import { EquipAttrCom } from '../../com/EquipAttrCom';
import { IEquipCardPopCfg, IEquipMergeInfoPopCfg } from '../../utils/enum';
import { ETUseTipPopConfig } from '../ETConsumeTip';
import { IInitMergeOkCfg } from './ETMergeOkPop';
const { ccclass, property } = _decorator;

@ccclass('ETMergePop')
export class ETMergePop extends Component {
    @property(ScrollView)
    private mainScrollView: ScrollView = null
    @property(EquipmentPrefab)
    private currEquip: EquipmentPrefab = null
    @property(EquipmentPrefab)
    private nextEquip: EquipmentPrefab = null
    @property(EquipAttrCom)
    private etAttrCom: EquipAttrCom = null
    @property(Node)
    private attrTip: Node = null
    @property(Node)
    private attrContentPos: Node = null
    @property(Node)
    private cardLayout: Node = null
    @property(Label)
    private dggLb: Label = null
    @property(Label)
    private dnaLb: Label = null
    @property(Toggle)
    private needProp: Toggle = null
    @property(Sprite)
    private propIcon: Sprite = null
    @property(Node)
    private useNode: Node = null
    @property(Node)
    private composeClickNode: Node = null
    @property(RichText)
    private composeWeightTxt: RichText = null

    private get equipPrefab() {
        return ResManger.getInstance().getEquipPrefab()
    }

    private get equips() {
        return PlayerManger.getInstance().equipManager.playEquips
    }

    private equipPop: EquipmentInfoPrefab

    private extra_material_proto_id = core.NftMaterialType.MaterialNone
    async onLoad() {
        this.extra_material_proto_id = TableEquipCompose.currMaterialId
        const nft = TableNfts.getInfoByMaterialType(this.extra_material_proto_id)
        this.propIcon.spriteFrame = await ResManger.getInstance().getIconSpriteFrame(nft.Id)
        if (!this.equipPop) {
            this.equipPop = await ResManger.getInstance().getEquipInfoPrefab()
            if (this.equipPop) this.node.addChild(this.equipPop.node)
        }
    }

    private config: IEquipCardPopCfg
    private equipType: core.EquipmentType
    onAdded(params: IEquipCardPopCfg) {
        if (!params?.id) throw new Error(`params.id is null`);
        this.config = params
        this.currEquip?.init({ id: params.id, equipPrefabType: EquipPrefabType.Info })
        this.updateAttr()
        this.equipType = this.currEquip.equipInfoCom.equipCfg.equipment_type
        this.updateCardItems()
    }

    private updateAttr() {
        const nextId = this.nextEquip.param?.id ?? -1
        let ids = []
        if (nextId > 0 && this.nextEquip.node.active) {
            ids = [this.config.id, nextId]
        } else {
            ids = [this.config.id]
        }
        this.etAttrCom?.init(ids)
    }

    flag = 0;
    private equipPrefabKV: { [num: number]: EquipmentPrefab } = {}
      
    private async updateCardItems() {
        let flag = ++this.flag;
        if (!this.cardLayout) return
        const equipCom = await this.equipPrefab
        const equipIds = this.equips.equipIds || []
        this.cardLayout?.destroyAllChildren()
        this.equipPrefabKV = {}
        for (const key in equipIds) {
            const equipId = equipIds[key]
            const equipData = this.equips.getEquipmentById(equipId)
            if (equipData.state != core.NftState.NftStateBlank) continue
            const _equipCfg = TableEquip.getInfoById(equipData?.protoId)
            if (_equipCfg.equipment_type != this.equipType) continue
            if (equipId == this.config?.id) continue
            let cardPre = instantiate(equipCom);
            this.cardLayout?.addChild(cardPre)
            const equipPrefab = cardPre.getComponent(EquipmentPrefab)
            equipPrefab?.init({
                id: equipId,
                equipPrefabType: EquipPrefabType.Info,
                cb: () => {
                    if (equipId != this.currId) {
                        this.changePopState(equipPrefab)
                    }
                }
            })
            this.equipPrefabKV[equipId] = equipPrefab

            await CommonUtil.waitCmpt(this, 0);
            if (flag != this.flag) return;
        }
    }

    private prevId = -1
    private currId = -1
    private updateChooseItem(equipId: number) {
        this.prevId = this.currId
        this.currId = equipId
        if (this.prevId != -1) this.equipPrefabKV[this.prevId]?.setSelect(false)
        if (this.currId != -1) this.equipPrefabKV[this.currId]?.setSelect(true)
    }

    private onClose() {
        oops.gui.removeByNode(this.node, true)
    }

      
    private useProp() {
        const nft = TableNfts.getInfoByMaterialType(this.extra_material_proto_id)
        const propCount = nft?.count || 0
        if (propCount == 0) {
            tips.errorTip('tip_no_prop', true)
        } else {
            this.needProp.isChecked = !this.needProp.isChecked
            const cost = this.getCost()
            if (!cost) return
            // const { dgg, dna } = cost
            // this.dggLb.string = dgg.toString()
            // this.dnaLb.string = dna.toString()
            this.upComposeWeight(cost?.composeWeights)
            if (this.needProp.isChecked) this.onToggleAttrTip(null)
        }
    }

    private onToggleAttrTip(event: EventTouch) {
        this.equipPop?.hide()
        this.mainScrollView.scrollToTop()
        if (this.attrTip) this.attrTip.active = !this.attrTip.active
        if (this.attrTip.active) {
            const clickPos = this.composeClickNode.getWorldPosition()
            // clickPos.y -= 20
            this.attrContentPos.setWorldPosition(clickPos)
        }
    }

    private changePopState(equipPrefab: EquipmentPrefab) {
        if (equipPrefab) {
            this.d.id = equipPrefab.param.id
            this.equipPop?.show(this.d, equipPrefab.node, this.mainScrollView);
        } else {
            this.equipPop?.hide()
        }
    }

    private async onCompose() {
        const args = pkgcs.CsEquipComposeReq.create()
        args.equipIds = [this.currEquip.param.id, this.nextEquip.param.id]
        args.extraMaterialId = this.needProp.isChecked ? this.extra_material_proto_id : core.NftMaterialType.MaterialNone
        let d = await netChannel.home.reqUnique(opcode.OpCode.CsEquipComposeReq, opcode.OpCode.ScEquipComposeResp, args);
        if (d?.code == errcode.ErrCode.WaitComplete) {
            let _d = await tips.showNetLoadigMask<pkgsc.ScEquipComposePush>({
                closeEventName: `${opcode.OpCode.ScEquipComposePush}`,
            })
            if (!_d) return
            if (_d?.code == errcode.ErrCode.Ok) {
                this.config.cb && this.config.cb()
                this.onClose()
                oops.audio.playEffect(AudioSoundRes.equipComposite);
                if (_d?.equip) oops.gui.open<IInitMergeOkCfg>(UIID.EquipCompositeOkPop, { equip: _d?.equip })
            } else {
                this.showFailTip()
            }
        } else if (d.code != errcode.ErrCode.Ok) {
            this.showFailTip()
        }
    }

    private async onConfirm() {
        const cost = this.getCost()
        if (!cost) return
        const { dgg, dna } = cost
        const args: ETUseTipPopConfig = { okFunc: () => this.onCompose(), titleDataID: "tip_title_merge" }
        if (dgg != '0') args.dggNum = Number(dgg)
        if (dna != '0') args.dnaNum = Number(dna)
        if (this.needProp?.isChecked) args.stoneNum = 1
        const argReqs = pkgcs.CsEquipComposeReq.create()
        argReqs.equipIds = [this.currEquip.param.id, this.nextEquip.param.id]
        argReqs.extraMaterialId = this.needProp.isChecked ? this.extra_material_proto_id : core.NftMaterialType.MaterialNone
        const ret = await HttpHome.queryGas1(EGasType.EQUIP_UPGRADE, argReqs)
        if (!ret) return
        args.gas = ret.gas
        oops.gui.open(UIID.ETConsumeTip, args)
    }

      
    private getCost() {
        const nextId = this.nextEquip.param?.id ?? -1
        if (nextId == 0 || nextId == -1) return
        let minRarity = this.currEquip.equipInfoCom.equipData?.equipRarity
        let maxRarity = this.nextEquip.equipInfoCom.equipData?.equipRarity
        if (minRarity > maxRarity) {
            let rarity = minRarity
            minRarity = maxRarity
            maxRarity = rarity
        }
        const materialId = this.needProp.isChecked ? this.extra_material_proto_id : core.NftMaterialType.MaterialNone
        const composeCfg = TableEquipCompose.getInfoByABAndMaterial(minRarity, maxRarity, materialId)
        if (!composeCfg) return
        const dgg = this.showGwei(composeCfg.cost.dgg_gwei)
        const dna = this.showGwei(composeCfg.cost.dna_gwei)
        return { dgg: dgg, dna: dna, composeWeights: composeCfg.rarity_weights }
    }

    private showGwei(gwei: number) {
        return CommonUtil.gweiToNum((gwei || 0).toString())
    }

    private d: EquipInfoPrefabParam = {
        cb: (event, cbFlag) => this.cb(event, cbFlag),
        btns: [
            {
                i18nKey: "pop_btn_1",
                btnColor: EquipInfoPrefabBtnColor.Blue,
                cbFlag: "et_merge_pop_btn_info"
            },
            {
                i18nKey: "pop_btn_7",
                btnColor: EquipInfoPrefabBtnColor.Yellow,
                cbFlag: "et_merge_pop_btn_check"
            }
        ]
    }

    private cb(event, cbFlag: string) {
        const eId = this.equipPop.param.id
        if (cbFlag == "et_merge_pop_btn_info") {
            const args: IEquipMergeInfoPopCfg = { id: eId, checkClick: () => this.setNextEquipCard(eId) }
            oops.gui.open(UIID.EquipmentCompositeCardInfoPop, args)
        } else if (cbFlag == "et_merge_pop_btn_check") {
            this.setNextEquipCard(eId)
            this.equipPop?.hide()
        }
    }

    private async setNextEquipCard(id: number) {
        const equipRarity = this.currEquip.equipInfoCom.equipData.equipRarity
        const equip = this.equips.getEquipmentById(id)
          
        if (equip.equipRarity == equipRarity && equipRarity == 1) {
            tips.errorTip('toast_merge_same_rarity_one', true)
            return
        }
        this.nextEquip.node.active = true
        this.nextEquip.init({ id: id, equipPrefabType: EquipPrefabType.Info, cb: () => this.removeNextEquip() })
        this.updateChooseItem(id)
        const cost = this.getCost()
        if (!cost) return
        // this.useNode.active = true
        const { dgg, dna } = cost
        this.dggLb.string = dgg.toString()
        this.dnaLb.string = dna.toString()
        this.updateAttr()
        this.upComposeWeight(cost?.composeWeights)
        await CommonUtil.waitCmpt(this, 0);
        this.onToggleAttrTip(null)
    }

    private upComposeWeight(composeWeights) {
        this.composeClickNode.active = true
          
        let str = ''
        for (const weight of composeWeights) {
            const wRarity = weight?.rarity ?? -1
            const wWeight = weight?.weight ?? 0
            if (wWeight == 0 || wRarity == -1) continue
            str += LanguageData.getLangByIDAndParams(`equip_compost_weight_${wRarity}`, [
                { key: "color", value: TableEquipAttr.getAttrColorByQualityType(wRarity).color.toHEX() },
                { key: "weight", value: (wWeight / 100).toString() }
            ])
        }
        this.composeWeightTxt.string = str
    }

    private removeNextEquip(animTime = 0.3) {
        const attItemUi = this.etAttrCom.getComponent(UITransform)
        const moveX = (attItemUi?.width ?? 200) / 2
        const moveY = attItemUi?.height ?? 200
        const copyNode = instantiate(this.nextEquip.node)
        const startPos = this.nextEquip.node.worldPosition
        this.node.addChild(copyNode);
        this.nextEquip.node.active = false
        this.nextEquip.init({ id: -1, equipPrefabType: EquipPrefabType.None })
        this.composeClickNode.active = false

        Tween.stopAllByTarget(copyNode)
        copyNode.setWorldPosition(startPos)
        tween(copyNode)
            .to(animTime, { worldPosition: v3(startPos.x - moveX, startPos.y - moveY, startPos.z) }, {
                onComplete: () => {
                    copyNode.destroy()
                    this.updateChooseItem(-1)
                    this.dggLb.string = '0'
                    this.dnaLb.string = '0'
                    this.updateAttr()
                }
            })
            .start()
        let cpUiOpacity = copyNode.getComponent(UIOpacity)
        if (!cpUiOpacity) cpUiOpacity = copyNode.addComponent(UIOpacity)
        if (cpUiOpacity) {
            Tween.stopAllByTarget(cpUiOpacity)
            cpUiOpacity.opacity = 255
            tween(cpUiOpacity)
                .to(animTime, { opacity: 0.3 })
                .start();
        }

    }

    private showFailTip() {
        oops.gui.open<IAlertPopConfig>(UIID.CommonAlert, {
            title: 'equip_compose_err_name',
            content: 'equip_compose_err_content',
            okWord: 'common_prompt_ok',
            contentParams: [
                {
                    key: 'name',
                    value: `${this.cardName}`
                },
            ],
        })
    }

    private get cardName() {
        return this.currEquip.equipInfoCom.equipCfg.showName || ''
    }
}

