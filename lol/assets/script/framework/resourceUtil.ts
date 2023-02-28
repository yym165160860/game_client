/*
 * @Author: Y*Y*M
 * @Date: 2021-09-01 14:36:04
 * @LastEditTime: 2022-08-23 14:30:15
 * @Description: 资源加载管理器，所有需要动态加载的资源，都需要通过这个文件进行加载。（按需添加相应的接口）
 * @FilePath: \uno\assets\script\framework\resourceUtil.ts
 */


import { _decorator, Prefab, Node, Sprite, SpriteFrame, Texture2D, Asset, error, instantiate, find, resources, isValid, assetManager, AssetManager, TextAsset, JsonAsset, Constructor, ImageAsset, PhysicMaterial, AudioClip, SpriteAtlas, TiledMap, TiledMapAsset } from "cc";
import { util } from "./util";
const { ccclass } = _decorator;



declare global {
    namespace globalThis {
        var LZString: any;
    }
}

interface ITextAsset{
    text?: string;
    _file?: string;
    json?: string
}

interface ResBundleData {
    key: string;
    bundle?: AssetManager.Bundle;
    assetRes?:any;
}

interface RemoteSprite {
    url: string,
    refCount:number,
    spriteFrame:SpriteFrame|null,
}


export type LoadCompleteCallback<T> = (error: Error | null, asset: T) => void;


@ccclass("resourceUtil")
export class resourceUtil {

    private static remoteSpriteList:any = {};//RemoteSprite


    public static initSpriteFrameManager() {
        const _self = this; 
        setInterval(()=>{
            _self.releaseUnusedAssets();
         }, 1000*60);
    }

    // public static traceObject(obj : Asset) {
    //     let addRefFunc = obj.addRef;
    //     let decRefFunc = obj.decRef;
    //     let traceMap = new Map();

    //     obj.addRef = function() : Asset {
    //         let stack = ResUtil.getCallStack(1);
    //         let cnt = traceMap.has(stack) ? traceMap.get(stack) + 1 : 1;
    //         traceMap.set(stack, cnt);
    //         return addRefFunc.apply(obj, arguments);
    //     }

    //     obj.decRef = function() : cc.Asset {
    //         let stack = ResUtil.getCallStack(1);
    //         let cnt = traceMap.has(stack) ? traceMap.get(stack) + 1 : 1;
    //         traceMap.set(stack, cnt);
    //         return decRefFunc.apply(obj, arguments);
    //     }

    //     obj['dump'] = function() {
    //         console.log(traceMap);
    //     }
    // }


    /**
     * @description: 释放引用为0的资源
     * @return {*}
     */    
    private static releaseUnusedAssets() {
        let tempCopyList:any = this.remoteSpriteList;
        this.remoteSpriteList = {};
        for (const key in tempCopyList) {
            if (tempCopyList[key] && tempCopyList[key].refCount <= 0) {
                console.log("释放网络图片资源 url:"+tempCopyList[key].spriteFrame.name)
                let spriteData:RemoteSprite = tempCopyList[key];
                spriteData.spriteFrame?.texture.decRef();
                spriteData.spriteFrame?.decRef();
                // spriteData.spriteFrame?.destroy();
                spriteData.spriteFrame = null;
                tempCopyList[key] = null;
            }
            else {
                this.remoteSpriteList[key] = tempCopyList[key];
            }
        }
    }

    


    public static loadDir<T extends Asset>(bundleName:string, dirName:string, cb?: LoadCompleteCallback<Asset[]>) {
        assetManager.loadBundle(bundleName, (error, bundleAsset)=>{
            if (!error) {
                resourceUtil._loadDirRes(bundleAsset, dirName, cb);
            }
            
        });
    }

    public static loadRes<T extends Asset>(bundleName:string, url: string, type: Constructor<T> | null, cb?: LoadCompleteCallback<T>) {
        assetManager.loadBundle(bundleName, (error, bundleAsset)=>{
            if (!error) {
                resourceUtil._loadAssetRes(bundleAsset, url, type, cb);
            }
            
        });
    }

    private static _loadDirRes<T extends Asset>(bundle:AssetManager.Bundle, dirName: string, cb?: LoadCompleteCallback<Asset[]>)
    {
        bundle.loadDir(dirName, (err, data)=>{
            if (err) {
                error(err.message || err);
                if (cb) {
                    cb(err, data);
                }

                return;
            }

            if (cb) {
                cb(err, data);
            }
        });
    }

