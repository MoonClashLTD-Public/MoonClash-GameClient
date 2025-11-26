/*
 * @Author: dgflash
 * @Date: 2021-08-11 16:41:12
 * @LastEditors: dgflash
 * @LastEditTime: 2022-01-24 15:00:52
 */
/**
   
 */
export default class ArrayUtil {
      
    public static noRepeated(arr: any[]) {
        var res = [arr[0]];
        for (var i = 1; i < arr.length; i++) {
            var repeat = false;
            for (var j = 0; j < res.length; j++) {
                if (arr[i] == res[j]) {
                    repeat = true;
                    break;
                }
            }

            if (!repeat) {
                res.push(arr[i]);
            }
        }
        return res;
    }

    /**
       
  
     */
    public static copy2DArray(array: any[][]): any[][] {
        let newArray: any[][] = [];
        for (let i = 0; i < array.length; i++) {
            newArray.push(array[i].concat());
        }
        return newArray;
    }

    /**
  
  
     */
    public static fisherYatesShuffle(array: any[]): any[] {
        let count = array.length;
        while (count) {
            let index = Math.floor(Math.random() * count--);
            let temp = array[count];
            array[count] = array[index];
            array[index] = temp;
        }
        return array;
    }

    /**
       
  
     */
    public static confound(array: []): any[] {
        let result = array.slice().sort(() => Math.random() - .5);
        return result;
    }

    /**
       
  
     */
    public static flattening(array: any[]) {
        for (; array.some(v => Array.isArray(v));) {      
            array = [].concat.apply([], array);   
        }
        return array;
    }

      
    public static removeItem(array: any[], item: any) {
        var temp = array.concat();
        for (let i = 0; i < temp.length; i++) {
            const value = temp[i];
            if (item == value) {
                array.splice(i, 1);
                break;
            }
        }
    }

    /**
       
  
  
     */
    public static combineArrays(array1: any[], array2: any[]): any[] {
        let newArray = [...array1, ...array2];
        return newArray;
    }

    /**
       
  
     */
    public static getRandomValueInArray(array: any[]): any {
        let newArray = array[Math.floor(Math.random() * array.length)];
        return newArray;
    }
}
