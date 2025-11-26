import { log } from "cc";
import { Message } from "../../core/common/event/MessageManager";
import { storage } from "../../core/common/storage/StorageManager";
import { LanguageData } from "../../core/gui/language/LanguageData";
import { tips } from "../../core/gui/prompt/TipsManager";
import { oops } from "../../core/Oops";
import { PlatformUtil } from "../../core/utils/PlatformUtil";
import { GameEvent } from "../common/config/GameEvent";
import { UIID } from "../common/config/GameUIConfig";
import HttpHome from "../common/net/HttpHome";
import { STORAGE_ENUM } from "../homeUI/HomeEvent";
import { IInitGooglePopCfg } from "../loginUI/BindGooglePopUp";
import { IInitGooglePopCfg2 } from "../loginUI/BindGooglePopUp2";
import { DataEvent } from "./dataEvent";
import { Logger } from "../../core/common/log/Logger";
import { IPwdResetPopConfig } from "../loginUI/PwdResetPopUp1";
import { CommonUtil } from "../../core/utils/CommonUtil";
import { ISettingPwdCfg } from "../loginUI/SettingPwdPopUp";
export class AwsManger {
    static #instance: AwsManger;
    private clientId = '7dc4rk795mo4clbp3ogse26bvl'
    // private clientSecret = '19causo37cnm91dehs14jmlaqii6dl6ml73bpgu8v6ath75vqssu'
    private userPoolId = 'ap-southeast-1_TXmcYWHCs';
    // private region = 'us-east-1'
    private _cognitoUserPool: AmazonCognitoIdentity.CognitoUserPool;
    private _cachedCognitoUser: AmazonCognitoIdentity.CognitoUser
    private SOFTWARE_TOKEN_MFA = false
    private ID_TOKEN_KEY = 'wwoo'
    private REFRESH_TOKEN_KEY = 'eeii'
    private ACCESS_TOKEN_KEY = 'rruu'
    get isSoftMfa() {
        return this.SOFTWARE_TOKEN_MFA
    }

    private get cachedCognitoUser() {
        if (!this._cachedCognitoUser) {
            this.showErrTip(LanguageData.getLangByID('no_login_tip'))
            return null
        }
        return this._cachedCognitoUser
    }

    get currEmail() {
        const _session = this._cachedCognitoUser?.getSignInUserSession()
        let userName = '';
        if (_session) {
            userName = _session.getIdToken().payload['name'] || _session.getIdToken().payload['email']
        }
        return userName;
    }


    public static getInstance(): AwsManger {
        if (!AwsManger.#instance) {
            const aws = new AwsManger();
            aws._cognitoUserPool = new AmazonCognitoIdentity.CognitoUserPool({
                UserPoolId: aws.userPoolId, // Your user pool id here
                ClientId: aws.clientId, // Your client id here
            });
            AwsManger.#instance = aws;
        }
        return AwsManger.#instance;
    }

      
    async onRegister(email: string, password: string) {
        const attrEmail = new AmazonCognitoIdentity.CognitoUserAttribute({
            Name: 'email',
            Value: `${email}`,
        })
        const attrNickName = new AmazonCognitoIdentity.CognitoUserAttribute({
            Name: 'name',
            Value: `${email}`,
        })
        await this.showLoading()
        return new Promise<IAwsAuthResp | undefined>((resolve, reject) => {
            this._cognitoUserPool?.signUp(email, password, [attrEmail, attrNickName], null, async (err, result) => {
                this.hiddenLoading()
                if (err?.message == 'An account with the given email already exists.') {
                    const _login = await this.onLogin({ login: { email: email, pwd: password }, status: { iFristLogin: true, skipBindAlert: true } })
                    return resolve(_login)
                }
                if (this.showErrTip(err)) return resolve({ ok: false })
                const cognitoUser = new AmazonCognitoIdentity.CognitoUser({ Username: email, Pool: this._cognitoUserPool })
                this._cachedCognitoUser = cognitoUser
                resolve({ ok: true, code: 'CheckSmsCode' })
            });
        })
    }

