/*
 * @Author: Y*Y*M
 * @Date: 2021-12-23 18:58:42
 * @Description: 游戏内的事件基类，定义了一些通用的事件名称
 * @FilePath: \ludo\assets\script\framework\game_event_base.ts
 */
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameEventBase')
export abstract class GameEventBase {
    public static ServerConnectSucceed = "gameServerConnectSucceed";
    public static ServerWelcome = "ServerWelcome"; //刚连接服务器
    public static ServerBase = "ServerBase"; //初始用户信息
    public static SyncRoomInfo = "SyncRoomInfo"; //同步房间列表信息（数据）
    public static ServerSyncRoomList = "ServerSyncRoomList"; //同步UI上的房间列表
    public static ServerJoinRoom = "ServerJoinRoom"; //进入房间
    public static ServerJoinRoomFail = "ServerJoinRoomFail";//进入房间失败
    public static ServerLeaveRoom = "ServerLeaveRoom"; //离开房间
    public static ServerGameEnd = "ServerGameEnd"; //游戏结束

    public static ClickJoinRoom = "ClickJoinRoom";//点击加入房间

}