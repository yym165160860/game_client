/*
 * @Author: Y*Y*M
 * @Date: 2021-12-21 10:39:02
 * @Description: 游戏本地配置的基类，每个游戏的本地配置需要从此类继承
 * @FilePath: \ludo\assets\script\framework\game_local_config.ts
 */

import { _decorator, Component, Node, sys, game, TextAsset, Asset, JsonAsset } from 'cc';
import { i18n } from '../i18nMaster/runtime-scripts/LanguageData';
import { csvManager } from './csvManager';
import { resourceUtil } from './resourceUtil';
import { util } from './util';
const { ccclass, property } = _decorator;



export const PlatformType = {
    None: "",
    PVPBAR: "PVPBAR",
    HM: "hm"
}

export const PtActionType = {
    create: "create",
    accept: "accept", //接受邀请
    join: "join", //加入
    pvp: "pvp", //约战
    watch: "watch", //观看
    quick: "quick", //快速开始
}

export interface PlayerHeadInfo {
    campID:number;
    playerID:string;
    portrait:string;
    playerName:string;//值为：imrobot 时是机器人
    platformType:string;
    ptUserID:string;//平台的用户ID
    ptLogin:any;//平台的登录状态
    
    seat?:number;
    country?:string;
}


// 初始化语言
i18n.init("en");
 
@ccclass('GameLocalConfig')
export class GameLocalConfig extends Component {
   

    protected csvManager:csvManager|null = null;
    protected _aloneMode:boolean = false; //是否单机模式
    protected _localConfig:any = null; //本地用户信息（服务器地址，用户ID，和平台一些相关信息）

    protected _loadCompleteCb:Function|null|undefined = null
    protected _loadTarget:any = null;
    protected _loadFileCount:number = 0;
    protected _currentLoad:number = 0;

    static _instance: GameLocalConfig;
    static get instance () {
        if (!this._instance) {
            this._instance = new GameLocalConfig();
        }

        return this._instance;
    }


    /**
     * @description: 加载配置文件
     * @param {any} loadData  { storageKey: "uno_config" };
     * @param {Function} cb
     * @param {any} target
     * @return {*}
     */    
    public loadConfig (loadData:any, cb?: Function, target?:any) {

        // 设置游戏帧率
        game.frameRate = 30;

        this._loadCompleteCb = cb;
        this._loadTarget = target;

        if (!this.csvManager) {
            this.csvManager = new csvManager();    
            this.loadLocalFile(loadData);
        }
        else {
            this.loadComplete();
        }
    }

    //加载本地配置文件
    protected loadLocalFile(loadData:any):void  {
        resourceUtil.loadDir("data", "", (error:Error|null, assets:Array<Asset>)=>{
            console.log("$$$$$assets:",assets);
            if (assets) {
                for (const key in assets) {
                    const tableName = assets[key].name;
                    if (tableName == "server") {
                        // 加载服务器配置
                        this.loadStorageConfig(loadData.storageKey, (<JsonAsset>assets[key]).json);
                    }
                    else {
                        this.csvManager!.addTable(tableName, (<TextAsset>assets[key]).text);
                    }
                }
            }

            this.loadComplete();
        });
    }

    // 单机模式
    public get AloneMode() {
        return this._aloneMode;
    }

    // 游戏简称
    public get GameSimpleName() {
        if (this._localConfig.gameInfo) {
            return this._localConfig.gameInfo[0] || "undefineName";    
        }
        
        return "undefineName";
    }

    // 游戏全称
    public get GameName() {
        if (this._localConfig.gameInfo) {
            return this._localConfig.gameInfo[2] || "undefineName";    
        }
        
        return "undefineName";
    }

    // 开放的房间模式
    public get GameRoomModeInfo() {
        if (this._localConfig.gameInfo) {
            return this._localConfig.gameInfo[1] || [];    
        }
        
        return [];
    }

    // 平台用户ID
    public get ptUserID() {
        if (this._localConfig && this._localConfig.pt_userid) {
            return this._localConfig.pt_userid;
        }

        return "";
    }

