import { Message } from "../../../core/common/event/MessageManager";
import { IResponseProtocol } from "../../../core/network/NetInterface";
import { NetNodeGame } from "./NetNodeGame";

export class NetHome extends NetNodeGame {
    constructor() {
        super();
        this.notifyEvent();
    }
      
    notifyEvent() {
        this.setResponeHandler(opcode.OpCode.ScSelfInfoPush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgsc.ScSelfInfoPush);
        });
        this.setResponeHandler(opcode.OpCode.ScKickPush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgsc.ScKickPush);
        });
        this.setResponeHandler(opcode.OpCode.ScTVGameInfoPush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgsc.ScTVGameInfoPush);
        });
        this.setResponeHandler(opcode.OpCode.ScCloseTVGamePush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgsc.ScCloseTVGamePush);
        });
        this.setResponeHandler(opcode.OpCode.ScQuestionResultPush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgsc.ScQuestionResultPush);
        });
        this.setResponeHandler(opcode.OpCode.ScExchangeTokenPush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgsc.ScExchangeTokenPush);
        });
        this.setResponeHandler(opcode.OpCode.ScFriendBattleInvitePush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgsc.ScFriendBattleInvitePush);
        });
        this.setResponeHandler(opcode.OpCode.ScUpdateAssistInfoPush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgsc.ScUpdateAssistInfoPush);
        });
        this.setResponeHandler(opcode.OpCode.ScNftTransferPush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgsc.ScNftTransferPush);
        });
        this.setResponeHandler(opcode.OpCode.ScPveWeekPush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgsc.ScPveWeekPush);
        });
        this.setResponeHandler(opcode.OpCode.ScNftStatePush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgsc.ScNftStatePush);
        });
        this.setResponeHandler(opcode.OpCode.ScTransferPush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgsc.ScTransferPush);
        });
        this.setResponeHandler(opcode.OpCode.ScTransferInGamePush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgsc.ScTransferInGamePush);
        });
        this.setResponeHandler(opcode.OpCode.ScTokenInfoPush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgsc.ScTokenInfoPush);
        });
        this.setResponeHandler(opcode.OpCode.ScWithdrawPush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgsc.ScWithdrawPush);
        });
        this.setResponeHandler(opcode.OpCode.ScBuyErc20TokenPush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgsc.ScBuyErc20TokenPush);
        });
        this.setResponeHandler(opcode.OpCode.ScMaterialBoxesOpenPush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgsc.ScMaterialBoxesOpenPush);
        });
        this.setResponeHandler(opcode.OpCode.ScBuyBoundBoxPush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgsc.ScBuyBoundBoxPush);
        });
        this.setResponeHandler(opcode.OpCode.ScBlindBoxBuyAndOpenPush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgsc.ScBlindBoxBuyAndOpenPush);
        });
        this.setResponeHandler(opcode.OpCode.ScBlindBoxBuyPush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgsc.ScBlindBoxBuyPush);
        });
        this.setResponeHandler(opcode.OpCode.ScBlindBoxOpenPush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgsc.ScBlindBoxOpenPush);
        });
        this.setResponeHandler(opcode.OpCode.ScNewMailPush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgsc.ScNewMailPush);
        });
        this.setResponeHandler(opcode.OpCode.ScMatchPush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgsc.ScMatchPush);
        });
        this.setResponeHandler(opcode.OpCode.ScBattleEnterPush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgsc.ScBattleEnterPush);
        });
        this.setResponeHandler(opcode.OpCode.ScPingResp.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgsc.ScPingResp);
        });
        this.setResponeHandler(opcode.OpCode.ScCardUpgradePush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgsc.ScCardUpgradePush);
        });
        this.setResponeHandler(opcode.OpCode.ScCardResetAllPush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgsc.ScCardResetAllPush);
        });
        this.setResponeHandler(opcode.OpCode.ScCardResetAttrPush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgsc.ScCardResetAttrPush);
        });
        this.setResponeHandler(opcode.OpCode.ScCardResetAttrValPush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgsc.ScCardResetAttrValPush);
        });
        this.setResponeHandler(opcode.OpCode.ScCardResetPowerPush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgsc.ScCardResetPowerPush);
        });
        this.setResponeHandler(opcode.OpCode.ScEquipBurnPush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgsc.ScEquipBurnPush);
        });
        this.setResponeHandler(opcode.OpCode.ScEquipComposePush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgsc.ScEquipComposePush);
        });
        this.setResponeHandler(opcode.OpCode.ScEquipResetAllPush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgsc.ScEquipResetAllPush);
        });
        this.setResponeHandler(opcode.OpCode.ScEquipResetAttrPush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgsc.ScEquipResetAttrPush);
        });
        this.setResponeHandler(opcode.OpCode.ScEquipResetAttrValPush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgsc.ScEquipResetAttrValPush);
        });
        this.setResponeHandler(opcode.OpCode.ScEquipRepairEquipPush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgsc.ScEquipRepairEquipPush);
        });
        this.setResponeHandler(opcode.OpCode.ScEquipRepairEquipGroupPush.toString(), (data: IResponseProtocol) => {
            Message.dispatchEvent(data.scOpCode.toString(), data.data as pkgsc.ScEquipRepairEquipGroupPush);
        });
    }
      
      
    public async reqUnique(csOpCode: opcode.OpCode.CsExchangeTokenReq, scOpCode: opcode.OpCode.ScExchangeTokenResp, data: pkgcs.CsExchangeTokenReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScExchangeTokenResp>
    public async reqUnique(csOpCode: opcode.OpCode.CsWithdrawReq, scOpCode: opcode.OpCode.ScWithdrawResp, data: pkgcs.CsWithdrawReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScWithdrawResp>
    public async reqUnique(csOpCode: opcode.OpCode.CsQueryBuyErc20RateReq, scOpCode: opcode.OpCode.ScQueryBuyErc20RateResp, data: pkgcs.CsQueryBuyErc20RateReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScQueryBuyErc20RateResp>
    public async reqUnique(csOpCode: opcode.OpCode.CsBuyErc20TokenReq, scOpCode: opcode.OpCode.ScBuyErc20TokenResp, data: pkgcs.CsBuyErc20TokenReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScBuyErc20TokenResp>
    public async reqUnique(csOpCode: opcode.OpCode.CsTransferInGameReq, scOpCode: opcode.OpCode.ScTransferInGameResp, data: pkgcs.CsTransferInGameReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScTransferInGameResp>
    
    //#endregion
    //#region TVGame
    public async reqUnique(csOpCode: opcode.OpCode.CsStartTVGameReq, scOpCode: opcode.OpCode.ScStartTVGameResp, data: pkgcs.CsStartTVGameReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScStartTVGameResp>
    public async reqUnique(csOpCode: opcode.OpCode.CsCreateTVGameReq, scOpCode: opcode.OpCode.ScCreateTVGameResp, data: pkgcs.CsCreateTVGameReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScCloseTVGameResp>
    public async reqUnique(csOpCode: opcode.OpCode.CsCloseTVGameReq, scOpCode: opcode.OpCode.ScCloseTVGameResp, data: pkgcs.CsCloseTVGameReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScCloseTVGameResp>
    public async reqUnique(csOpCode: opcode.OpCode.CsTVGameInvitePlayerReq, scOpCode: opcode.OpCode.ScTVGameInvitePlayerResp, data: pkgcs.CsTVGameInvitePlayerReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScTVGameInvitePlayerResp>
    public async reqUnique(csOpCode: opcode.OpCode.CsTVGameInviteSayerReq, scOpCode: opcode.OpCode.ScTVGameInviteSayerResp, data: pkgcs.CsTVGameInviteSayerReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScTVGameInviteSayerResp>
    //#endregion
      
    public async reqUnique(csOpCode: opcode.OpCode.CsFriendBattleInviteReq, scOpCode: opcode.OpCode.ScFriendBattleInviteResp, data: pkgcs.CsFriendBattleInviteReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScFriendBattleInviteResp>
    public async reqUnique(csOpCode: opcode.OpCode.CsFriendBattleAcceptReq, scOpCode: opcode.OpCode.ScFriendBattleAcceptResp, data: pkgcs.CsFriendBattleAcceptReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScFriendBattleAcceptResp>
    public async reqUnique(csOpCode: opcode.OpCode.CsFriendBattleCancelReq, scOpCode: opcode.OpCode.ScFriendBattleCancelResp, data: pkgcs.CsFriendBattleCancelReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScFriendBattleCancelResp>
    //#endregion
      
      
    public async reqUnique(csOpCode: opcode.OpCode.CsMaterialBoxesQueryReq, scOpCode: opcode.OpCode.ScMaterialBoxesQueryResp, data: pkgcs.CsMaterialBoxesQueryReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScMaterialBoxesQueryResp>
      
    public async reqUnique(csOpCode: opcode.OpCode.CsMaterialBoxesOpenReq, scOpCode: opcode.OpCode.ScMaterialBoxesOpenResp, data: pkgcs.CsMaterialBoxesOpenReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScMaterialBoxesOpenResp>
      
    public async reqUnique(csOpCode: opcode.OpCode.CsBlindBoxQueryReq, scOpCode: opcode.OpCode.ScBlindBoxQueryResp, data: pkgcs.CsBlindBoxQueryReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScBlindBoxQueryResp>
      
    public async reqUnique(csOpCode: opcode.OpCode.CsBlindBoxBuyReq, scOpCode: opcode.OpCode.ScBlindBoxBuyResp, data: pkgcs.CsBlindBoxBuyReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScBlindBoxBuyResp>
      
    public async reqUnique(csOpCode: opcode.OpCode.CsBlindBoxOpenReq, scOpCode: opcode.OpCode.ScBlindBoxOpenResp, data: pkgcs.CsBlindBoxOpenReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScBlindBoxOpenResp>
      
    public async reqUnique(csOpCode: opcode.OpCode.CsBlindBoxBuyAndOpenReq, scOpCode: opcode.OpCode.ScBlindBoxBuyAndOpenResp, data: pkgcs.CsBlindBoxBuyAndOpenReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScBlindBoxBuyAndOpenResp>
      
    public async reqUnique(csOpCode: opcode.OpCode.CsBuyBoundBoxReq, scOpCode: opcode.OpCode.ScBuyBoundBoxResp, data: pkgcs.CsBuyBoundBoxReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScBuyBoundBoxResp>
    //#endregion
      
    public async reqUnique(csOpCode: opcode.OpCode.CsSetCardReq, scOpCode: opcode.OpCode.ScSetCardResp, data: pkgcs.CsSetCardReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScSetCardResp>
    //#endregion
      
    public async reqUnique(csOpCode: opcode.OpCode.CsEquipQueryReq, scOpCode: opcode.OpCode.ScEquipQueryResp, data: pkgcs.CsEquipQueryReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScEquipQueryResp>
    public async reqUnique(csOpCode: opcode.OpCode.CsEquipGroupQueryReq, scOpCode: opcode.OpCode.ScEquipGroupQueryResp, data: pkgcs.CsEquipGroupQueryReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScEquipGroupQueryResp>
    public async reqUnique(csOpCode: opcode.OpCode.CsEquipGroupSaveReq, scOpCode: opcode.OpCode.ScEquipGroupSaveResp, data: pkgcs.CsEquipGroupSaveReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScEquipGroupSaveResp>
    public async reqUnique(csOpCode: opcode.OpCode.CsEquipResetAllReq, scOpCode: opcode.OpCode.ScEquipResetAllResp, data: pkgcs.CsEquipResetAllReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScEquipResetAllResp>
    public async reqUnique(csOpCode: opcode.OpCode.CsEquipResetAttrReq, scOpCode: opcode.OpCode.ScEquipResetAttrResp, data: pkgcs.CsEquipResetAttrReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScEquipResetAttrResp>
    public async reqUnique(csOpCode: opcode.OpCode.CsEquipResetAttrValReq, scOpCode: opcode.OpCode.ScEquipResetAttrValResp, data: pkgcs.CsEquipResetAttrValReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScEquipResetAttrValResp>
    public async reqUnique(csOpCode: opcode.OpCode.CsSelectEquipGroupReq, scOpCode: opcode.OpCode.ScSelectEquipGroupResp, data: pkgcs.CsSelectEquipGroupReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScSelectEquipGroupResp>
    public async reqUnique(csOpCode: opcode.OpCode.CsEquipBurnReq, scOpCode: opcode.OpCode.ScEquipBurnResp, data: pkgcs.CsEquipBurnReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScEquipBurnResp>
    public async reqUnique(csOpCode: opcode.OpCode.CsEquipComposeReq, scOpCode: opcode.OpCode.ScEquipComposeResp, data: pkgcs.CsEquipComposeReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScEquipComposeResp>
    public async reqUnique(csOpCode: opcode.OpCode.CsEquipRepairEquipReq, scOpCode: opcode.OpCode.ScEquipRepairEquipResp, data: pkgcs.CsEquipRepairEquipReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScEquipRepairEquipResp>
    public async reqUnique(csOpCode: opcode.OpCode.CsEquipRepairEquipGroupReq, scOpCode: opcode.OpCode.ScEquipRepairEquipGroupResp, data: pkgcs.CsEquipRepairEquipGroupReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScEquipRepairEquipGroupResp>

    //#endregion
      
    public async reqUnique(csOpCode: opcode.OpCode.CsCardGroupQueryReq, scOpCode: opcode.OpCode.ScCardGroupQueryResp, data: pkgcs.CsCardGroupQueryReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScCardGroupQueryResp>
    public async reqUnique(csOpCode: opcode.OpCode.CsSelectCardGroupReq, scOpCode: opcode.OpCode.ScSelectCardGroupResp, data: pkgcs.CsSelectCardGroupReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScSelectCardGroupResp>
    public async reqUnique(csOpCode: opcode.OpCode.CsCardGroupSaveReq, scOpCode: opcode.OpCode.ScCardGroupSaveResp, data: pkgcs.CsCardGroupSaveReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScCardGroupSaveResp>

    //#endregion
      
    public async reqUnique(csOpCode: opcode.OpCode.CsCardResetAttrValReq, scOpCode: opcode.OpCode.ScCardResetAttrValResp, data: pkgcs.CsCardResetAttrValReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScCardResetAttrValResp>
    public async reqUnique(csOpCode: opcode.OpCode.CsCardQueryReq, scOpCode: opcode.OpCode.ScCardQueryResp, data: pkgcs.CsCardQueryReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScCardQueryResp>
    public async reqUnique(csOpCode: opcode.OpCode.CsCardUpgradeReq, scOpCode: opcode.OpCode.ScCardUpgradeResp, data: pkgcs.CsCardUpgradeReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScCardUpgradeResp>
    public async reqUnique(csOpCode: opcode.OpCode.CsCardResetPowerReq, scOpCode: opcode.OpCode.ScCardResetPowerResp, data: pkgcs.CsCardResetPowerReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScCardResetPowerResp>
    public async reqUnique(csOpCode: opcode.OpCode.CsCardResetAllReq, scOpCode: opcode.OpCode.ScCardResetAllResp, data: pkgcs.CsCardResetAllReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScCardResetAllResp>
    public async reqUnique(csOpCode: opcode.OpCode.CsCardResetAttrReq, scOpCode: opcode.OpCode.ScCardResetAttrResp, data: pkgcs.CsCardResetAttrReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScCardResetAttrResp>
    //#endregion
      
    public async reqUnique(csOpCode: opcode.OpCode.CsPVEEquipsQueryReq, scOpCode: opcode.OpCode.ScPVEEquipsQueryResp, data: pkgcs.CsPVEEquipsQueryReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScPVEEquipsQueryResp>
    public async reqUnique(csOpCode: opcode.OpCode.CsPVECardsQueryReq, scOpCode: opcode.OpCode.ScPVECardsQueryResp, data: pkgcs.CsPVECardsQueryReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScPVECardsQueryResp>
    public async reqUnique(csOpCode: opcode.OpCode.CsPVEEquipsSaveReq, scOpCode: opcode.OpCode.ScPVEEquipsSaveResp, data: pkgcs.CsPVEEquipsSaveReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScPVEEquipsSaveResp>
    public async reqUnique(csOpCode: opcode.OpCode.CsPVECardsSaveReq, scOpCode: opcode.OpCode.ScPVECardsSaveResp, data: pkgcs.CsPVECardsSaveReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScPVECardsSaveResp>
    public async reqUnique(csOpCode: opcode.OpCode.CsQueryPveSchemeReq, scOpCode: opcode.OpCode.ScQueryPveSchemeResp, data: pkgcs.CsQueryPveSchemeReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScQueryPveSchemeResp>

    //#endregion
    public async reqUnique(csOpCode: opcode.OpCode.CsChangeNicknameReq, scOpCode: opcode.OpCode.ScChangeNicknameResp, data: pkgcs.CsChangeNicknameReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScChangeNicknameResp>
    public async reqUnique(csOpCode: opcode.OpCode.CsSelfInfoReq, scOpCode: opcode.OpCode.ScSelfInfoResp, data: pkgcs.CsSelfInfoReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScSelfInfoResp>
    public async reqUnique(csOpCode: opcode.OpCode.CsMatchCancelReq, scOpCode: opcode.OpCode.ScMatchCancelResp, data: pkgcs.CsMatchCancelReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScMatchCancelResp>
    public async reqUnique(csOpCode: opcode.OpCode.CsMatchReq, scOpCode: opcode.OpCode.ScMatchResp, data: pkgcs.CsMatchReq, showTips?: boolean, force?: boolean): Promise<pkgsc.ScMatchResp>
    public async reqUnique<T, U>(csOpCode: opcode.OpCode, scOpCode: opcode.OpCode, data: T, showTips: boolean = true, force: boolean = false): Promise<U> {
        return await super.reqUnique<T, U>(csOpCode, scOpCode, data, showTips, force);
    }
}