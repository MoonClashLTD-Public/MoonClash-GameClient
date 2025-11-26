import { log } from "cc";
import { tips } from "../../../core/gui/prompt/TipsManager";
import { HttpEvent } from "../../../core/network/HttpRequest";
import { oops } from "../../../core/Oops";
import { CommonUtil } from "../../../core/utils/CommonUtil";
import { IAwsAuthResp } from "../../data/awsManger";
import { PlayerManger } from "../../data/playerManager";
import WalletUtil, { CurrType } from "../../walletUI/WalletUtil";

class HttpHome {
    constructor() { }

    private async postAsync<T, U>(path: string, data: T, protoName?: string): Promise<U> {
        await tips.netInstableOpen();
        return new Promise((resolve: (value: U) => void, reject: (reason?: { code: number }) => void) => {
            log(path, data);
            let encode = (d) => {
                d = CommonUtil.underlineToHump(d);
                let fun = auth[protoName]
                    || watrade[protoName]
                    || cfg[protoName]
                    || nft[protoName]
                    || sgame[protoName]
                    || wafriend[protoName]
                    || invite[protoName]
                    || srv_nft[protoName]
                    || wagas[protoName]
                    || wamail[protoName];
                let data = fun.create(d);   
                let buffer = fun.encode(data).finish();
                let _d = fun.decode(new Uint8Array(buffer));
                log(path, d);
                return _d;
            }
              
            let retryNum: number = 3;
            let requestCB = () => {
                oops.http.postAsync(path, data)
                    .then((d) => {
                        if (d && protoName) {
                            let _d = encode(d);
                            resolve(_d);
                        } else {
                            resolve({} as U);
                        }
                        tips.netInstableClose();
                    }).catch((e: {
                        code: number, data, event: HttpEvent
                    }) => {
                        log(`http postAsync err ${path}`, e);
                        let d = e.data;
                        if (d && protoName) {
                            let _d = encode(d);
                            reject({ code: e.code, data: _d } as any);
                        } else {
                            if (e.event == HttpEvent.TIMEOUT) {
                                log(`http postAsync timeout ${retryNum} ${path}`);
                                if (retryNum-- > 0) {
                                    requestCB();
                                    return;
                                }
                                oops.gui.toast("common_time_out", true);
                            }
                            reject(e as any);
                        }
                        tips.netInstableClose();
                    });
            }
            requestCB();
        })
    }

    async getUrlConfigs(): Promise<cfg.GetUrlConfigsResp> {
        return await this.postAsync("/cfg/urls", cfg.GetUrlConfigsReq.create(), cfg.GetUrlConfigsResp.name);
    }

    async authById(id: number): Promise<auth.AuthResp> {
        let d = auth.AuthByIdReq.create({
            id: id,
        });
        return await this.postAsync("/auth/auth_by_id", d, auth.AuthResp.name);
    }

    /** aws auth */
    async awsAuth(data: IAwsAuthResp): Promise<auth.AuthResp> {
        if (!data.ok || !data.session) return
        let d = auth.AuthByAwsReq.create({
            idToken: data.session.getIdToken().getJwtToken(),
            affCode: data.affCode,
        });
        return await this.postAsync("/auth/auth_aws", d, auth.AuthResp.name);
    }

      
      
    async tradeQuery(d: watrade.ITradeQueryReq): Promise<watrade.TradeQueryResp> {
        return await this.postAsync("/trade/query", d, watrade.TradeQueryResp.name);
    }
    async queryTradeId(tokenType: core.NftType, tokenId: number): Promise<watrade.ITradeQueryIdResp> {
        let d = watrade.TradeQueryIdReq.create({
            tokenType: tokenType,
            tokenId: tokenId,
        });
        return await this.postAsync("/trade/query_trade_id", d, watrade.TradeQueryIdResp.name);
    }

      
    async tradeSell(tokenId: number, tokenType: core.NftType, bnbPrice: string): Promise<watrade.TradeSellResp> {
        let d = watrade.TradeSellReq.create({
            tokenId: tokenId,
            tokenType: tokenType,
            bnbPrice: CommonUtil.etherToWei(bnbPrice).toFixed(),
        });
        return await this.postAsync("/trade/sell", d, watrade.TradeSellResp.name);
    }

      
    async tradeCancelSell(tradeId: number): Promise<watrade.TradeCancelSellResp> {
        let d = watrade.TradeCancelSellReq.create({
            tradeId: tradeId,
        });
        return await this.postAsync("/trade/cancel_sell", d, watrade.TradeCancelSellResp.name);
    }
      
