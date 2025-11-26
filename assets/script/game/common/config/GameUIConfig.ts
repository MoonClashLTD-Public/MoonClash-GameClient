/*
 * @Date: 2021-08-12 09:33:37
 * @LastEditors: dgflash
 * @LastEditTime: 2022-01-25 14:40:08
 */

import { resources } from 'cc';
import { LayerType, UIConfig } from '../../../core/gui/layer/LayerManager';

  
export enum UIID {
      
    Loading = 1,
      
    Window,
      
    Netinstable,
      
    LoadingMask,
      
    NetLoadingMask,
    /** DEMO */
    Demo,
      
    FgMask,
      
    Demo_Role_Info,
    LoginUI,
      
    TermsOfServicePopUp,
      
    PwdResetPopUp1,
    PwdResetPopUp2,
    PwdResetPopUp3,
      
    ChangePwdPopUp,
      
    SettingNewPwdPopUp,
      
    LoginPopUp,
      
    LoginAlertPopUp,
      
    RegisterPopUp1,
    RegisterPopUp2,
    BindGooglePopUp,
    BindGooglePopUp2,
    VerifyPwdPopUp,
    MatchUI,
    TVGameUI,
    TVGameInvitePopUp,
    QAUI,
    GMUI,
    BattleUI,
    HomeUI,
    CommonAlert,
    Alert,
    HomeLevelPopUp,
    CardInfoPopUp,
    EquipmentInfoPopUp,
    MaterialInfoPopUp,
    WalletCurrExchangePopUp,
    WalletCurrTransferPopUp,
    WalletCurrWithdrawPopUp,
    WalletCurrWithdrawConfirmPopUp,
    WalletSellPopUp,
    WalletCancelSellPopUp,
    WalletItemSellPopUp,
    WalletRentPopUp,
    WalletTransferPopUp,
      
    MarketCardInfoPopUp,
    MarketRentPopUp,
    MarketBuyPopUp,
    MarketLogPopUp,
    MarketItemBuyPopUp,
    MarketScreeningPopUp,
      
    SettingPopUp,
      
    SharePopUp,
    ShareCodePopUp,
    ShareDetailPopUp,
    ShareParentCodePopUp,
      
    SettingLangPopUp,
      
    FriendUI,
    FriendAssistedRecordPopUp,
    FriendBattleInvitePopUp,
      
    BlindBoxOpenPopUp,
    BlindBoxOpenMultiPopUp,
    BlindBoxBuyPopUp,
      
    CardSystemUi,
    CardSystemPop,
      
    CardSystemInfoPop,
      
    CardSysResetAttr,
    CardSysDurablePop,
    CardSysGroupDurablePop,
    CardSysUpGradePop,
    CardSysUpGradeOkPop,
    CardSysFightPop,
      
    EquipmentUI,
    EquipmentCardInfoPop,
    EquipResetAttrPop,
    EquipmentRepairPop,
    EquipmentMuitRepairPop,
    EquipmentCompositePop,
    EquipmentCompositeCardInfoPop,
    EquipCompositeOkPop,
    ETConsumeTip,
      
