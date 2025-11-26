/*
 * @Author: dgflash
 * @Date: 2021-11-23 15:28:39
 * @LastEditors: dgflash
 * @LastEditTime: 2022-01-26 16:42:00
 */

  
export enum GameEvent {
      
    HomeServerConnected = "HomeServerConnected",
      
    HomeServerReconnect = "HomeServerReconnect",
      
    HomeServerDataRefresh = "HomeServerDataRefresh",
      
    HomeServerDisconnect = "HomeServerDisconnect",
      
    GameServerConnected = "GameServerConnected",
      
    GameServerReconnect = "GameServerDisconnect",
      
    // GameServerDataRefresh = "GameServerDataRefresh",
      
    GameServerDisconnect = "GameServerDisconnect",
      
    HomeTurnPages = "HomeTurnPages",
    HomePagesShowOrHide = "HomePagesShowOrHide",
      
    LoginSuccess = "LoginSuccess",
      
    AWTLoginAuthSuccess = "AWTLoginAuthSuccess",
      
    CardGroupDataRefresh = "CardGroupDataRefresh",
      
    CardDataRefresh = "CardDataRefresh",
      
    EquipGroupDataRefresh = "EquipGroupDataRefresh",
      
    EquipDataRefresh = "EquipDataRefresh",
      
    PVECardGroupDataRefresh = "PVECardGroupDataRefresh",
      
    PVEEquipGroupDataRefresh = "PVEEquipGroupDataRefresh",
      
    CardSingleRefresh = "CardSingleRefresh",
      
    EquipSingleRefresh = "EquipSingleRefresh",
      
    CardHotDeleteRefresh = "CardHotDeleteRefresh",
      
    FriendHotDeleteRefresh = "FriendHotDeleteRefresh",
      
    EquipHotDeleteRefresh = "EquipHotDeleteRefresh",
      
    CSCardGroupSaveRefresh = 'CSCardGroupSaveRefresh',
      
    PVECardGroupSaveRefresh = 'PVECardGroupSaveRefresh'
}