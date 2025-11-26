import { Asset, error, instantiate, Prefab, SpriteFrame } from "cc";
import { resLoader } from "../../core/common/loader/ResLoader";
import { CardInfoPrefab } from "../common/common/CardInfoPrefab";
import { EquipmentInfoPrefab } from "../common/equipment/EquipmentInfoPrefab";
import TableJobs from "../common/table/TableJobs";
import TableNfts from "../common/table/TableNfts";

export class ResManger {
    static #instance: ResManger;
    public static getInstance(): ResManger {
        if (!ResManger.#instance) {
            ResManger.#instance = new ResManger();
        }
        return ResManger.#instance;
    }
    resPath: string = 'gameRes';

    loadRes<T extends Asset>(resPath: string) {
        return new Promise<T>((resolve: (value: T) => void) => {
            resLoader.load<T>(resPath, (err: Error | null, data: T) => {
                if (err) {
                    error(err);
                    resolve(null);
                    return;
                }
                resolve(data);
            })
        })
    }

      
    async getCardAttrSpriteFrame(resName: string) {
        let path = `${this.resPath}/cards/attrs/${resName}/spriteFrame`;
        let res = resLoader.get(path, SpriteFrame);
        if (!res) {
            res = await this.loadRes<SpriteFrame>(path);
        }
        return res;
    }

      
    async getCardAttr1SpriteFrame(resName: string) {
        let path = `${this.resPath}/cards/attrs1/${resName}/spriteFrame`;
        let res = resLoader.get(path, SpriteFrame);
        if (!res) {
            res = await this.loadRes<SpriteFrame>(path);
        }
        return res;
    }

      
    async getCardJobSpriteFrame(jobId: number) {
        let resName = TableJobs.getInfoById(jobId).res_name;
        let path = `${this.resPath}/cards/jobs/${resName}/spriteFrame`;
        let res = resLoader.get(path, SpriteFrame);
        if (!res) {
            res = await this.loadRes<SpriteFrame>(path);
        }
        return res;
    }

      
    async getIconSpriteFrame(nftId: number) {
        let nft = TableNfts.getInfoById(nftId);
        let path = '';
        if (!nft) {
            error("not nft cfg nftId", nftId);
        } else if (nft.nft_type == core.NftType.NftTypeCard) {
            path = `${this.resPath}/cards/${nft.res_name}/spriteFrame`;
        } else if (nft.nft_type == core.NftType.NftTypeEquipment) {
            path = `${this.resPath}/equipments/${nft.res_name}/spriteFrame`;
        } else if (nft.nft_type == core.NftType.NftTypeItem) {
            path = `${this.resPath}/items/${nft.res_name}/spriteFrame`;
        } else if (nft.nft_type == core.NftType.NftTypeBox) {
            path = `${this.resPath}/items/${nft.res_name}/spriteFrame`;
        }
        let res = resLoader.get(path, SpriteFrame);
        if (!res) {
            res = await this.loadRes<SpriteFrame>(path);
        }
        return res;
    }

      
    async getCardPrefab() {
        let path = 'common/prefab/cardPrefab/cardPrefab';
        let res = resLoader.get(path, Prefab)
        if (!res) {
            res = await this.loadRes<Prefab>(path);
        }
        return res
    }

      
    async getCardInfoPopPrefab() {
        let path = 'common/prefab/cardPrefab/cardInfoPrefab';
        let res = resLoader.get(path, Prefab)
        if (!res) {
            res = await this.loadRes<Prefab>(path);
        }
        const cardPop = instantiate(res).getComponent(CardInfoPrefab)
        return cardPop
    }

      
    async getEquipPrefab() {
        let path = 'common/prefab/equipment/equipPrefab';
        let res = resLoader.get(path, Prefab)
        if (!res) {
            res = await this.loadRes<Prefab>(path);
        }
        return res
    }

      
    async getEquipInfoPrefab() {
        let path = 'common/prefab/equipment/equipInfoPrefab';
        let res = resLoader.get(path, Prefab)
        if (!res) {
            res = await this.loadRes<Prefab>(path);
        }
        const cardPop = instantiate(res).getComponent(EquipmentInfoPrefab)
        return cardPop
    }

      
    async getEquipIconSpriteFrame(res_name: string | number) {
        let path = '';
        if (res_name) {
            path = `${this.resPath}/equipments/${res_name}/spriteFrame`;
        } else {
            error("not equip equipRarity ", res_name);
        }
        let res = resLoader.get(path, SpriteFrame);
        if (!res) {
            res = await this.loadRes<SpriteFrame>(path);
        }
        return res;
    }

}

export let AudioSoundRes = {
    commonClick: 'audios/',
    clickGetCard: 'audios/blindBox/',
    clickGetEquip: 'audios/blindBox/',
    clickMatch: 'audios/',
    matchSucc: 'audios/',
    battleStart: 'audios/',   
    battleWin: 'audios/battle/',   
    battleFail: 'audios/battle/',   
    battleOne: 'audios/battle/',
    battleTwo: 'audios/battle/',
    battleThree: 'audios/battle/',
    equipFix: 'audios/equip/',
    equipRecast: 'audios/equip/',
    equipComposite: 'audios/equip/',
    equipCleanUp: 'audios/equip/',
    cardLevelUp: 'audios/card/',
    cardReset: 'audios/card/',
    cardCleanUp: 'audios/card/',
    cardRecover: 'audios/card/',
}
export let AudioMusicRes = {
    home: 'audios/',
    blindBox: 'audios/',
    battleSingle: 'audios/battle/',
    battleDouble: 'audios/battle/',
    battleOvertime: 'audios/battle/',
    battleOver: 'audios/battle/',   
}