/*
 * @Author: Y*Y*M
 * @Date: 2021-09-29 15:21:46
 * @LastEditTime: 2022-08-29 18:04:01
 * @Description: 文件描述
 * @FilePath: \uno\assets\script\framework\constant.ts
 */

import { GameLocalConfig, PlatformType, PlayerHeadInfo, PtActionType } from "./game_local_config";





export class constant {

    private static _platformToken:string = "";//平台上的token
    private static _strGameSimpleName = "";//游戏简称
    private static _strGameName = "";//游戏全称
    private static _strGameUrl = "";//游戏域名


    private static onInitGameParam() {
        const self = this;
        self._strGameSimpleName = GameLocalConfig.instance.GameSimpleName;
        self._strGameName = GameLocalConfig.instance.GameName;
        self._strGameUrl = this.getGameUrl();
    }

    /**
     * @description: 获取平台返回的token
     * @param {*}
     * @return {*}
     */    
    public static HandlerToken() {
        const self = this;
        this.onInitGameParam();

        const callHandler:Function|null = this.getPvpBarCallHandler();
        if (callHandler) {
            console.log("执行_callHandler, 参数: handlerToken");
            callHandler('handlerToken').then(function(result:any) {
                self._platformToken = result.token || "";
                console.log("====handlerToken:", result, self._platformToken);
            });
        }
    }

    /**
     * @description: 获取平台返回的token
     * @param {*}
     * @return {*}
     */    
    public static getHandlerToken() {
        return this._platformToken;
    }

    /**
     * @description: 通知平台加载进度
     * @param {number} progress
     * @return {*}
     */    
    public static StartupProgress(progress: number) {
        this.onCallHandler("startupProgress", {"progress": progress});
    }


    /**
     * @description: 创建游戏桌
     * @param {number} roomType 房间类型 public private
     * @param {string} roomMode 游戏模式
     * @return {*}
     */    
    public static CreateGameTable(roomType:number, roomMode:string) {
        const data = {
            "token":this._platformToken, 
            "type": roomType,
            "mode": roomMode
        };
        this.onCallHandler("createGame", data);
    }

    /**
     * @description: 游戏开始后回调
     * @param {number} tableId 游戏桌ID（房间ID）
     * @return {*}
     */    
    public static GameStarted(tableId:number|string) {
        if (typeof(tableId) == "number") {
            tableId = tableId.toString();
        }
        this.onCallHandler("gameStarted", {"table_id": tableId});
    }

    /**
     * @description: 游戏结束后回调
     * @param {number} tableId 游戏桌ID（房间ID）
     * @return {*}
     */    
     public static GameFinish(tableId:number|string) {
        if (typeof(tableId) == "number") {
            tableId = tableId.toString();
        }
        this.onCallHandler("gameFinish", {"table_id": tableId});
    }

    /**
     * @description: 游戏桌不存在
     * @param {*}
     * @return {*}
     */    
    public static NoExistentTable(tableId:number|string) {
        if (typeof(tableId) == "number") {
            tableId = tableId.toString();
        }

        this.onCallHandler("noExistent", {"table_id": tableId});
    }


    // 退出游戏
    public static ExitGame(){
        this.onCallHandler("exitGame", {"user_id": GameLocalConfig.instance.ptUserID});
    }