    async tradeCancelRent(tradeId: number): Promise<watrade.TradeCancelRentResp> {
        let d = watrade.TradeCancelRentReq.create({
            tradeId: tradeId,
        });
        return await this.postAsync("/trade/cancel_rent", d, watrade.TradeCancelRentResp.name);
    }

      
    async tradeBuy(tradeId: number): Promise<watrade.TradeBuyResp> {
        let d = watrade.TradeBuyReq.create({
            tradeId: tradeId,
        });
        return await this.postAsync("/trade/buy", d, watrade.TradeBuyResp.name);
    }

      
    async tradeState(tradeId: number): Promise<watrade.TradeStateResp> {
        let d = watrade.TradeStateReq.create({
            tradeId: tradeId,
        });
        return await this.postAsync("/trade/state", d, watrade.TradeStateResp.name);
    }

      
    async queryGas(op: string, data: any): Promise<{ gas: string, usd: string }> {
        // return {
        //     gas: "1000000000",
        //     usd: "1000000000",
        // }
        let __d: unknown;
        let path = '';
        if (op == 'TransferReq') {   
            let _d: nft.TransferReq = data;
            let d = wagas.Erc20TransferReq.create();
            d.price = _d.price;
            d.tokenType = _d.tokenType;
            d.toWalletAddr = _d.toWalletAddr;
            path = '/gas/erc20_transfer';
            __d = d;
        } else if (op == 'CsBuyErc20TokenReq') {   
            let _d: pkgcs.CsBuyErc20TokenReq = data;
            path = '/gas/buy_erc20_tokens';
            __d = _d;
        } else if (op == 'NftTransferReq') {   
            let _d: watrade.NftTransferReq = data;
            path = '/gas/withdraw_nft_token';
            __d = _d;
        } else if (op == 'CsWithdrawReq') {   
            let _d: pkgcs.CsWithdrawReq = data;
            path = '/gas/additional_issuance';
            __d = _d;
        } else if (op == 'TradeSellReq') {   
            let _d: watrade.TradeSellReq = data;
            let d = wagas.NftTransactionReq.create();
            d.action = "SELL"
            d.tokenId = _d.tokenId;
            d.bnbPrice = _d.bnbPrice;
            d.tokenType = _d.tokenType;
            path = '/gas/nft_transaction';
            __d = d;
        } else if (op == 'TradeBuyReq') {   
            let _d: watrade.TradeBuyReq = data;
            let d = wagas.NftTransactionReq.create();
            d.action = "BUY"
            d.tradeId = _d.tradeId;
            path = '/gas/nft_transaction';
            __d = d;
        } else if (op == 'TradeCancelSellReq') {   
            let _d: watrade.TradeCancelSellReq = data;
            let d = wagas.NftTransactionReq.create();
            d.action = "CANCEL"
            d.tradeId = _d.tradeId;
            path = '/gas/nft_transaction';
            __d = d;
        } else if (op == 'TradeCancelRentReq') {   
            let _d: watrade.TradeCancelRentReq = data;
            let d = wagas.CardLeaseholdReq.create();
            d.action = "CANCEL"
            d.tradeId = _d.tradeId;
            path = '/gas/card_leasehold';
            __d = d;
        } else if (op == 'TradeRentReq') {   
            let _d: watrade.TradeRentReq = data;
            let d = wagas.CardLeaseholdReq.create();
            d.action = "RENT"
            d.tokenId = _d.tokenId;
            d.rentalEndAt = _d.rentalEndAt;
            d.dnaPrice = _d.dnaPrice;
            path = '/gas/card_leasehold';
            __d = d;
        } else if (op == 'TradeLeaseReq') {   
            let _d: watrade.TradeLeaseReq = data;
            let d = wagas.CardLeaseholdReq.create();
            d.action = "LEASE"
            d.tradeId = _d.tradeId;
            d.days = _d.days;
            path = '/gas/card_leasehold';
            __d = d;
        } else if (op == 'TradeCancelSellReq') {   
            let _d: watrade.TradeCancelSellReq = data;
            let d = wagas.CardLeaseholdReq.create();
            d.action = "CANCEL"
            d.tradeId = _d.tradeId;
            path = '/gas/card_leasehold';
            __d = d;
        } else if (op == 'MaterialTradeSellReq') {   
            let _d: watrade.MaterialTradeSellReq = data;
            let d = wagas.MaterialTransactionReq.create();
            d.action = "SELL"
            d.price = _d.bnbPrice;
            d.cnt = _d.cnt;
            d.tokenType = _d.tokenType;
            path = '/gas/material_transaction';
            __d = d;
        } else if (op == 'MaterialTradeBuyReq') {   
            let _d: watrade.MaterialTradeBuyReq = data;
            let d = wagas.MaterialTransactionReq.create();
            d.action = "BUY"
            d.sellerId = _d.mainTradeId;
            d.cnt = _d.cnt;
            path = '/gas/material_transaction';
            __d = d;
        } else if (op == 'MaterialTradeCancelReq') {   
            let _d: watrade.MaterialTradeCancelReq = data;
            let d = wagas.MaterialTransactionReq.create();
            d.action = "CANCEL"
            d.sellerId = _d.mainTradeId;
            d.cnt = _d.cnt;
            path = '/gas/material_transaction';
            __d = d;
        } else if (op == 'CsBlindBoxBuyAndOpenReq') {   
            let _d: pkgcs.CsBlindBoxBuyAndOpenReq = data;
            let d = wagas.UserBuyBlindBoxReq.create();
            d.boxProtoId = _d.id;
            d.cnt = _d.cnt;
            path = '/gas/user_buy_blind_box';
            __d = d;
        } else if (op == 'CsMaterialBoxesOpenReq') {   
            let d = wagas.UserOpenMaterialReq.create();
            // d.boxProtoId = _d.id;
            d.cnt = 1;
            path = '/gas/user_open_material';
            __d = d;
        } else if (op == 'CsBlindBoxOpenReq') {   
            let _d: pkgcs.CsBlindBoxOpenReq = data;
            path = '/gas/open_blind_box';
            __d = _d;
        } else if (op == 'BuySixCardNftReq') {   
            let _d: pkgcs.CsBlindBoxBuyAndOpenReq = data;
            path = '/gas/buy_six_card_nft';
            __d = _d;
        }

        return await this._queryGas(path, __d);
    }

      
    async queryGas1(op: EGasType, data: any): Promise<{ gas: string, usd: string }> {
        // return {
        //     gas: "1000000000",
        //     usd: "1000000000",
        // }
        let __d: unknown;
        let path = '';
        if (op == EGasType.CARD_UPGRADE) {
            let _d: pkgcs.CsCardUpgradeReq = data;
            let d = wagas.CardUpgradeReq.create();
            d.mainToken = _d.mainCardId;
            d.consumptionCardToken = _d.costCards;
            const jxs = _d['jxs'] || 0
            const costMaterials = {}
            if (jxs != 0) costMaterials[`${core.NftMaterialType.MaterialAwakeningStone.valueOf()}`] = jxs
            d.costMaterials = costMaterials
            path = '/gas/card_upgrade';
            __d = d;
        } else if (op == EGasType.EQUIP_UPGRADE) {
            let _d: pkgcs.CsEquipComposeReq = data;
            let d = wagas.EquipUpgradeReq.create();
            d.extraItemProtoId = _d.extraMaterialId;
            d.equipIdList = _d.equipIds;
            path = '/gas/equip_upgrade';
            __d = d;
        } else if (op == EGasType.EQUIP_BURN) {
            let _d: pkgcs.CsEquipBurnReq = data;
            let d = wagas.BurnTokenReq.create();
            d.opt = "EQUIP";
            d.idList = [_d.equipId];
            path = '/gas/burn_token';
            __d = d;
        } else if (op == EGasType.USE_MATERIALS) {
            let _d: core.IIdCount[] = data;
            let d = wagas.UseMaterialsReq.create();
            d.cost = _d
            path = '/gas/use_materials';
            __d = d;
        }

        return await this._queryGas(path, __d);
    }

