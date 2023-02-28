/*
 * @Author: Y-Y-M
 * @Date: 2023-02-25 18:02:35
 * @Description: 
 */

import { _decorator, Component, Node, Prefab, utils } from 'cc';
import { clientEvent } from '../framework/clientEvent';
import { poolManager } from '../framework/poolManager';
import { resourceUtil } from '../framework/resourceUtil';
import { util } from '../framework/util';
import { game_card_item } from './game_card_item';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = game_main_logic
 * DateTime = Sat Feb 25 2023 18:02:35 GMT+0800 (中国标准时间)
 * Author = yym165160860
 * FileBasename = game_main_logic.ts
 * FileBasenameNoExtension = game_main_logic
 * URL = db://assets/script/game/game_main_logic.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */
 
@ccclass('game_main_logic')
export class game_main_logic extends Component {
    // [1]
    // dummy = '';

    // [2]
    @property({type:Node})
    cardContentNode:Node = null;

    @property({type:Node})
    disappearBarNode:Node = null;

    private cardItemPrefab:Prefab|null = null;

    onLoad() {
        clientEvent.on("ClickCardItem", this.onClickCardItem, this);
    }

    onDestroy() {
        clientEvent.off("ClickCardItem", this.onClickCardItem, this);
    }

    start () {
        // [3]

        const _self = this;
        resourceUtil.getPrefabRes("CardItem", (error:Error, asset:Prefab)=>{
            if (!error) {
                
             
               _self.cardItemPrefab = asset;
               _self.initGameCard();
                

            }
        });
        
    }

    // update (deltaTime: number) {
    //     // [4]
    // }

    initGameCard() {
        let cardPostList = [
            // // 第一层
            // [
            //     // 第一行
            //     {x:-300, y:-300},
            //     {x:-150, y:-300},
            //     {x:0, y:-300},
            //     {x:150, y:-300},
            //     {x:300, y:-300},

            //     // 第二行
            //     {x:-300, y:-150},
            //     {x:-150, y:-150},
            //     {x:0, y:-150},
            //     {x:150, y:-150},
            //     {x:300, y:-150},

            //     // 第三行
            //     {x:-300, y:0},
            //     {x:-150, y:0},
            //     {x:0, y:0},
            //     {x:150, y:0},
            //     {x:300, y:0},
            // ]
            
        ];

        // 第一层
        cardPostList[0] = [];
        let posY = -3;
        for (let row = 0; row < 6; row++) {
            let posX = 0;
            let posList = {};
            for (let index = 0; index < 6; index++) {
                posX = (util.getRandomInt(0, 60)%6)-3;
                while( posList[posX] != null) {
                    posX = (util.getRandomInt(0, 60)%6)-3;
                }
    
                cardPostList[0].push({x: (posX+0.5) * 104, y: (posY-0.5)*104})
                posList[posX] = cardPostList[cardPostList.length - 1];
                
            }
            posY++;
        }

        // 第二层
        cardPostList[1] = [];
        posY = -6;
        for (let row = 0; row < 7; row++) {
            let posX = 0;
            let posList = {};
            for (let index = 0; index < 7; index++) {
                posX = (util.getRandomInt(0, 60)%7)-3;
                while( posList[posX] != null) {
                    posX = (util.getRandomInt(0, 60)%7)-3;
                }
    
                cardPostList[1].push({x: (posX+0.5) * 104, y: posY*104})
                posList[posX] = cardPostList[cardPostList.length - 1];
                
            }
            posY++;
        }
        

        // for (let index = 0; index < cardPostList.length; index++) {
        //     const element = cardPostList[index];
        //     this.onCreateCardItem(element);
        // }

        this.onCreateCardItem(cardPostList);
    }

    onCreateCardItem(cardPostList) {
        if(!cardPostList) {
            return;
        }

        for (let index = 0; index < cardPostList.length; index++) {
            const element = cardPostList[index];
            if (element instanceof Array) {
                this.onCreateCardItem(element)
                continue;
            }

            
            let newCard = poolManager.instance.getNode(this.cardItemPrefab, this.cardContentNode);
            newCard.setPosition(element.x, element.y);
            newCard.getComponent(game_card_item)?.setCardImage(util.getRandomInt(1, 9));
        }
    }

    onClickCardItem(e:any) {
        this.cardContentNode.removeChild(e.node);
        
        clientEvent.dispatchEvent("DisappearBarAddNewCard", {node: e.node});
    }
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