    private static _loadAssetRes<T extends Asset>(bundle:AssetManager.Bundle, url: string, type: Constructor<T> | null, cb?: LoadCompleteCallback<T>) {
        bundle.load(url, type, (err, res) => {
            if (err) {
                error(err.message || err);
                if (cb) {
                    cb(err, res);
                }

                return;
            }

            if (cb) {
                cb(err, res);
            }
        });
    }

    public static getData(fileName: string, cb: (err: Error | null, asset: any) => void) {
        this.loadRes("data", fileName, TextAsset, (err, content)=> {
            if (err) {
                error(err.message || err);
                return;
            }

            const txt = content as unknown as ITextAsset;
            let text = txt!.text;
            if (!text) {
                resources.load(content.nativeUrl, (err, content) => {
                    text = content as unknown as string;
                    cb(err, text);
                });

                return;
            }

            cb(err, text);
        });
    }


    public static getPhysicMaterial(filePath: string, cb?: (err: Error | null, asset?: PhysicMaterial) => void) {
        this.loadRes("materials", "physics/" + filePath, PhysicMaterial, cb);
    }

    public static getAudioRes(filePath: string,  cb?: (err: Error | null, asset?: AudioClip) => void) {
        this.loadRes("audio", filePath, AudioClip, cb);
    }

    public static getPrefabRes(filePath: string, cb?: (err: Error | null, asset?: Prefab) => void) {
        this.loadRes("prefab", filePath, Prefab, cb);
    }


    public static getUIPrefabRes(prefabPath: string, cb?: (err: Error | null, asset?: Prefab) => void) {
        this.loadRes("prefab", prefabPath, Prefab, cb);
    }

    public static getImageTex(texPath: string, cb?: (err: Error | null, asset?: ImageAsset) => void) {
        this.loadRes("resources", "textures/" + texPath, ImageAsset, cb);
    }

    public static createUI(path: string, parent?: Node | null, cb?: (err: Error | null, node?: Node) => void) {
        this.getUIPrefabRes(path, (err: Error | null, prefab?: Prefab) => {
            if (err) return;
            const node = instantiate(prefab!);
            node.setPosition(0, 0, 0);
            if (!parent) {
                parent = find("Canvas");
            }

            parent!.addChild(node);
            if(cb){
                cb(null, node);
            }
        });
    }

    public static getJsonData(fileName: string, cb: (err: Error | null, asset: any) => void) {
        this.loadRes("data", fileName, JsonAsset, (err, content)=> {
            if (err) {
                error(err.message || err);
                cb && cb(err, null);
                return;
            }
            const txt = content as unknown as ITextAsset;
            if (txt.json) {
                cb(err, txt.json);
            } else {
                const errObj = new Error('failed!!!')
                cb(errObj, null);
            }
        });
    }

   
    
    /**
     * 设置更多游戏的游戏图标
     */
    public static setGameIcon (gameImgPath: string, sprite: Sprite|null, plistPath?:string, cb?: LoadCompleteCallback<SpriteFrame|null>) {
        if (!gameImgPath) {
            console.warn("setGameIcon: image is null");
            return;
        }

        if (!sprite) {
            console.warn("setGameIcon: sprite is null");
            return;
        }

        if (gameImgPath.startsWith('http')) {
            this.setRemoteImage(gameImgPath, sprite, cb);
        } else {
            if (plistPath) {
                this.setPlistSpriteFrame(plistPath, gameImgPath, sprite, cb);
            }
            else {
                this.setSpriteFrame(gameImgPath, sprite, cb);
            }
        }
    }

    /**
     * @description: 设置sprite显示本地散图
     * @param {string} path
     * @param {Sprite} sprite
     * @param {LoadCompleteCallback} cb
     * @return {*}
     */    
    public static setSpriteFrame<T extends Asset>(path: string, sprite: Sprite, cb?: LoadCompleteCallback<SpriteFrame|null>) {
        this.loadRes<SpriteFrame>('resources', `texture/${path}/spriteFrame`, SpriteFrame, (err, spriteFrame) => {
            if (err) {
                console.warn('set sprite frame failed! err:', path, err);
                if(cb){
                    cb(err, spriteFrame);
                }
                
                return;
            }

            if (sprite && isValid(sprite)) {
                // spriteFrame.addRef();
                sprite.spriteFrame = spriteFrame;
                sprite.spriteFrame.name = path;
                if(cb){
                    cb(err, spriteFrame);
                }
            }
        });
    }

