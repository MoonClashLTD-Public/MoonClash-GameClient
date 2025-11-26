  

  
export class RandomManager {
    private static _instance: RandomManager;
    public static get instance(): RandomManager {
        if (this._instance == null) {
            this._instance = new RandomManager();
        }
        return this._instance;
    }

    // constructor() {
    //     this.setSeed(1);

    //     for (let index = 0; index < 10; index++) {
    //         console.log(this.getRandomInt(0, 100));
    //     }

    //     var a = this.getRandomByMinMaxList(50, 100, 5)
      

    //     var b = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    //     var r = this.getRandomByObjectList(b, 5);
      
      

    //     var c = this.getRandomBySumList(5, -100,);
      
    // }

    private seedrandom!: any;
    private getRandom(): number {
        if (this.seedrandom)
            return this.seedrandom.quick();

        return Math.random();
    }

      
    setSeed(seed: number) {
        //@ts-ignore
        this.seedrandom = new Math.seedrandom(seed);
    }

    /**
       
  
  
  
     */
    getRandomInt(min: number, max: number, type: number = 2): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        switch (type) {
            case 1:   
                return Math.floor(this.getRandom() * (max - min)) + min;
            case 2:   
                return Math.floor(this.getRandom() * (max - min + 1)) + min;
            case 3:   
                return Math.floor(this.getRandom() * (max - min - 1)) + min + 1;
        }
        return 0;
    }

    /**
       
  
  
  
  
     * @returns 
     */
    getRandomByMinMaxList(min: number, max: number, n: number, type: number = 2): Array<number> {
        var result: Array<number> = [];
        for (let i = 0; i < n; i++) {
            result.push(this.getRandomInt(min, max))
        }
        return result;
    }

    /**
       
  
  
     * @returns 
     */
    getRandomByObjectList<T>(objects: Array<T>, n: number): Array<T> {
        var temp: Array<T> = objects.slice();
        var result: Array<T> = [];
        for (let i = 0; i < n; i++) {
            let index = this.getRandomInt(0, n, 1);
            result.push(temp.splice(index, 1)[0]);
        }
        return result;
    }

    /**
       
  
  
     * @returns 
     */
    getRandomBySumList(n: number, sum: number) {
        var residue = sum;
        var value = 0;
        var result: Array<number> = [];
        for (let i = 0; i < n; i++) {
            value = this.getRandomInt(0, residue, 3);
            if (i == n - 1) {
                value = residue;
            }
            else {
                residue -= value;
            }
            result.push(value);
        }
        return result;
    }
}