    onBindMfaInGame(pwd: string) {
        const cognitoUser = this.cachedCognitoUser
        if (!cognitoUser) return
        this.onLogin({
            login: { email: this.currEmail, pwd: pwd, },
            status: { binding: true }
        })
    }

    onUnBindMfaInGame(pwd: string) {
        const cognitoUser = this.cachedCognitoUser
        if (!cognitoUser) return
        this.onLogin({
            login: { email: this.currEmail, pwd: pwd, },
            status: { unBind: true }
        })
    }


    /**
     * 
     * @param email 
     * @param password 
  
     * @returns 
     */
    async onLogin(args?: IAwsAuthReq) {
        const email = args?.login?.email
        const password = args?.login?.pwd
        const inviteCode = args?.login?.inviteCode
        const iFristLogin = args?.status?.iFristLogin ?? false
        var _skipBind = args?.status?.skipBind ?? true
        const _showSkipAlert = args?.status?.skipBindAlert ?? false
        const useCachedCognitoUser = args?.login?.useCachedCognitoUser ?? true
        const binding = args?.status?.binding
        const unBind = args?.status?.unBind
        const authDetails = new AmazonCognitoIdentity.AuthenticationDetails(
            { Username: email, Password: password }
        );
        if (!this._cachedCognitoUser || !useCachedCognitoUser) {
            this._cachedCognitoUser = new AmazonCognitoIdentity.CognitoUser({ Username: email, Pool: this._cognitoUserPool });
        }
        const cognitoUser = this._cachedCognitoUser
        await this.showLoading()
        return new Promise<IAwsAuthResp>(async (resolve, reject) => {
            const softwareToken = () => {
                return new Promise<boolean>((resolve, reject) => {
                    this.showLoading()
                    cognitoUser.associateSoftwareToken({
                        onFailure: (err) => {
                            this.showErrTip(err)
                            this.hiddenLoading(true)
                            resolve(false)
                        },
                        associateSecretCode: (code) => {
                            this.hiddenLoading(true)
                            oops.gui.open<IInitGooglePopCfg>(UIID.BindGooglePopUp,
                                {
                                    isFristAuth: iFristLogin,
                                    email: email,
                                    qr: code,
                                    next: async () => {
                                        const ok = await this.openBindMfaPop()
                                        resolve(ok)
                                    },
                                    skip: () => resolve(true)
                                }
                            )
                        }
                    })
                }
                )
            }
            const cb = {
                onSuccess: async (session: AmazonCognitoIdentity.CognitoUserSession) => {
                    this._cachedCognitoUser.setSignInUserSession(session)
                    const ret = { ok: false, session: session }
                    let ok1 = true
                    let canAuthSuccess = false
                    Message.dispatchEvent(DataEvent.AWS_AUTHENTICATE_USER)
                    if (_showSkipAlert) {
                        const _ok = await tips.confirmAsync({ content: "need_bind_account", okWord: "need_bind_account_continue", cancelWord: "need_bind_account_skip", order: false })
                        _skipBind = !_ok
                    }
                    if (iFristLogin && _skipBind) {
                        canAuthSuccess = true
                    } else if (iFristLogin || binding || unBind) {   
                        if (iFristLogin || binding) {
                            ok1 = await softwareToken()
                            if (iFristLogin && ok1) canAuthSuccess = true
                        } else if (unBind) {
                              
                            await this.showLoading()
                            ok1 = await this.enableMfa(false)
                            if (ok1) Message.dispatchEvent(DataEvent.AWS_VERIFY_SOFT_WARE_TOKEN)
                        }
                        if (ok1) {
                            await this.showLoading()
                            await this.checkUseMFA()
                            Message.dispatchEvent(DataEvent.DATA_SOFTWARE_TOKEN_MFA_CHANGE)
                        }
                          
                    } else {
                        canAuthSuccess = true
                    }
                    this.hiddenLoading(true)
                    if (canAuthSuccess) {
                        ok1 = await this.authSuccess(session, inviteCode)
                    }
                    ret.ok = ok1
                    if (ok1) {
                        this.saveAwsInfo(session)
                        this.saveAccPwd(email, password)
                    }
                    resolve(ret)
                },
                mfaSetup: async (challengeName: any, challengeParameters: any) => {
                    const ok = await softwareToken()
                    if (ok) {
                        return await this.onLogin({
                            login: { email: email, pwd: password, },
                        })
                    }
                    this.hiddenLoading(true)
                    return { ok: ok }

                },
                totpRequired: async (secretCode) => {
                    // var challengeAnswer = prompt('Please input the TOTP code.', '');
                    // cognitoUser.sendMFACode(challengeAnswer, this, 'SOFTWARE_TOKEN_MFA');
                    const ok = await this.sendMFACode(cb, args.status, 'SOFTWARE_TOKEN_MFA')
                    return { ok: ok }
                },
                mfaRequired: async (codeDeliveryDetails) => {
                    // var verificationCode = prompt('Please input verification code', '');
                    // cognitoUser.sendMFACode(verificationCode, this);
                    const ok = await this.sendMFACode(cb, args.status)
                    return { ok: ok }
                },
                newPasswordRequired: function (userAttributes, requiredAttributes) {
                    this.hiddenLoading(true)
                    delete userAttributes.email_verified;
                    // var password = prompt('Please input password code', '');
                    // cognitoUser.completeNewPasswordChallenge(password, userAttributes, this);
                    oops.gui.open<ISettingPwdCfg>(UIID.SettingNewPwdPopUp, {
                        email: email,
                        confirm: (password) =>
                            cognitoUser.completeNewPasswordChallenge(password, userAttributes, this)
                    })
                },
                onFailure: async (err) => {
                    this.hiddenLoading(true)
                    // || err.code == "NotAuthorizedException"
                    if (err.code == "UserNotConfirmedException") {
                        return resolve({ ok: false, code: err.code })
                    } else if (err.code == "PasswordResetRequiredException") {
                        // Confirm user data
                        this.showErrTip(err)
                        await CommonUtil.wait(0.3)
                        oops.gui.open<IPwdResetPopConfig>(UIID.PwdResetPopUp1, { email: email })
                        return resolve({ ok: false, code: err.code })
                    }
                    this.showErrTip(err)
                    resolve({ ok: false })
                }
            }
            cognitoUser.authenticateUser(authDetails, cb);
        })
    }