    /**
     * @description: 设置sprite显示图集中的图片
     * @param {string} plistPath
     * @param {string} imgName
     * @param {Sprite} sprite
     * @return {*}
     */    
    public static setPlistSpriteFrame(plistPath:string, imgName:string, sprite:Sprite|null|undefined, cb?: LoadCompleteCallback<SpriteFrame|null>) {
        this.loadRes<SpriteAtlas>('resources', `texture/${plistPath}`, SpriteAtlas, (err, spriteAtlas) => {
            if (err) {
                console.warn('set sprite atlas failed! err:', plistPath, err);
                if(cb){
                    cb(err, null);
                }
                return;
            }

            
            if (sprite && isValid(sprite)) {

                //spriteAtlas.addRef();
                sprite.spriteAtlas = spriteAtlas;
                sprite.spriteFrame = spriteAtlas.getSpriteFrame(imgName);

                if(cb){
                    cb(err, sprite.spriteFrame);
                }
            }
        });
    }


    /**
     * @description: 设置sprite显示网络图片
     * @param {string} url
     * @param {Sprite} sprite
     * @param {LoadCompleteCallback} cb
     * @return {*}
     */    
    public static setRemoteImage(url: string, sprite: Sprite|null,  cb?: LoadCompleteCallback<SpriteFrame|null>) {
        if (!url || !url.startsWith('http')) {
            return;
        }

        if (!sprite) {
            return;
        }

        const _self = this;
        if (sprite.spriteFrame) {
            if (sprite.spriteFrame.name == url) {
                cb && cb(null, sprite.spriteFrame);
                return;
            }

            const oldSpriteUrl = sprite.spriteFrame.name;
            let oldSpriteData:RemoteSprite|null = _self.remoteSpriteList[oldSpriteUrl];
            if (oldSpriteData && oldSpriteData.spriteFrame && oldSpriteData.spriteFrame.isValid) {
                oldSpriteData.refCount--;
                sprite.spriteFrame = null
                // oldSpriteData.spriteFrame?.decRef();
            }
        }

       
        let newSpriteData:RemoteSprite|null = _self.remoteSpriteList[url];
        if (newSpriteData && newSpriteData.spriteFrame && newSpriteData.spriteFrame.isValid) {
            newSpriteData.refCount++;
            // newSpriteData.spriteFrame?.addRef();
            sprite.spriteFrame = newSpriteData.spriteFrame;
            cb && cb(null, sprite.spriteFrame);
            return;
        }

        
        assetManager.loadRemote(url, (err, imageAsset:ImageAsset) => {
            if (err) {
                console.warn('set remote image failed! err:', url, err);
                resourceUtil.setSpriteFrame("common/defaulthead", sprite, cb);
                // cb && cb(err, null);
                return;
            }

            if (!sprite || !isValid(sprite)) {
                return;
            }
       
            

            sprite.spriteFrame = SpriteFrame.createWithImage(imageAsset);
            sprite.spriteFrame.name = url;
            sprite.spriteFrame.texture.addRef();
            sprite.spriteFrame.addRef();
            const spriteData:RemoteSprite = {url: url, spriteFrame: sprite.spriteFrame, refCount:1};
            _self.remoteSpriteList[url] = spriteData;

            
            // sprite.spriteFrame.addRef();
            // console.log("++++", sprite.spriteFrame?.refCount, sprite.spriteFrame!)
            

            cb && cb(null, sprite.spriteFrame);
        });
    }

    /**
     * @description: 设置tiledMap资源
     * @param {string} mapName
     * @param {TiledMap} tiledMap
     * @return {*}
     */    
    public static setTiledMap(mapName:string, tiledMap?:TiledMap|undefined|null) {
        this.loadRes<TiledMapAsset>('map', mapName, TiledMapAsset, (err, asset) => {
            if (err) {
                console.warn('加载图资源失败! err:', mapName, err);
                
                return;
            }
            else if (tiledMap && isValid(tiledMap)) {
                tiledMap.tmxAsset = asset;
            }
        });
    }

}