    private async _queryGas(path: string, data: unknown): Promise<{ gas: string, usd: string }> {
        if (path) {
            let _data = await this.postAsync<unknown, wagas.GasResp>(path, data, wagas.GasResp.name);
            if (_data) {
                let gas = new BigNumber(_data.gas).times(_data.gasPrice).toFixed();
                // gas = CommonUtil.etherToWei(CommonUtil.weiToEther(gas).toFixed(6)).toFixed();

                let bnb = WalletUtil.getTotalCurrByType(CurrType.BNB);
                if (new BigNumber(bnb).gte(gas)) {
                    let min = CommonUtil.etherToWei("0.00001").toFixed();
                    if (new BigNumber(gas).lt(min)) {
                        gas = min;
                    }
                    let g = CommonUtil.etherToWei(CommonUtil.weiToEtherStr(gas)).toFixed();
                    return { gas: g, usd: '0' };
                } else {
                    oops.gui.toast('not_enough_gas', true);
                    return null;
                }
            } else {
                return null;
            }
        } else {
            return null;
        }
    }


      
    async tradeRent(tokenId: number, dnaPrice: string, rentalEndAt: number): Promise<watrade.TradeRentResp> {
        let d = watrade.TradeRentReq.create({
            tokenId: tokenId,
            dnaPrice: CommonUtil.etherToWei(dnaPrice).toFixed(),
            rentalEndAt: rentalEndAt,
        });
        return await this.postAsync("/trade/rent", d, watrade.TradeRentResp.name);
    }

      
    async tradeLease(tradeId: number, days: number): Promise<watrade.TradeLeaseResp> {
        let d = watrade.TradeLeaseReq.create({
            tradeId: tradeId,
            days: days,
        });
        return await this.postAsync("/trade/lease", d, watrade.TradeLeaseResp.name);
    }

      
    async queryMyTrades(): Promise<watrade.GetSelfTradeLogResp> {
        let d = watrade.GetSelfTradeLogReq.create();
        return await this.postAsync("/trade/query_my_trades", d, watrade.GetSelfTradeLogResp.name);
    }
    //#endregion

      
    /*  
  
     */
    async friendshipQuery(op: 0 | 1 | 2, state: core.FriendshipState): Promise<wafriend.FriendshipQueryResp> {
        let d = wafriend.FriendshipQueryReq.create({
            op: op,
            state: state,
        });
        return await this.postAsync("/friendship/query", d, wafriend.FriendshipQueryResp.name);
    }

      
    async friendshipAdd(friendId: number): Promise<wafriend.FriendshipAddResp> {
        let d = wafriend.FriendshipAddReq.create({
            friendId: friendId,
        });
        return await this.postAsync("/friendship/add", d, wafriend.FriendshipAddResp.name);
    }

      
    async friendshipAccept(friendId: number, accept: boolean): Promise<wafriend.FriendshipAcceptResp> {
        let d = wafriend.FriendshipAcceptReq.create({
            friendId: friendId,
            accept: accept
        });
        return await this.postAsync("/friendship/accept", d, wafriend.FriendshipAcceptResp.name);
    }

      
    async friendshipRemove(friendId: number): Promise<wafriend.FriendshipRemoveResp> {
        let d = wafriend.FriendshipRemoveReq.create({
            friendId: friendId,
        });
        return await this.postAsync("/friendship/remove", d, wafriend.FriendshipRemoveResp.name);
    }

      
    async friendshipAssist(cardId: number, rewardPct: number, assist: boolean): Promise<wafriend.FriendshipAssistResp> {
        let d = wafriend.FriendshipAssistReq.create({
            cardId: cardId,
            rewardPct: rewardPct,
            assist: assist
        });
        return await this.postAsync("/friendship/assist", d, wafriend.FriendshipAssistResp.name);
    }
      