    checkUseMFA() {
        const cognitoUser = this.cachedCognitoUser
        if (!cognitoUser) return
        return new Promise<void>((resolve, reject) => {
            cognitoUser.getUserData((err, data) => {
                if (this.showErrTip(err, false)) {
                    this.SOFTWARE_TOKEN_MFA = false
                    resolve()
                    return
                }
                const { PreferredMfaSetting, UserMFASettingList } = data;
                if (PreferredMfaSetting == "SOFTWARE_TOKEN_MFA" && UserMFASettingList?.indexOf('SOFTWARE_TOKEN_MFA') != -1) {
                    this.SOFTWARE_TOKEN_MFA = true
                } else {
                    this.SOFTWARE_TOKEN_MFA = false
                }
                resolve()
            });
        })
    }

      
    async onRetrySMSCode(email: string) {
        const cognitoUser = new AmazonCognitoIdentity.CognitoUser({ Username: email, Pool: this._cognitoUserPool });
        this._cachedCognitoUser = cognitoUser
        await this.showLoading()
        return new Promise<boolean>((resolve, reject) => {
            cognitoUser.resendConfirmationCode(async (err, result) => {
                this.hiddenLoading()
                if (this.showErrTip(err)) return resolve(false);
                resolve(true)
            });
        })
    }

      
    async onConfirmSMSCode(email: string, pwd: string, smsCode: string, inviteCode: string) {
        const cognitoUser = new AmazonCognitoIdentity.CognitoUser({ Username: email, Pool: this._cognitoUserPool });
        this._cachedCognitoUser = cognitoUser
        await this.showLoading()
        return new Promise<boolean>((resolve, reject) => {
            cognitoUser.confirmRegistration(smsCode, true, async (err, result) => {
                this.hiddenLoading()
                if (this.showErrTip(err)) return resolve(false);
                const _ok = await tips.confirmAsync({ content: "need_bind_account", okWord: "need_bind_account_continue", cancelWord: "need_bind_account_skip", order: false })
                await this.onLogin({
                    login: { email: email, pwd: pwd, inviteCode: inviteCode },
                    status: { iFristLogin: true, skipBind: !_ok }
                })
                resolve(true)
            });
        })

    }

      
    async onChangePassword(prames: { oldPassword: string, newPassword: string }) {
        const cognitoUser = this.cachedCognitoUser
        if (!cognitoUser) return
        const newPws = prames?.newPassword;
        const oldPws = prames?.oldPassword;
        await this.showLoading()
        return new Promise<boolean>((resolve, reject) => {
            cognitoUser.changePassword(oldPws, newPws, (err, result) => {
                this.hiddenLoading()
                if (this.showErrTip(err)) return resolve(false);
                this.saveAccPwd(this.currEmail, newPws)
                resolve(true)
            });
        })
    }

      
    async onForgetPassword(email: string) {
        if (!email) return
        const cognitoUser = new AmazonCognitoIdentity.CognitoUser({ Username: email, Pool: this._cognitoUserPool });
        await this.showLoading()
        return new Promise<boolean>((resolve, reject) => {
            cognitoUser.forgotPassword({
                onSuccess: (data) => {
                    this.hiddenLoading()
                    resolve(true)
                },
                onFailure: (err) => {
                    this.hiddenLoading()
                    this.showErrTip(err)
                    resolve(false)
                },
            });
        })
    }

