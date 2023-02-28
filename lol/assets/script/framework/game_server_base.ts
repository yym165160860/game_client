/*
 * @Author: Y*Y*M
 * @Date: 2021-12-06 18:51:32
 * @Description: 网络消息基类，不同的游戏消息处理需要从此类继承
 * @FilePath: \ludo\assets\script\framework\game_server_base.ts
 */

import { _decorator, Component, Node, sys } from 'cc';
import { i18n } from '../i18nMaster/runtime-scripts/LanguageData';
import { clientEvent } from './clientEvent';
import { constant } from './constant';
import { GameEventBase } from './game_event_base';
import { GameLocalConfig } from './game_local_config';
import { uiManager } from './uiManager';
const { ccclass, property } = _decorator;


// S结尾是需要发送的消息，R结尾是服务器返回的消息，RS结尾是发送和返回通用的
export enum NETWORK_MESSAGE_BASE {
    HELLO_S = 0, //连接成功后发送
    WELCOME_R, //发送后Hello的返回
    BASE_R, //发送后Hello的返回
    ERROR_R,
    PING_S,
    COUNT,//计数用的，游戏消息的类型需要从此数值上增加
}

 
@ccclass('GameServerBase')
export abstract class GameServerBase extends Component {

    protected connection: any = null;
    protected config: any = null;
    protected hostList:Array<string> = [];
    protected hostIndex:number = 0;
    protected curHost:string = "";
    protected handlers:any = {};
    protected messageQueue:Array<any> = [];
    protected bLogined: boolean = false;
    protected bOfflineReconnect:boolean = false;//是否断线重连
    protected reconnectTimes: number = 0;
    protected scoketTimeout:any = null;

    
    // protected abstract getServerConfig():any;// 初始化服务器配置
    protected abstract connectSuccess(host:string):void; //连接成功
    protected abstract receiveWelcome(data:any):void;
    protected abstract receiveBase(data:any):void;// 返回玩家的基础数据

    // 注册消息监听
    protected registerServerMsg() {
        this.handlers[NETWORK_MESSAGE_BASE.WELCOME_R] = this.receiveWelcome;
        this.handlers[NETWORK_MESSAGE_BASE.BASE_R] = this.receiveBase;
        this.handlers[NETWORK_MESSAGE_BASE.ERROR_R] = this.receiveError;
    }

    public connectServer() {
        // 如果服务器参数为null,则认为还没有连接服务器，否则是已经连接了不需要再连接
        if (!this.config) {

            // 注册事件
            this.registerServerMsg();


            // 获取配置，连接服务器
            // this.config = this.getServerConfig();
            this.config = GameLocalConfig.instance.getLocalConfig();
            this.hostList = this.config.host;
            this.connect();

            // 获取平台的token
            constant.HandlerToken();
        }
    }

    public reconnect() {
        if (this.hostIndex <= 0) {
            this.reconnectTimes++;    
        }
        
        console.log(`this.reconnectTimes: ${this.reconnectTimes}`, "hostIndex:", this.hostIndex);
        if (this.connection == null) {
            if (this.reconnectTimes > 3) {
                uiManager.instance.showPopupTips(i18n.t('network.reconnect'), () => {
                    this.reconnectTimes = 0;
                    this.connect();
                });
            } else {
                this.connect();
            }
        }
    }

    
    protected connect () {

        const self = this;
        console.log("====connect server:", this.hostIndex, this.hostList)
        try {
            self.curHost = self.hostList[self.hostIndex];
            self.connection = new WebSocket(self.curHost);
            self.hostIndex = (self.hostIndex + 1) % self.hostList.length;
        } catch (error) {
            console.log('websocket connect fail')
        } finally {
            this.connection.onopen = function(e:any) {
                console.log('Connected to server ' + self.curHost);
                self.bLogined = true;
                self.reconnectTimes = 0;

                if (self.scoketTimeout) {
                    clearTimeout(self.scoketTimeout);
                    self.scoketTimeout = null;
                }

                self.schedule(self.sendPing, 25);
                self.schedule(self.queueSend, 0.1);
                self.unschedule(self.reconnect);
                self.connectSuccess(self.curHost);
                clientEvent.dispatchEvent(GameEventBase.ServerConnectSucceed);
            };

            this.connection.onmessage = function(e:any) {
                if(e.data === "go") {
                    
                    self.sendHello(self.config.userId)
                    return;
                }

                self.receiveMessage(e.data);
            };

            this.connection.onerror = function(e:any) {
                console.log(`hostname: ${self.curHost} Connection Error`, e);
            };

            this.connection.onclose = function() {
                if (self.reconnectTimes == 0) {
                    console.log("The connection to Server has been lost");
                    self.unschedule(self.sendPing);
                    self.unschedule(self.queueSend);
                    self.bLogined = false;
                }

                self.scheduleOnce(self.reconnect, 3);
                self.connection = null;

                if (self.scoketTimeout) {
                    clearTimeout(self.scoketTimeout);
                    self.scoketTimeout = null;
                }
            };
        }

        // 20秒后检测连接情况，如果还未连接成功，则重新连接(close后会收到onclose回调)
        self.scoketTimeout = setTimeout(() => {
            if (self.isValid && self.bLogined != true) {
                console.warn("webScoket 连接超时，重新创建");
                self.connection && self.connection.close();
            }
        }, 30000);
    }


