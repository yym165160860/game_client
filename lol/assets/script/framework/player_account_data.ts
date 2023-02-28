/*
 * @Author: Y*Y*M
 * @Date: 2021-12-31 10:39:50
 * @Description: 玩家账号信息
 * @FilePath: \ludo\assets\script\framework\player_account_data.ts
 */

import { _decorator, Component, Node } from 'cc';
import { util } from './util';
const { ccclass, property } = _decorator;


@ccclass('PlayerAccountData')
export class PlayerAccountData extends Component {
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;



    protected playerInfo:any = {};


    static _instance: PlayerAccountData;

    static get instance() {
        if (!this._instance) {
            this._instance = new PlayerAccountData();
        }

        return this._instance;
    }
    

    start () {
        // [3]
    }

    // update (deltaTime: number) {
    //     // [4]
    // }

    // static _instance: PlayerAccountData;

    // static get instance() {
    //     if (!this._instance) {
    //         this._instance = new PlayerAccountData();
    //     }

    //     return this._instance;
    // }

  
    public get PlayerID():string {
        return this.playerInfo.playerID || "";
    }

    public get PlayerName():string {
        return this.playerInfo.name || "";
    }

    public get PlayerPortrait() {
        if (this.playerInfo && this.playerInfo.portrait) {
            return this.playerInfo.portrait;
        }

        return "common/defaulthead"
    }

    public get PlayerInfo() {
        return util.clone(this.playerInfo||{});
    }

    public initBaseInfo(data:any) {
        this.playerInfo.playerID = data[1];
        this.playerInfo.name = data[2];
    }

    public syncBase(data:any) {
        this.playerInfo.name = data[1];
        this.playerInfo.portrait = data[2];
        this.playerInfo.gender = data[3];
        this.playerInfo.level = data[4];
        this.playerInfo.experience = data[5];
        this.playerInfo.gold = data[6];
        this.playerInfo.played = data[7];
        this.playerInfo.win = data[8];
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
