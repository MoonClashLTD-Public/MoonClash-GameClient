import { Vec3 } from "cc";

/*
 * @Author: dgflash
 * @Date: 2021-08-11 16:41:12
 * @LastEditors: H.Joeson
 * @LastEditTime: 2021-09-14 10:54:02
 */
export class StringUtil {
    /** 123456789 = 123,456,789 */
    public static numberTotPermil(num: number): string {
        return num.toLocaleString();
    }

    /** 12345 = 12.35K */
    public static numberToThousand(value: number, fixed: number = 2): string {
        var k = 1000;
        var sizes = ['', 'K', 'M', 'G'];
        if (value < k) {
            return value.toString();
        }
        else {
            var i = Math.floor(Math.log(value) / Math.log(k));
            var r = ((value / Math.pow(k, i)));
            return r.toFixed(fixed) + sizes[i];
        }
    }

      
    public static numberToTenThousand(value: number, fixed: number = 2): string {
        var k = 10000;
        var sizes = ['', '', '', ''];
        if (value < k) {
            return value.toString();
        }
        else {
            var i = Math.floor(Math.log(value) / Math.log(k));
            return ((value / Math.pow(k, i))).toFixed(fixed) + sizes[i];
        }
    }

    /** yyyy-MM-dd hh:mm:ss S */
    public static format(date: Date, fmt: string) {
        var o: any = {
            "M+": date.getMonth() + 1,                     
            "d+": date.getDate(),                          
            "h+": date.getHours(),                         
            "m+": date.getMinutes(),                       
            "s+": date.getSeconds(),                       
            "q+": Math.floor((date.getMonth() + 3) / 3),   
            "S": date.getMilliseconds()                    
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    }

      
    public static stringToArray1(str: string) {
        if (str == "") {
            return [];
        }
        return str.split(",");
    }

      
    public static stringToArray2(str: string) {
        if (str == "") {
            return [];
        }
        return str.split("|");
    }

      
    public static stringToArray3(str: string) {
        if (str == "") {
            return [];
        }
        return str.split(":");
    }

      
    public static stringToArray4(str: string) {
        if (str == "") {
            return [];
        }
        return str.split(";");
    }

      
    public static sub(str: string, n: number, showdot: boolean = false) {
        var r = /[^\x00-\xff]/g;
        if (str.replace(r, "mm").length <= n) { return str; }
        var m = Math.floor(n / 2);
        for (var i = m; i < str.length; i++) {
            if (str.substr(0, i).replace(r, "mm").length >= n) {
                if (showdot) {
                    return str.substr(0, i) + "...";
                } else {
                    return str.substr(0, i);
                }
            }
        }
        return str;
    }

      
    public static stringLen(str: string) {
          
          
        var realLength = 0, len = str.length, charCode = -1;
        for (var i = 0; i < len; i++) {
            charCode = str.charCodeAt(i);
            if (charCode >= 0 && charCode <= 128)
                realLength += 1;
            else
                realLength += 2;
        }
        return realLength;
    }
}
