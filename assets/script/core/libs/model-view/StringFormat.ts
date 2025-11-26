/**
 *        ,               
 *       
 * 1:def(0)  
 */
class StringFormat {
    deal(value: number | string, format: string): string {
        if (format === '') return value as string;

        format = format.toLowerCase().trim();                 
        let match_func = format.match(/^[a-z|A-Z]+/gi);       
        let match_num = format.match(/\d+$/gi);               
        let func: string = '';
        let num: number = 0;
        let res: number | string = '';

        if (match_func) func = match_func[0];
        if (match_num) num = parseInt(match_num[0]);

        if (typeof value == 'number') {
            switch (func) {
                case 'int': res = this.int(value); break;
                case 'fix': res = this.fix(value, num); break;
                case 'kmbt': res = this.KMBT(value); break;
                case 'per': res = this.per(value, num); break;
                case 'sep': res = this.sep(value); break;

                default:
                    break;
            }

        }
        else {
            switch (func) {
                case 'limit': res = this.limit(value, num); break;

                default:
                    break;
            }
            res = value;
        }

        return res as string;
    }

      
    private sep(value: number) {
        let num = Math.round(value).toString();
        return num.replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
    }

      
    private time_m(value: number) {
        //todo
    }

      
    private time_s(value: number) {
        //todo
    }

      
    private time_ms(value: number) {
        //todo
    }

      
    private timeStamp(value: number) {
        //todo
        return new Date(value).toString()
    }

      
    private per(value: number, fd: number) {
        return Math.round(value * 100).toFixed(fd);
    }

      
    private int(value: number) {
        return Math.round(value);
    }

      
    private fix(value: number, fd: number) {
        return value.toFixed(fd)
    }

      
    private limit(value: string, count: number) {
        return value.substring(0, count);
    }

      
    private KMBT(value: number, lang: string = 'en') {
          
        let counts = [1000, 1000000, 1000000000, 1000000000000];
        let units = ['', 'K', 'M', 'B', 'T'];

        switch (lang) {
            case 'zh':
                  
                let counts = [10000, 100000000, 1000000000000, 10000000000000000];
                let units = ['', ' ', ' ', ' ', ' '];
                break;

            default:
                break;
        }

        return this.compressUnit(value, counts, units, 2);
    }

      
    private compressUnit(value: any, valueArr: number[], unitArr: string[], fixNum: number = 2): string {
        let counts = valueArr;
        let units = unitArr;
        let res: string = "";
        let index;
        for (index = 0; index < counts.length; index++) {
            const e = counts[index];
            if (value < e) {
                if (index > 0) {
                    res = (value / counts[index - 1]).toFixed(fixNum);
                }
                else {
                    res = value.toFixed(0);
                }
                break;
            }

        }
        return res + units[index];
    }
}

  
export let StringFormatFunction = new StringFormat();