    // 发送胜利方id
    public static GameWinPlayer(user_id:string){
        // 只有约战模式才需要向平台发送结果
        if (GameLocalConfig.instance.ptAction == PtActionType.pvp) {

            this.onCallHandler("pvpResult", {"winner_id": user_id});
        }
    }

    
    /**
     * @description: 查看用户信息（点击用户头像）
     * @param {string} user_id
     * @param {boolean} login
     * @param {string} nickName
     * @param {string} avatar 头像地址
     * @return {*}
     */    
    public static ClickUserAvatar(playerInfo:PlayerHeadInfo|null) {
        if (playerInfo == null) {
            console.warn("ClickUserAvatar 用户信息不存在。");
            return;
        }

        if (!playerInfo.platformType || !playerInfo.ptUserID)  {
            console.warn("ClickUserAvatar 平台类型或者平台用户ID不存在", playerInfo.platformType, playerInfo.ptUserID);
            return;
        }

        if (playerInfo.platformType != PlatformType.PVPBAR) {
            console.warn("ClickUserAvatar 目标不是pvpbar平台用户");
            return;
        }

        
        const data:any = {
            "login": playerInfo.ptLogin == "1" || playerInfo.ptLogin == 1 || playerInfo.ptLogin || false,
            "user_id": playerInfo.ptUserID,
            "nickname": playerInfo.playerName,
            "avatar": playerInfo.portrait,  
            "platform": playerInfo.platformType,
        };
        this.onCallHandler("clickAvatar", data);
        
    }

    
    /**
     * @description: 邀请好友到游戏桌
     * @param {string} user_id
     * @param {string} nickName
     * @param {number} tableId
     * @return {*}
     */    
    public static TableInvitedFriend(user_id:string, nickName:string, tableId:number|string) {
        if (typeof(tableId) == "number") {
            tableId = tableId.toString();
        }
        
        const data =  {
            "user_id": user_id,
            "nickname": nickName,
            "table_id": tableId,
        };
        this.onCallHandler("invited", data);
    }

    /**
     * @description: HM平台，游戏结束后，推广PVPBAR平台
     * @return {*}
     */    
     public static HMGameOver() {
        if (GameLocalConfig.instance.PlatformType != PlatformType.HM) {
            console.warn("不是HM平台，不能调用游戏结束接口");
            return;
        }

        this.onHMCallHandler("gameOver");
    }
    

    private static getGameUrl():string {
        let gameUrl:string = document.domain || "";
        if (window && window.location) {
            const hrefUrl = window.location.href;
            if (hrefUrl.indexOf("https") >= 0) {
                gameUrl = "https://" + gameUrl;
            }
            else if (hrefUrl.indexOf("http") >= 0) {
                gameUrl = "http://" + gameUrl;
            }

        //     // 去掉域名后面的参数
        //     if (gameUrl.indexOf("/?") > 0) {
        //         gameUrl = gameUrl.slice(0, gameUrl.indexOf("/?"));    
        //     }
        }

        return gameUrl;
    }

    private static extendParam(param:any) {
        const commonParam = {
            "game_url": this._strGameUrl,
            "game_id": this._strGameSimpleName,
            "game_name": this._strGameName,
        };
        var fullParam = JSON.parse((JSON.stringify(param) + JSON.stringify(commonParam)).replace(/}{/, ','));
        return fullParam;
    }

    // 执行平台的回调接口
    private static onCallHandler(funName:string, data:any) {
        const callHandler:Function|null = this.getPvpBarCallHandler();
        if (callHandler) {
            const param = this.extendParam(data);
            callHandler(funName, param);
            console.log("执行pvpbar _callHandler, 接口名称:"+funName, "参数：", JSON.stringify(param));
        }
        else if (GameLocalConfig.instance.PlatformType == PlatformType.HM) {
            this.onHMCallHandler(funName);
        }
        else {
            console.warn("平台接口不存在或者不是pvpbar平台：", funName);
        }
    }
  
    /**
     * @description: 获取平台的操作接口
     * @param {*}
     * @return {*}
     */
    private static getPvpBarCallHandler():Function|null {
        if (GameLocalConfig.instance.PlatformType != PlatformType.PVPBAR) {
            return null;
        }
        
        if (window && window.flutter_inappwebview && window.flutter_inappwebview.callHandler) {
            return window.flutter_inappwebview.callHandler;
        } else if (window && window.flutter_inappwebview && window.flutter_inappwebview._callHandler) {
            return window.flutter_inappwebview._callHandler;
        }

        return null;
    }


    private static onHMCallHandler(funName:string, param?:any) {
        if (!window || !window.HappyModPvP) {
            console.warn("不是HM平台，或者接口不存在")
            return;
        }

        if (funName == "gameOver" && window.HappyModPvP.gameOver) {
            window.HappyModPvP.gameOver();
        }
        else if (funName == "exitGame") {
            window.HappyModPvP.exitGame();
        }

        console.log("执行HM平台相关接口, 接口名称:"+funName, "参数：", JSON.stringify(param||"{}"));
    }

    

    

}