    protected queueSend() {
        if (this.messageQueue.length > 0 && this.connection && this.bLogined) {
            let data = this.messageQueue.shift();
            this.sendNow(data);
        }
    }
    
    protected receiveMessage (message: string) {
        let data = JSON.parse(message);
        if(data instanceof Array) {
            if(data[0] instanceof Array) {
                this.receiveActionBatch(data);
            } else {
                this.receiveAction(data);
            }
        }
    }

    protected receiveActionBatch (actions: Array<any>) {
        const self = this;

        actions.forEach(action =>  {
            self.receiveAction(action);
        });
    }

    protected receiveAction (data:any) {
        var action = data[0];
//        console.log('receive action : ' + action);
        if(this.handlers[action]) {
            this.handlers[action].call(this, data);
        } else {
            console.log('Unknown action :' + action);
        }
    }

    // 错误消息处理
    protected receiveError(data: any): void {
        const errorID = data[1];
        let errorText:string = "";
        let warningText:string = i18n.t("network.warning" + errorID);
        if (warningText && warningText.indexOf("warning"+ errorID) < 0) {
            uiManager.instance.showTips(warningText);
        }
        else {
            errorText = i18n.t("network.error" + errorID);
            if (errorText && errorText.indexOf("error" + errorID) < 0 ) {
                uiManager.instance.showPopupTips(errorText);
            }
        }

        console.warn("receiveError:", data, errorText, warningText);
    }


   
    protected sendMessage(data:any) {
        this.messageQueue.push(data);
    }
    
    private sendNow(data:any) {
        if (this.connection && this.connection.readyState == WebSocket.OPEN) {
            this.connection.send(JSON.stringify(data));
        }
    }

    private sendPing() {
        this.sendNow([NETWORK_MESSAGE_BASE.PING_S]);
    }

    private sendHello(id: string) {
        // this.sendMessage([NETWORK_MESSAGE.HELLO_S, id]);

        let actionInfo:any = [];
        if (this.config) {
            if (this.config.action == "create") {
                actionInfo = [1];
            }
            else if (this.config.action == "accept") {
                actionInfo = [2, this.config.table];
            } 
            else if (this.config.action == "join") {
                actionInfo = [3, this.config.table];
            } 
            else if (this.config.action == "pvp") {
                actionInfo = [4, this.config.table];
            } else if (this.config.action == "watch") {
                actionInfo = [5, this.config.table];
            } else if (this.config.action == "quick") {
                actionInfo = [6];
            } else {
                
            }
        }

        // // 直接创建游戏桌
        // let actionInfo = [1];
        // // 直接同意好友邀请
        // let actionInfo = [2, friend_id];
        // // 直接加入游戏桌
        // let actionInfo = [3, table];
        // // 围观 or PVP
        // let actionInfo = [4, table];

        this.sendMessage([NETWORK_MESSAGE_BASE.HELLO_S, id, actionInfo]);
    }

    public set OfflineReconnect(b:boolean) {
        this.bOfflineReconnect = b;
    }

    public get OfflineReconnect() {
        return this.bOfflineReconnect;
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