    PropTipMask,
    EmailPop,
    EmailDetailPop,
    /** PVE */
    PVEPop,
    PVEEqipmentPop,
    PVECardClickPop,
    PVECardAssistPop,
    PVECardSysFightPop

}

  
export var UIConfigData: { [key: number]: UIConfig } = {
    [UIID.Loading]: { layer: LayerType.UI, prefab: "loading/prefab/loading", bundle: resources.name },
    [UIID.Netinstable]: { layer: LayerType.PopUp, prefab: "common/prefab/netinstable" },
    [UIID.LoadingMask]: { layer: LayerType.PopUp, prefab: "common/prefab/loadingMask" },
    [UIID.Window]: { layer: LayerType.Dialog, prefab: "common/prefab/window" },
    [UIID.Alert]: { layer: LayerType.Alert, prefab: "common/prefab/alert" },
    [UIID.Demo]: { layer: LayerType.UI, prefab: "gui/prefab/demo" },
    [UIID.FgMask]: { layer: LayerType.Guide, prefab: "gui/prefab/fgMask" },
    [UIID.Demo_Role_Info]: { layer: LayerType.UI, prefab: "gui/prefab/role_info" },
    [UIID.LoginUI]: { layer: LayerType.UI, prefab: "gui/prefab/loginUI/loginUI" },
    [UIID.TermsOfServicePopUp]: { layer: LayerType.PopUp, prefab: "gui/prefab/loginUI/termsOfServicePopUp" },
    [UIID.PwdResetPopUp1]: { layer: LayerType.PopUp, prefab: "gui/prefab/loginUI/pwdResetPopUp1" },
    [UIID.PwdResetPopUp2]: { layer: LayerType.PopUp, prefab: "gui/prefab/loginUI/pwdResetPopUp2" },
    [UIID.PwdResetPopUp3]: { layer: LayerType.PopUp, prefab: "gui/prefab/loginUI/pwdResetPopUp3" },
    [UIID.ChangePwdPopUp]: { layer: LayerType.PopUp, prefab: "gui/prefab/loginUI/changePwdPopUp" },
    [UIID.SettingNewPwdPopUp]: { layer: LayerType.PopUp, prefab: "gui/prefab/loginUI/settingPasswordPopUp" },
    [UIID.LoginPopUp]: { layer: LayerType.PopUp, prefab: "gui/prefab/loginUI/loginPopUp" },
    [UIID.LoginAlertPopUp]: { layer: LayerType.PopUp, prefab: "gui/prefab/loginUI/loginAlertPopUp" },
    [UIID.RegisterPopUp1]: { layer: LayerType.PopUp, prefab: "gui/prefab/loginUI/registerPopUp1" },
    [UIID.RegisterPopUp2]: { layer: LayerType.PopUp, prefab: "gui/prefab/loginUI/registerPopUp2" },
    [UIID.BindGooglePopUp]: { layer: LayerType.PopUp, prefab: "gui/prefab/loginUI/bindGooglePopUp" },
    [UIID.BindGooglePopUp2]: { layer: LayerType.PopUp, prefab: "gui/prefab/loginUI/bindGooglePopUp2" },
    [UIID.VerifyPwdPopUp]: { layer: LayerType.PopUp, prefab: "gui/prefab/loginUI/verifyPasswordPopUp" },
    [UIID.HomeUI]: { layer: LayerType.UI, prefab: "gui/prefab/homeUI/homeUI" },
    [UIID.CommonAlert]: { layer: LayerType.PopUp, prefab: "common/prefab/commonAlert" },
    [UIID.BattleUI]: { layer: LayerType.UI, prefab: "gui/prefab/battle/battle" },
    [UIID.MatchUI]: { layer: LayerType.UI, prefab: "gui/prefab/matchUI" },
    [UIID.TVGameUI]: { layer: LayerType.UI, prefab: "gui/prefab/tvGameUI/tvGameUI" },
    [UIID.TVGameInvitePopUp]: { layer: LayerType.UI, prefab: "gui/prefab/tvGameUI/tvGameInvitePopUp" },
    [UIID.GMUI]: { layer: LayerType.UI, prefab: "gui/prefab/gmUI" },
    [UIID.QAUI]: { layer: LayerType.UI, prefab: "gui/prefab/qaUI" },
    [UIID.PropTipMask]: { layer: LayerType.PopUp, prefab: "common/prefab/propTipMask" },
    [UIID.CardSystemUi]: { layer: LayerType.UI, prefab: "gui/prefab/cardSystem/cardSystemUI" },
    [UIID.HomeLevelPopUp]: { layer: LayerType.PopUp, prefab: "gui/prefab/homeUI/homeLevelPopUp" },
    [UIID.CardInfoPopUp]: { layer: LayerType.PopUp, prefab: "gui/prefab/infoPopUp/cardInfoPopUp/cardInfoPopUp" },
    [UIID.EquipmentInfoPopUp]: { layer: LayerType.PopUp, prefab: "gui/prefab/infoPopUp/equipmentInfoPopUp/equipmentInfoPopUp" },
    [UIID.MaterialInfoPopUp]: { layer: LayerType.PopUp, prefab: "gui/prefab/infoPopUp/materialInfoPopUp/materialInfoPopUp" },
    [UIID.WalletCurrExchangePopUp]: { layer: LayerType.PopUp, prefab: "gui/prefab/walletUI/walletCurrExchangePopUp" },
    [UIID.WalletCurrTransferPopUp]: { layer: LayerType.PopUp, prefab: "gui/prefab/walletUI/walletCurrTransferPopUp" },
    [UIID.WalletCurrWithdrawPopUp]: { layer: LayerType.PopUp, prefab: "gui/prefab/walletUI/walletCurrWithdrawPopUp" },
    [UIID.WalletCurrWithdrawConfirmPopUp]: { layer: LayerType.PopUp, prefab: "gui/prefab/walletUI/walletCurrWithdrawConfirmPopUp" },
    [UIID.WalletSellPopUp]: { layer: LayerType.PopUp, prefab: "gui/prefab/walletUI/walletSellPopUp" },
    [UIID.WalletCancelSellPopUp]: { layer: LayerType.PopUp, prefab: "gui/prefab/walletUI/walletCancelSellPopUp" },
    [UIID.WalletItemSellPopUp]: { layer: LayerType.PopUp, prefab: "gui/prefab/walletUI/walletItemSellPopUp" },
    [UIID.WalletRentPopUp]: { layer: LayerType.PopUp, prefab: "gui/prefab/walletUI/walletRentPopUp" },
    [UIID.WalletTransferPopUp]: { layer: LayerType.PopUp, prefab: "gui/prefab/walletUI/walletTransferPopUp" },
    [UIID.MarketCardInfoPopUp]: { layer: LayerType.PopUp, prefab: "gui/prefab/market/marketCardInfoPopUp" },
    [UIID.MarketRentPopUp]: { layer: LayerType.PopUp, prefab: "gui/prefab/market/marketRentPopUp" },
    [UIID.MarketBuyPopUp]: { layer: LayerType.PopUp, prefab: "gui/prefab/market/marketBuyPopUp" },
    [UIID.MarketLogPopUp]: { layer: LayerType.PopUp, prefab: "gui/prefab/market/marketLogPopUp" },
    [UIID.MarketItemBuyPopUp]: { layer: LayerType.PopUp, prefab: "gui/prefab/market/marketItemBuyPopUp" },
    [UIID.MarketScreeningPopUp]: { layer: LayerType.PopUp, prefab: "gui/prefab/market/marketScreeningPopUp" },
    [UIID.SettingPopUp]: { layer: LayerType.PopUp, prefab: "gui/prefab/settingPopUp/settingPopUp" },
    [UIID.SharePopUp]: { layer: LayerType.PopUp, prefab: "gui/prefab/sharePopUp/sharePopUp" },
    [UIID.ShareCodePopUp]: { layer: LayerType.PopUp, prefab: "gui/prefab/sharePopUp/shareCodePopUp" },
    [UIID.ShareDetailPopUp]: { layer: LayerType.PopUp, prefab: "gui/prefab/sharePopUp/shareDetailPopUp" },
    [UIID.ShareParentCodePopUp]: { layer: LayerType.PopUp, prefab: "gui/prefab/sharePopUp/shareParentCodePopUp" },
    [UIID.SettingLangPopUp]: { layer: LayerType.PopUp, prefab: "gui/prefab/settingPopUp/settingLangPopUp" },
    [UIID.FriendUI]: { layer: LayerType.PopUp, prefab: "gui/prefab/friendUI/friendUI" },
    [UIID.FriendAssistedRecordPopUp]: { layer: LayerType.PopUp, prefab: "gui/prefab/friendUI/friendAssistedRecordPopUp" },
    [UIID.FriendBattleInvitePopUp]: { layer: LayerType.PopUp, prefab: "gui/prefab/friendUI/friendBattleInvitePopUp" },
    [UIID.BlindBoxOpenPopUp]: { layer: LayerType.PopUp, prefab: "gui/prefab/blindBox/blindBoxOpenPopUp" },
    [UIID.BlindBoxOpenMultiPopUp]: { layer: LayerType.PopUp, prefab: "gui/prefab/blindBox/blindBoxOpenMultiPopUp" },
    [UIID.BlindBoxBuyPopUp]: { layer: LayerType.PopUp, prefab: "gui/prefab/blindBox/blindBoxBuyPopUp" },
    [UIID.CardSystemPop]: { layer: LayerType.PopUp, prefab: "gui/prefab/cardSystem/pop/cardSystemPop" },
    [UIID.CardSystemInfoPop]: { layer: LayerType.PopUp, prefab: "gui/prefab/cardSystem/pop/cardInfoPop" },
    [UIID.CardSysResetAttr]: { layer: LayerType.PopUp, prefab: "gui/prefab/cardSystem/pop/csResetAttrPop" },
    [UIID.CardSysDurablePop]: { layer: LayerType.PopUp, prefab: "gui/prefab/cardSystem/pop/csDurablePop" },
    [UIID.CardSysGroupDurablePop]: { layer: LayerType.PopUp, prefab: "gui/prefab/cardSystem/pop/csGroupDurablePop" },
    [UIID.CardSysUpGradePop]: { layer: LayerType.PopUp, prefab: "gui/prefab/cardSystem/pop/csUpgradePop" },
    [UIID.CardSysUpGradeOkPop]: { layer: LayerType.PopUp, prefab: "gui/prefab/cardSystem/pop/upgradeOk" },
    [UIID.CardSysFightPop]: { layer: LayerType.PopUp, prefab: "gui/prefab/cardSystem/pop/csFightPop" },
    [UIID.NetLoadingMask]: { layer: LayerType.PopUp, prefab: "common/prefab/netLoadingMask" },
    [UIID.EquipmentUI]: { layer: LayerType.UI, prefab: "gui/prefab/equipment/equipmentUI" },
    [UIID.EquipmentCardInfoPop]: { layer: LayerType.PopUp, prefab: "gui/prefab/equipment/pop/cardInfoPop" },
    [UIID.EquipResetAttrPop]: { layer: LayerType.PopUp, prefab: "gui/prefab/equipment/pop/resetAttrPop" },
    [UIID.EquipmentRepairPop]: { layer: LayerType.PopUp, prefab: "gui/prefab/equipment/pop/repairPop" },
    [UIID.EquipmentMuitRepairPop]: { layer: LayerType.PopUp, prefab: "gui/prefab/equipment/pop/muitRepairPop" },
    [UIID.EquipmentCompositePop]: { layer: LayerType.PopUp, prefab: "gui/prefab/equipment/pop/mergePop" },
    [UIID.EquipmentCompositeCardInfoPop]: { layer: LayerType.PopUp, prefab: "gui/prefab/equipment/pop/mergeCardInfoPop" },
    [UIID.EquipCompositeOkPop]: { layer: LayerType.PopUp, prefab: "gui/prefab/equipment/pop/mergeOk" },
    [UIID.ETConsumeTip]: { layer: LayerType.PopUp, prefab: "common/prefab/equipment/ETConsumeTip" },
    [UIID.EmailPop]: { layer: LayerType.PopUp, prefab: "gui/prefab/email/emailPop" },
    [UIID.EmailDetailPop]: { layer: LayerType.PopUp, prefab: "gui/prefab/email/emailDetailPop" },
    [UIID.PVEPop]: { layer: LayerType.PopUp, prefab: "gui/prefab/pve/pvePopup" },
    [UIID.PVEEqipmentPop]: { layer: LayerType.PopUp, prefab: "gui/prefab/pve/equipmentPop" },
    [UIID.PVECardClickPop]: { layer: LayerType.PopUp, prefab: "gui/prefab/pve/cardSystemPop1" },
    [UIID.PVECardAssistPop]: { layer: LayerType.PopUp, prefab: "gui/prefab/pve/cardAssistPop" },
    [UIID.PVECardSysFightPop]: { layer: LayerType.PopUp, prefab: "gui/prefab/pve/pveFightPop" },
}