    async friendshipSearch(key: string): Promise<wafriend.FriendshipSearchResp> {
        let d = wafriend.FriendshipSearchReq.create({
            key: key
        });
        return await this.postAsync("/friendship/search", d, wafriend.FriendshipSearchResp.name);
    }
    /**
       
  
  
  
  
     */
    async friendshipAssistedRecords(lastId: number, limit: number, cardId: number = 0): Promise<wafriend.FriendshipAssistedRecordsResp> {
        let d = wafriend.FriendshipAssistedRecordsReq.create({
            lastId: lastId,
            limit: limit,
            cardId: cardId,
        });
        return await this.postAsync("/friendship/assisted_records", d, wafriend.FriendshipAssistedRecordsResp.name);
    }
    //#endregion

      
    async mailList(mailId: number): Promise<wamail.MailListResp> {
        let d = wamail.MailListReq.create(
            {
                offset: mailId
            }
        );
        return await this.postAsync("/mail/list", d, wamail.MailListResp.name);
    }

    async mailQuery(mailId: number): Promise<wamail.MailQueryResp> {
        let d = wamail.MailQueryReq.create({
            mailId: mailId
        });
        return await this.postAsync("/mail/query", d, wamail.MailQueryResp.name);
    }

    /**
  
  
     */
    async mailOp(mailId: number, op: 0 | 1 | 2): Promise<wamail.MailOpResp> {
        let d = wamail.MailOpReq.create({
            mailId: mailId,
            op: op
        });
        return await this.postAsync("/mail/op", d, wamail.MailOpResp.name);
    }
    //#endregion

      
    async inviteQuery(): Promise<invite.InviteQueryResp> {
        let d = invite.InviteQueryReq.create();
        return await this.postAsync("/invite/query", d, invite.InviteQueryResp.name);
    }
    async inviteDo(): Promise<invite.InviteDoResp> {
        let d = invite.InviteDoReq.create();
        return await this.postAsync("/invite/inviteDo", d, invite.InviteDoResp.name);
    }
    //#endregion

      
      