    async onForgetToConfirmPwd(email: string, smsCode: string, newPassword: string) {
        if (!email || !smsCode || !newPassword) return
        const cognitoUser = new AmazonCognitoIdentity.CognitoUser({ Username: email, Pool: this._cognitoUserPool });
        await this.showLoading()
        return new Promise<boolean>((resolve, reject) => {
            cognitoUser.confirmPassword(smsCode, newPassword, {
                onSuccess: async (success) => {
                    this.hiddenLoading()
                    await this.onLogin({
                        login: { email: email, pwd: newPassword },
                    })
                    resolve(true)
                },
                onFailure: (err) => {
                    this.hiddenLoading()
                    this.showErrTip(err)
                    resolve(false)
                },
            });
        })
    }


      
    async onDeleteUser() {
        const cognitoUser = this._cachedCognitoUser
        if (cognitoUser) {
            await this.showLoading()
            await new Promise<boolean>((resolve, reject) => {
                cognitoUser.deleteUser((err, result) => {
                    this.hiddenLoading()
                    if (this.showErrTip(err)) return resolve(false)
                    resolve(true)
                });
            })
        }
        this.onResetData()
    }

    onResetData() {
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        localStorage.removeItem(this.ID_TOKEN_KEY);
        localStorage.removeItem(this.ACCESS_TOKEN_KEY);
        this._cachedCognitoUser = null
        this.SOFTWARE_TOKEN_MFA = false
    }

      
    async checkTokenExpiration(autoLogin = true) {
        if (autoLogin) await this.showLoading()
        return new Promise<boolean>(async (resolve, reject) => {
            const awsRet = this.getAwsAuthToken()
            if (!awsRet) {
                if (autoLogin) this.hiddenLoading()
                return resolve(false)
            }
            const { cachedSession, cachedCogoitoUser } = awsRet
            if (cachedSession.isValid()) {
                let ok = true
                if (autoLogin) {
                    this.hiddenLoading()
                    ok = await this.authSuccess(cachedSession)
                }
                resolve(ok)
            } else {
                cachedCogoitoUser.refreshSession(cachedSession.getRefreshToken(), async (err, session) => {
                    if (autoLogin) this.hiddenLoading()
                    if (this.showErrTip(err)) return resolve(false)
                    this.saveAwsInfo(session)
                    // this._cachedCognitoUser.setSignInUserSession(session)
                    let ok = true
                    if (autoLogin) ok = await this.authSuccess(session)
                    resolve(ok)
                    // AWS.config.credentials = getCognitoIdentityCredentials(tokens);
                    // AWS.config.credentials.get(() => {
                    //     const credentials = AWS.config.credentials.data.Credentials;
                    //     req.session.AWSCredentials = getAWSCredentials(credentials);
                    //     next();
                    // });
                });
            }
        })
    };

