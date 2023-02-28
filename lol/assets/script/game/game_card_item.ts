/*
 * @Author: Y-Y-M
 * @Date: 2023-02-26 12:35:39
 * @Description: 
 */

import { _decorator, Component, Node, Button, Sprite } from 'cc';
import { clientEvent } from '../framework/clientEvent';
import { resourceUtil } from '../framework/resourceUtil';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = game_card_item
 * DateTime = Sun Feb 26 2023 12:35:39 GMT+0800 (中国标准时间)
 * Author = yym165160860
 * FileBasename = game_card_item.ts
 * FileBasenameNoExtension = game_card_item
 * URL = db://assets/script/game/game_card_item.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */
 
@ccclass('game_card_item')
export class game_card_item extends Component {
    // [1]
    // dummy = '';

    // [2]
    @property ({type:Sprite})
    cardImageSprie:Sprite|null = null;

    private _cardPosType:number = 1;//卡牌位置类型（0==不可以点击，1==可以点击位置）
    private _cardImageType:number = 0;//卡牌图案索引

    onLoad() {

    }

    

    start () {
        // [3]
    }

    setCardPosType(type:number) {
        this._cardPosType = type;
    }

    setCardImage(type:number) {
        this._cardImageType = type;
        resourceUtil.setGameIcon(""+type, this.cardImageSprie!);
    }

    getCardImage() {
        return this._cardImageType;
    }

    clickCardItem() {
        if (this._cardPosType == 0) {
            return;
        }

        clientEvent.dispatchEvent("ClickCardItem", {node:this.node});
    }

    // update (deltaTime: number) {
    //     // [4]
    // }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.4/manual/zh/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.4/manual/zh/scripting/decorator.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.4/manual/zh/scripting/life-cycle-callbacks.html
 */