    async queryRate(): Promise<srv_nft.QueryRateResp> {
        let d = srv_nft.QueryRateReq.create();
        return await this.postAsync("/srv/wallet/query_rate", d, srv_nft.QueryRateResp.name);
    }
      
    async transfer(toWalletAddr: string, tokenType: 'BNB' | 'DGG' | 'DNA' | string, price: string): Promise<nft.TransferResp> {
        let d = nft.TransferReq.create({
            toWalletAddr: toWalletAddr,
            tokenType: tokenType,
            price: price,
        });
        return await this.postAsync("/token/transfer", d, nft.TransferResp.name);
    }
      
    async checkBuySixCardNftPrice(): Promise<nft.CheckBuySixCardNftPriceResp> {
        let d = nft.CheckBuySixCardNftPriceReq.create();
        return await this.postAsync("/token/check_buy_six_card_nft_price", d, nft.CheckBuySixCardNftPriceResp.name);
    }
    //#endregion
      
    async materialQuery(limit: number, offset: number, tp: 0 | 1 | 2 = 0, order: 0 | 1 | 2 | 3 = 0): Promise<watrade.MaterialTradeQueryResp> {
        let d = watrade.MaterialTradeQueryReq.create({
            limit: limit,
            offset: offset,
            tp: tp, // 0 all, 1 equip-usable, 2 card-usable
            order: order,  // 0 latest, 1 oldest, 2 lowest-price, 3 highest-price
        });
        return await this.postAsync("/trade/material_query", d, watrade.MaterialTradeQueryResp.name);
    }
    async materialTradeSell(tokenType: core.NftMaterialType, cnt: number, bnbPrice: string): Promise<watrade.MaterialTradeSellResp> {
        let d = watrade.MaterialTradeSellReq.create({
            tokenType: tokenType,
            cnt: cnt,
            bnbPrice: bnbPrice,
        });
        return await this.postAsync("/trade/material_sell", d, watrade.MaterialTradeSellResp.name);
    }
    async materialTradeBuy(mainTradeId: number, cnt: number): Promise<watrade.MaterialTradeBuyResp> {
        let d = watrade.MaterialTradeBuyReq.create({
            mainTradeId: mainTradeId,
            cnt: cnt,
        });
        return await this.postAsync("/trade/material_buy", d, watrade.MaterialTradeBuyResp.name);
    }
    async materialTradeCancel(mainTradeId: number, cnt: number): Promise<watrade.MaterialTradeCancelResp> {
        let d = watrade.MaterialTradeBuyReq.create({
            mainTradeId: mainTradeId,
            cnt: cnt,
        });
        return await this.postAsync("/trade/material_cancel", d, watrade.MaterialTradeCancelResp.name);
    }
    async materialTradeState(tradeId: number): Promise<watrade.MaterialTradeStateResp> {
        let d = watrade.MaterialTradeStateReq.create({
            tradeId: tradeId
        });
        return await this.postAsync("/trade/material_state", d, watrade.MaterialTradeStateResp.name);
    }
    async nftTransfer(opt: core.NftType, toWallet: string, nftId: number, materialType: core.NftMaterialType, cnt: number): Promise<watrade.NftTransferResp> {
        let d = watrade.NftTransferReq.create({
            opt: opt,  // core.NftType only (0, 1, 3)
            toWallet: toWallet,
            nftId: nftId,  // opt in (0, 1)
            materialType: materialType,  // opt in (3),  core.NftMaterialType
            cnt: cnt,  // opt in (3)
        });
        return await this.postAsync("/trade/nft_transfer", d, watrade.NftTransferResp.name);
    }
    //#endregion
      