    // 平台用户是否登录
    public get isLogin() {
        if (this._localConfig && this._localConfig.login) {
            if (typeof(this._localConfig.login) == "string") {
                return this._localConfig.login == "1";
            }
            else if (typeof(this._localConfig.login) == "number") {
                return this._localConfig.login == 1;
            }
            else {
                return this._localConfig.login;
            }
        }

        return false;
    }

    /**
     * 是否是pvpbar平台 
     */
    public get isPvpbarPlatform() {
        if (this._localConfig && this._localConfig.platform) {
            return this._localConfig.platform == PlatformType.PVPBAR;
        }

        return false;
    }

    // 平台类型
    public get PlatformType() {
        if (this._localConfig && this._localConfig.platform) {
            return this._localConfig.platform;
        }

        return "";
    }

    /**
     * 平台传入的操作类型
     */
    public get ptAction() {
        if (this._localConfig && this._localConfig.action) {
            return this._localConfig.action;
        }

        return "";
    }

    /**
     * 获取平台操作的游戏桌ID
     */
    public get ptTableID():number {
        if (this._localConfig && this._localConfig.table != null) {
            if (typeof(this._localConfig.table) == "string") {
                if (this._localConfig.table.length <= 0) {
                    return -1;
                }

                return Number(this._localConfig.table);
            }
            else if (typeof(this._localConfig.table) == "number") {
                return this._localConfig.table;
            }
        }

        return -1;
    }

    /**
     * @description: 判断是否从平台直接进入游戏桌
     * @param {*}
     * @return {*}
     */    
    public get isJoinGameTable() {
        const action = this.ptAction;
        switch (action) {
            case PtActionType.join:
            case PtActionType.accept:
            case PtActionType.pvp:
            case PtActionType.watch:
            case PtActionType.quick:
                return true;
            default:
                return false;
        }
        
        return false;
    }

    public getLocalConfig():any {
        return util.clone(this._localConfig);
    }

    queryOne (tableName: string, key: string|number, value: any) {
        return this.csvManager!.queryOne(tableName, key, value);
    }

    queryByID (tableName: string, ID: string|number) {
        return this.csvManager?.queryByID(tableName, ID);
    }

    getTable (tableName: string) {
        return this.csvManager?.getTable(tableName);
    }

    getTableArr (tableName: string) {
        return this.csvManager?.getTableArr(tableName);
    }

    // 选出指定表里面所有有 key=>value 键值对的数据
    queryAll (tableName: string, key: string, value: any) {
        return this.csvManager?.queryAll(tableName, key, value);
    }

    // 选出指定表里所有 key 的值在 values 数组中的数据，返回 Object，key 为 ID
    queryIn (tableName: string, key: string, values: Array<any>) {
        return this.csvManager?.queryIn(tableName, key, values);
    }

    // 选出符合条件的数据。condition key 为表格的key，value 为值的数组。返回的object，key 为数据在表格的ID，value为具体数据
    queryByCondition (tableName: string, condition: any) {
        return this.csvManager?.queryByCondition(tableName, condition);
    }

    // 读取本址的服务器配置和平台的一相关信息
    protected loadStorageConfig(storageKey:string, serverJson:any) {
        // 优先获取本地存储中的key
        let content = sys.localStorage.getItem(storageKey);
        if (content && content.length) {
            if (content.startsWith('@')) {
                content = content.substring(1);
            }
            this._localConfig = JSON.parse(content);

            if (this._localConfig.host) {
                this._localConfig.host = JSON.parse(this._localConfig.host);
            }

            if (this._localConfig.gameInfo) {
                this._localConfig.gameInfo = JSON.parse(this._localConfig.gameInfo);
            }
        }
        else {
            // 读取文件中的配置
            this._localConfig = serverJson;

            if (this._localConfig.host) {
                this._localConfig.host = [this._localConfig.host];
            }
        }

        // 初始化语言
        i18n.init(this._localConfig.language ||"en");
    }


    protected loadComplete() {
        if (this._loadCompleteCb) {
            this._loadCompleteCb.call(this._loadTarget, this._localConfig);
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