    private async authSuccess(session: AmazonCognitoIdentity.CognitoUserSession, inviteCode?: string) {
        this.checkUseMFA()
        const ret: IAwsAuthResp = { ok: true, session: session }
        if (inviteCode) ret.affCode = inviteCode
        Message.dispatchEvent(DataEvent.AWS_SERVER_REQ_TOKEN)
        this.showLoading()
        const data = await HttpHome.awsAuth(ret)
        this.hiddenLoading()
        if (data) {
            Message.dispatchEvent(GameEvent.AWTLoginAuthSuccess, data)
            return true
        }
        if (!data) oops.gui.toast('login_err', true);
        return false
    }

      
    onLogout() {
        this._cachedCognitoUser?.signOut();  
        this.onResetData()
          
    }

      
    private showErrTip(err, isTip = true): boolean {
        if (err) {
            if (isTip) {
                Logger.log('err code--- ', err?.code)
                Logger.log('err message--- ', err?.message)
                let i18Key = `${err?.code ?? ''}`
                let errMsg = ''
                if (i18Key == 'NotAuthorizedException') {
                    i18Key = `${err?.message ?? ''}`
                    errMsg = LanguageData.getLangByID(i18Key)
                    if (errMsg == i18Key) {
                        i18Key = `${err?.code ?? ''}`
                        errMsg = LanguageData.getLangByID(i18Key)
                    }
                } else {
                    errMsg = LanguageData.getLangByID(i18Key)
                    if (errMsg == i18Key) {
                        i18Key = `${err?.message ?? ''}`
                        errMsg = LanguageData.getLangByID(i18Key)
                    }
                }
                if (errMsg == i18Key || errMsg == '') JSON.stringify(err)
                tips.errorTip(errMsg)
            }
            return true;
        }
        return false;
    }

