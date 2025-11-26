import { _decorator, Component, Node, Label, Button, v3 } from 'cc';
import ListItemOptimize from '../../../core/gui/scrollView/ListItemOptimize';
import { CommonUtil } from '../../../core/utils/CommonUtil';
import { PlayerManger } from '../../data/playerManager';
import WalletUtil, { TradeFlagState } from '../WalletUtil';
import { WalletBlindBox } from './WalletBlindBox';
import { WalletCard } from './WalletCard';
import { WalletEquipment } from './WalletEquipment';
import { WalletMaterial } from './WalletMaterial';
const { ccclass, property, type } = _decorator;

@ccclass('WalletBigCard')
export class WalletBigCard extends Component {
    @type(WalletCard)
    walletCard: WalletCard = null;
    @type(WalletEquipment)
    walletEquip: WalletEquipment = null;
    @type(WalletMaterial)
    walletMaterial: WalletMaterial = null;
    @type(WalletBlindBox)
    walletBlindBox: WalletBlindBox = null;
    @type(Node)
    flagNode: Node = null;
    cb: Function = null;
    cardInfo: core.ICard = null;
    equipmentInfo: core.IEquipment = null;
    materialInfo: core.IMaterial = null;
    blindBoxInfo: {
        [k: string]: number;
    } = null;
    state: TradeFlagState = TradeFlagState.NOT_READY;
    rentTime = 0;
    start() {
        this.node.addComponent(ListItemOptimize);

        this.schedule(this.updRentTime, 1);
    }

    update(deltaTime: number) {
    }

    updRentTime() {
        // if (this.state == TradeFlagState.RENT_TIME)
        // this.initCard(this.cardInfo);
        if (this.state == TradeFlagState.RENT_TIME) {
            let node = this.flagNode.children[TradeFlagState.RENT_TIME];
            let timeLbl = node.getChildByName('timeLbl').getComponent(Label);
            let isMe = this.cardInfo?.onChainRenter == PlayerManger.getInstance().playerSelfInfo.walletAddr;
            node.getChildByName('Label').active = !isMe;
            node.getChildByName('Label1').active = isMe;
            let time = this.rentTime - new Date().getTime() / 1000;
            let d = CommonUtil.countDownDays(time > 0 ? time : 0);
            let str = `${d.d}D ${d.h}H ${d.m}M ${d.s}S`;
            timeLbl.string = `${str}`;
        }
    }

    init(cb: Function) {
        this.updState();

        this.walletCard.node.active = false;
        this.walletEquip.node.active = false;
        this.walletMaterial.node.active = false;
        this.walletBlindBox.node.active = false;

        let s = v3(0.8, 0.8, 0.8);
        if (this.cardInfo) s = v3(1, 1, 1);
        this.walletCard.node.setScale(s);
        this.walletEquip.node.setScale(s);
        this.walletMaterial.node.setScale(s);
        this.walletBlindBox.node.setScale(s);
        this.cb = cb;
        this.node.getComponent(Button).enabled = !!this.cb;
    }

    updState() {
        for (let index = 0; index < this.flagNode.children.length; index++) {
            let node = this.flagNode.children[index];
            node.active = index == this.state;
        }
        this.updRentTime();
    }

    initCard(card: core.ICard, cb?: Function) {
        let data = WalletUtil.nftCardStatetoLocalState(card);
        this.rentTime = data.rentTime;
        this.state = data.state;
        this.cardInfo = card;
        this.walletCard.init(card);
        this.init(cb);
        this.walletCard.node.active = true;
    }

    initEquip(equipment: core.IEquipment, cb?: Function) {
        let data = WalletUtil.nftEquipStatetoLocalState(equipment);
        this.state = data.state;
        this.equipmentInfo = equipment;
        this.walletEquip.init(equipment);
        this.init(cb);
        this.walletEquip.node.active = true;
    }

    initMaterial(material: core.IMaterial, cb?: Function) {
        this.materialInfo = material;
        this.walletMaterial.init(material);
        this.init(cb);
        this.walletMaterial.node.active = true;
    }

      
    initBlindBox(blindBox: {
        [k: string]: number;
    }, cb?: Function) {
        this.blindBoxInfo = blindBox;
        // this.walletMaterial.init(material);
        this.walletBlindBox.init(blindBox);
        this.init(cb);
        this.walletBlindBox.node.active = true;
    }

      
    setMaterialState(state: TradeFlagState) {
        this.state = state;
        this.updState();
    }

    cardClick() {
        this.cb && this.cb(this);
    }
}

