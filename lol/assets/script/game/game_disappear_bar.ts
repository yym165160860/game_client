/*
 * @Author: Y-Y-M
 * @Date: 2023-02-26 12:33:56
 * @Description: 
 */

import { _decorator, Component, Node } from 'cc';
import { clientEvent } from '../framework/clientEvent';
import { poolManager } from '../framework/poolManager';
import { game_card_item } from './game_card_item';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = game_disappear_bar
 * DateTime = Sun Feb 26 2023 12:33:56 GMT+0800 (中国标准时间)
 * Author = yym165160860
 * FileBasename = game_disappear_bar.ts
 * FileBasenameNoExtension = game_disappear_bar
 * URL = db://assets/script/game/game_disappear_bar.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */
 
@ccclass('game_disappear_bar')
export class game_disappear_bar extends Component {
    // [1]
    // dummy = '';

    // [2]
    @property ({type:Node})
    contentNode:Node|null = null;

    onLoad() {
        clientEvent.on("DisappearBarAddNewCard", this.onAddNewCard, this);
    }

    onDestroy() {
        clientEvent.off("DisappearBarAddNewCard", this.onAddNewCard, this);
    }

    start () {
        // [3]
    }

    onAddNewCard(e:any) {
        if (e.node.parent) {
            e.node.removeFromParent();
        }
        
        e.node.setPosition(0, 0);
        this.contentNode.addChild(e.node)
        e.node.getComponent(game_card_item)?.setCardPosType(0);

        setTimeout(()=>{
            if (this.isValid) {
                this.onCheckCanDisappear();
            }
        }, 500)
        
    }

    onCheckCanDisappear() {
        let allCardTypeList = {};
        for (const cardNode of this.contentNode.children) {
            const cardItem:game_card_item = cardNode.getComponent(game_card_item);
            const cardImage = cardItem.getCardImage();
            if (allCardTypeList[cardImage] == null) {
                allCardTypeList[cardImage] = [];
            }

            allCardTypeList[cardImage].push(cardNode);
        }

        for (const key in allCardTypeList) {
            if (allCardTypeList[key].length >= 3) {
                for (let index = 0; index < 3; index++) {
                    poolManager.instance.putNode(allCardTypeList[key][index]);
                }
                
            }
        }
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