    private saveAwsInfo(session: AmazonCognitoIdentity.CognitoUserSession) {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, session.getRefreshToken().getToken());
        localStorage.setItem(this.ID_TOKEN_KEY, session.getIdToken().getJwtToken());
        localStorage.setItem(this.ACCESS_TOKEN_KEY, session.getAccessToken().getJwtToken());
    }
    private save_login_key = 'autoLogins'
    saveAccPwd(emaill: string, pwd: string) {
        const canSave = storage.get(STORAGE_ENUM.saveAccPwd, false)
        if (!canSave) return
        if (emaill == '' || !emaill) return
        if (pwd == '' || !pwd) return

        const logins = localStorage.getItem(this.save_login_key);
        let attrs: IAutoLoginAcc[] = logins ? JSON.parse(logins) as IAutoLoginAcc[] : []
        const fIdx = attrs.findIndex(attr => attr.email == emaill)
        if (fIdx != -1) {
            log('', emaill)
            attrs.splice(fIdx, 1)
        }
        if (attrs.length > 19) {
            log('', emaill)
            attrs.splice(attrs.length - 1, 1)
        }
        attrs.splice(0, 0, { email: emaill, pwd: pwd })
        localStorage.setItem(this.save_login_key, JSON.stringify(attrs))
    }

    delAccPwd(emaill: string) {
        const logins = localStorage.getItem(this.save_login_key);
        let attrs: IAutoLoginAcc[] = logins ? JSON.parse(logins) as IAutoLoginAcc[] : []
        const fIdx = attrs.findIndex(attr => attr.email == emaill)
        if (fIdx != -1) {
            log('', emaill)
            attrs.splice(fIdx, 1)
        }
        localStorage.setItem(this.save_login_key, JSON.stringify(attrs))
    }

    getAutoLoginList() {
        const logins = localStorage.getItem(this.save_login_key);
        let attrs: IAutoLoginAcc[] = logins ? JSON.parse(logins) as IAutoLoginAcc[] : []
        return attrs
    }

    private getAwsAuthToken(): IAwsStorageAuthToken | undefined {
        const idToken = localStorage.getItem(this.ID_TOKEN_KEY);
        const accessToken = localStorage.getItem(this.ACCESS_TOKEN_KEY);
        const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
        if (!idToken || !accessToken || !refreshToken) return
          
        const _cachedSession = new AmazonCognitoIdentity.CognitoUserSession({
            IdToken: new AmazonCognitoIdentity.CognitoIdToken({ IdToken: idToken }),
            RefreshToken: new AmazonCognitoIdentity.CognitoRefreshToken({ RefreshToken: refreshToken }),
            AccessToken: new AmazonCognitoIdentity.CognitoAccessToken({ AccessToken: accessToken }),
            ClockDrift: -180
        });
        const userName = _cachedSession.getIdToken().payload['name'] || _cachedSession.getIdToken().payload['email']
        const _cogoitUser = new AmazonCognitoIdentity.CognitoUser({ Username: userName, Pool: this._cognitoUserPool })
        _cogoitUser.setSignInUserSession(_cachedSession)
        this._cachedCognitoUser = _cogoitUser
        return {
            cachedSession: _cachedSession,
            cachedCogoitoUser: _cogoitUser,
        }
    }

    enableMfa(openMea = false) {
        const cognitoUser = this.cachedCognitoUser
        return new Promise<boolean>((resolve, reject) => {
            if (!cognitoUser) return resolve(false)
            cognitoUser.setUserMfaPreference(null, {
                PreferredMfa: openMea,
                Enabled: openMea,
            }, async (err, _) => {
                if (this.showErrTip(err)) return resolve(false);
                resolve(true)
            });
        })
    }

    private openBindMfaPop() {
        const cognitoUser = this._cachedCognitoUser
        return new Promise<boolean>((resolve, reject) => {
            if (!cognitoUser) return
            oops.gui.open<IInitGooglePopCfg2>(UIID.BindGooglePopUp2, {
                sendCode: async (code) => {
                    await this.showLoading()
                    cognitoUser.verifySoftwareToken(code, PlatformUtil.getPlateform(), {
                        onFailure: (err) => {
                            this.showErrTip(err)
                            this.hiddenLoading(true)
                        },
                        onSuccess: async (session) => {
                            await this.enableMfa(true)
                            this.hiddenLoading(true)
                            Message.dispatchEvent(DataEvent.AWS_VERIFY_SOFT_WARE_TOKEN)
                        }
                    })
                },
                success: (b) => {
                    if (b) resolve(b)
                }
            })
        })
    }

    private sendMFACode(fun: {
        onSuccess: (
            session: AmazonCognitoIdentity.CognitoUserSession,
            userConfirmationNecessary?: boolean
        ) => void;
        onFailure: (err: any) => void;
    }, status: IAwsAuthReqStatus, mfaType?: string) {
        const cognitoUser = this.cachedCognitoUser
        this.hiddenLoading(true)
        return new Promise<boolean>((resolve, reject) => {
            if (!cognitoUser) {
                resolve(false)
                return
            }
            oops.gui.open<IInitGooglePopCfg2>(UIID.BindGooglePopUp2, {
                gameInUnBind: status?.unBind,
                gameInBind: status?.binding,
                sendCode: (code) => cognitoUser.sendMFACode(code, fun, mfaType),
                success: (b) => {
                    resolve(b)
                }
            })
        })
    }

    private async showLoading() {
        // tips.showNetLoadigMask({ content: "aws_loading" })
        await tips.showLoadingMask()
    }

    private hiddenLoading(isForce: boolean = false) {
        // tips.hideNetLoadigMask()
        tips.hideLoadingMask(isForce)
    }
}
export interface IAutoLoginAcc {
    email: string
    pwd: string
}
export interface IAwsAuthReq {
    login: { email: string, pwd: string, inviteCode?: string, useCachedCognitoUser?: boolean }
    status?: IAwsAuthReqStatus
}
export interface IAwsAuthReqStatus {
    iFristLogin?: boolean,
    binding?: boolean,
    unBind?: boolean
    //  skip bind 
    skipBind?: boolean
    skipBindAlert?: boolean
}
interface IAwsStorageAuthToken {
    cachedCogoitoUser: AmazonCognitoIdentity.CognitoUser
    cachedSession: AmazonCognitoIdentity.CognitoUserSession
}

export interface IAwsAuthResp {
    ok: boolean
    session?: AmazonCognitoIdentity.CognitoUserSession
    affCode?: string
    code?: string
}