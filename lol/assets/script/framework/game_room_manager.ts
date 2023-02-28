import { _decorator, Component, Node } from 'cc';
import { util } from '../framework/util';
import { clientEvent } from './clientEvent';
import { PlayerHeadInfo } from './game_local_config';
import { PlayerAccountData } from './player_account_data';
const { ccclass, property } = _decorator;


// 玩家属性
export interface GamePlayerAttr {
    playerID?:string, // 用户openid
    name?:string, // 名称
    level?:number, // 等级
    portrait?:string, // 头像
    country?:number, //地区
    user_id?:string, //平台 user_id
    login?:number, // login
    seat?:number, // 座位，从0 开始
    campID?:number, // 阵营 如果是非对战的，从0 到 最大人数 -1;如果是对战的 座位0,2 是1 ，座位1,3是2 
    roleID?:number, //角色ID
    roleHP?:number,
    roleMP?:number,
    pieceType?:number, // 分配到的棋子类型
    propNumber?:number, // 当前回合道具使用次数

}

@ccclass('GameRoomManager')
export class GameRoomManager extends Component {

    protected _roomListInfo:Array<any> = []; //所有房间列表
    protected _joinRoomInfo:any = {}; //当前进入的房间信息
    protected _selfCampID:number = -1; //在房间内自己的阵营ID
    protected _bRoomReady:boolean = false; //当前所在的房间是否已经准备开始
    protected _bPlayAgainGame:boolean = false; //是否再来一局

    protected _bReconnection:boolean = false;//是否断线回连
    protected _curCampScore:any = {1:0, 2:0};//当前游戏桌（房间）的比分
   
      
    // public abstract syncRoomList(data:any):void;// 同步房间列表
    // public abstract setJoinRoomInfo(data:any):void; //设置进入的房间信息

    static _instance: GameRoomManager;
    static get instance() {
        if (!this._instance) {
            this._instance = new GameRoomManager();
        }

        return this._instance;
    }

 
    // 获取房间ID
    public get JoinRoomID() {
        if (this._joinRoomInfo) {
            return this._joinRoomInfo.roomID;
        }

        return -1;
    }

    public get JoinRoomInfo() {
        if (this._joinRoomInfo) {
            return util.clone(this._joinRoomInfo);
        }
        
        return null;
    }

    /**
     * get SelfCampID
     */
    public get SelfCampID() {
       return this._selfCampID; 
    }

    /**
     * set SelfCampID
     */
    public set SelfCampID(campID:number) {
        this._selfCampID = campID;
    }

    
    /**
     * get IsJoinGameRoom
     */
     public get IsJoinRoom() {
        return this._joinRoomInfo != null && util.getPropertyCount(this._joinRoomInfo) > 0;
    }

    public get IsRoomReady() {
        return this._bRoomReady;
    }

    public set IsRoomReady(ready) {
        this._bRoomReady = ready;
    }


    /**
     * set _bReconnection
     */
    public set Reconnection(val:boolean) {
        this._bReconnection = val;
    }

    /**
     * get _bReconnection
     */
    public get Reconnection() {
        return this._bReconnection;
    }

    /**
     * @description: 是否再来一局
     * @param {boolean} b
     * @return {*}
     */    
    public set PlayAgainGame(b:boolean) {
        this._bPlayAgainGame = b;
    }

    public get PlayAgainGame() {
        return this._bPlayAgainGame;
    }

    /**
     * @description: 清理房间内已经离线（离开）的玩家
     * @param {*}
     * @return {*}
     */    
    public clearRoomPlayerInfo() {
        if (!this._joinRoomInfo) {
            return;
        }

        // 用户状态，0：在线，1：离线，2：离开，3：加入
        for (let index = 0; index < this._joinRoomInfo.players.length; index++) {
            const playerInfo = this._joinRoomInfo.players[index];
            if (playerInfo && (playerInfo.status == 1 || playerInfo.status == 2 || playerInfo.playerID == "imrobot")) {
                this._joinRoomInfo.players[index] = null;
            }
        }

        console.log("----clearRoomPlayerInfo:", this._joinRoomInfo)

        // 清空比分
        this._curCampScore = {1:0, 2:0};
    }

    /**
     * @description: 保存当前房间的比分
     * @param {number} campID
     * @param {number} score
     * @return {*}
     */    
    public saveCurRoomScore(campID:number, score:number) {
        this._curCampScore[campID] = score;
    }

    public getCurRoomScore():any {
        return this._curCampScore;
    }


    public getAllRoomList():any {
        return util.clone(this._roomListInfo);
    }

    public getRoomInfo(roomID:number) {
        for (const data of this._roomListInfo) {
            if (data.roomID == roomID) {
                return util.clone(data);
            }
        }

        return null;
    }

    public getRoomInfoIndex(roomID:number) {
        for (let index = 0; index < this._roomListInfo.length; index++) {
            if (this._roomListInfo[index].roomID == roomID) {
                return index;
            }
            
        }

        return -1;
    }

    /**
     * getRoomCount
     */
    public getRoomCount() {
        return this._roomListInfo.length;
    }
   