    async queryBlindbox(): Promise<nft.QueryGenesisBlindBoxResp> {
        let d = nft.QueryGenesisBlindBoxReq.create();
        return await this.postAsync("/token/query_genesis_blindbox", d, nft.QueryGenesisBlindBoxResp.name);
    }

    async getQuestion(): Promise<sgame.GetQuestionResp> {
        let d = sgame.GetQuestionReq.create();
        d.lang = oops.language.current;
        return await this.postAsync("/small_game/get_question", d, sgame.GetQuestionResp.name);
    }

    async answerQuestion(id: number, answer: string): Promise<sgame.AnswerQuestionResp> {
        let d = sgame.AnswerQuestionReq.create();
        d.id = id;
        d.answer = answer;
        return await this.postAsync("/small_game/answer_question", d, sgame.AnswerQuestionResp.name);
    }

    async calcExchangeRate(fromType: "DNA" | "DGG" | string, amount: string): Promise<nft.CalcExchangeRateResp> {
        let d = nft.CalcExchangeRateReq.create();
        d.fromType = fromType.toLowerCase();
        d.fromAmount = amount;
        return await this.postAsync("/token/calc_exchange_rate", d, nft.CalcExchangeRateResp.name);
    }

    async bindInviter(inviteCode: string): Promise<invite.BindInviterResp> {
        let d = invite.BindInviterReq.create({
            inviteCode: inviteCode
        });
        return await this.postAsync("/invite/bind_inviter", d, invite.BindInviterResp.name);
    }
}

export default new HttpHome();

export enum EGasType {
      
    CARD_UPGRADE,
      
    EQUIP_UPGRADE,
      
    EQUIP_BURN,
      
    USE_MATERIALS
}