    public setJoinRoomInfo(bSelf:boolean, data:any) {
        // 更新进入的房间信息，则需重置房间的ready状态则
        this.IsRoomReady = false;

        if (bSelf == true) {
            this._updateSelfJoinRoomInfo(data);
        }
        else if (data && this.JoinRoomID == data[0]) {
            // 如果新的数据是自己的房间才能更新
            this._updateSelfJoinRoomInfo(data);
        }
    }

    private _updateSelfJoinRoomInfo(data:any) {
        if (data) {
            let roomInfo:any = {};
            roomInfo.roomID = data[0];
            roomInfo.limit = data[1];
            roomInfo.type = data[2]; //public private
            roomInfo.gold = data[3];
            roomInfo.status = data[5]; //暂时没用
            roomInfo.mode = data[6];

            roomInfo.players = [];

            if (data[4].length > 0) {
                data[4].forEach((user:any) => {
                    if (user && user.length > 0) {
                        let  playerInfo:PlayerHeadInfo = {
                            campID: -1,
                            country: user[0],
                            portrait: user[1],
                            playerID: user[2],
                            playerName: user[3],
                            ptUserID: user[4],
                            ptLogin: user[5],
                            seat: user[6],
                            platformType: user[7],
                        };
                        
                        roomInfo.players.push(playerInfo);
                    }
                });
            }

            // 将玩家信息按座位号排序
            roomInfo.players.sort((a:any, b:any)=>{
                return a.seat - b.seat;
            });
            this._joinRoomInfo = roomInfo;
        }
        else {
            this._joinRoomInfo = null;
            this._curCampScore = {1:0, 2:0};
            this._selfCampID = -1;
        }

        console.log("更新自己所在游戏桌信息：", this._joinRoomInfo, data);
    }
   
    // 同步房间列表
    public syncRoomList(data:any) {
        let adds = data[1];
        let dels = data[2];
        adds.forEach((item:any) => {
            let roomInfo:any = {};
            roomInfo.roomID = item[0];
            roomInfo.limit = item[1];
            roomInfo.type = item[2];
            roomInfo.gold = item[3];
            roomInfo.status = item[5]; // 状态 1、普通；2、已经开始
            roomInfo.isPlaying = roomInfo.status == 2;
            roomInfo.players = [];
            roomInfo.inRoom = 0;

            if (item[4].length > 0) {
                item[4].forEach((user:any) => {
                    if (user && user.length > 0) {

                        let playerHeadInfo:any = {
                            country: user[0],
                            portrait: user[1],
                            playerID: user[2],// 值为：imrobot 时是机器人
                            playerName: user[3],
                            platformType: user[4],
                        }

                        if (playerHeadInfo.playerID == PlayerAccountData.instance.PlayerID) {
                            roomInfo.inRoom = 1;
                        }

                        roomInfo.players.push(playerHeadInfo)
                    }
                })
            }

            const infoIndex = this.getRoomInfoIndex(roomInfo.roomID);
            if (infoIndex < 0) {
                this._roomListInfo.push(util.clone(roomInfo));



                this._roomListInfo.sort((a,b)=>{
                    const aPriority:number = a.roomID + a.inRoom*100000 + (a.isPlaying?0:10000);
                    const bPriority:number = b.roomID + b.inRoom*100000 + (b.isPlaying?0:10000);
                    return bPriority - aPriority;
                });
               
                clientEvent.dispatchEvent("ServerSyncRoomList", {type: "add", roomInfo: roomInfo});
            }
            else if (infoIndex >= 0) {
                this._roomListInfo[infoIndex] = util.clone(roomInfo);

                this._roomListInfo.sort((a,b)=>{
                    const aPriority:number = a.roomID + a.inRoom*100000 + (a.isPlaying?0:10000);
                    const bPriority:number = b.roomID + b.inRoom*100000 + (b.isPlaying?0:10000);
                    return bPriority - aPriority;
                });
                
                clientEvent.dispatchEvent("ServerSyncRoomList", {type: "refresh", roomInfo: roomInfo});
            }
        });

        dels.forEach((delRoomID:any) => {
            const infoIndex = this.getRoomInfoIndex(delRoomID);
            if (infoIndex >= 0) {
                this._roomListInfo.splice(infoIndex, 1);
            }

            // delete this._roomListInfo[delRoomID];
            clientEvent.dispatchEvent("ServerSyncRoomList", {type: "delete", roomID: delRoomID});
        });
    }

    public refreshRoomPlayerInfo(data:any) {
        if (!this._joinRoomInfo) {
            return;
        }

        // 用户状态，0：在线，1：离线，2：离开，3：加入
        for (let index = 0; index < this._joinRoomInfo.players.length; index++) {
            const playerInfo = this._joinRoomInfo.players[index];
            if (playerInfo.playerID == data.playerID) {
                playerInfo.status = data.status;
                if (data.status == 2) {
                    this._joinRoomInfo.players.splice(index, 1);
                }
                break;
            }
        }
    }

  
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.3/manual/zh/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.3/manual/zh/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.3/manual/zh/scripting/life-cycle-callbacks.html
 */
