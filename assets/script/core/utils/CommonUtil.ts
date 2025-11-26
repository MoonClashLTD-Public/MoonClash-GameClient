import { Button, Color, Component, EventHandler, Graphics, ITweenOption, Node, sys, Tween, tween, UITransform, v2, v3, Vec2, Vec3 } from "cc";
import { QRCode } from "../libs/qrcode/QRCode";
import { QRErrorCorrectLevel } from "../libs/qrcode/QRConst";
import { PlatformUtil } from "./PlatformUtil";

class CommonUtils {
    /**
       
     * @param seconds 
     */
    wait(seconds: number): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(null);
            }, seconds * 1000);
        });
    }

    /**
       
     */
    waitCmpt(cmpt: Component, seconds: number): Promise<void> {
        return new Promise((resolve, reject) => {
            cmpt.scheduleOnce(() => {
                resolve();
            }, seconds);
        });
    }

      
    prefixInteger(num, length) {
        return (Array(length).join('0') + num).slice(-length);
    }
    /**
       
     * @param {Node} target
     * @param {number} duration
  
  
  
     * @param opts
     * @returns {ITweenOption}
     */
    bezierTo(target: Node, duration: number, c1: Vec2, c2: Vec2, to: Vec3, opts: ITweenOption) {
        opts = opts || Object.create(null);
        /**
  
  
  
  
  
         * @returns {ITweenOption}
         */
        let twoBezier = (t: number, p1: Vec2, cp: Vec2, p2: Vec3) => {
            let x = (1 - t) * (1 - t) * p1.x + 2 * t * (1 - t) * cp.x + t * t * p2.x;
            let y = (1 - t) * (1 - t) * p1.y + 2 * t * (1 - t) * cp.y + t * t * p2.y;
            return v3(x, y, 0);
        };
        opts.onUpdate = (arg: Vec3, ratio: number) => {
            target.setPosition(twoBezier(ratio, c1, c2, to));
        };
        return tween(target).to(duration, {}, opts);
    }

    async getMaxSpeedUrl(urls: string[]): Promise<string> {
        let testSpeed = (url: string) => {
            return new Promise<string>((resolve) => {
                let timeOut = setTimeout(resolve, 10000);

                let finishCB = () => {
                    clearTimeout(timeOut);
                    resolve(url);
                }


                let xhr = new XMLHttpRequest();
                xhr.open("GET", url + "/ping");
                xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
                  
                xhr.ontimeout = () => {
                    // errFun();
                }
                xhr.onloadend = (a) => {
                    if (xhr.status == 500) {
                          
                        // errFun();
                    }
                }
                xhr.onerror = () => {
                    if (xhr.readyState == 0 || xhr.readyState == 1 || xhr.status == 0) {
                          
                    } else {
                          
                    }

                };
                xhr.onreadystatechange = () => {
                    if (xhr.readyState != 4) return;
                    if (xhr.status == 200) {
                        finishCB();
                    } else if (xhr.status != 0) {
                        // errFun();
                    }
                };
                xhr.send();
            })
        }
        let promises: Promise<string>[] = []
        urls.forEach(e => promises.push(testSpeed(e)));
        let res = await Promise.race(promises);   
        return res;
    }

    async getMaxSpeedWs(urls: string[]): Promise<string> {
        let _urls: string[] = [];
        for (let index = 0; index < urls.length; index++) {
            let url = urls[index];
            if (url.startsWith("wss:")) {
                _urls.push("https:" + url.substring(4, url.length))
            } else if (url.startsWith("ws:")) {
                _urls.push("http:" + url.substring(3, url.length))
            }
        }
        let res = await this.getMaxSpeedUrl(_urls);
        return urls[_urls.findIndex(v => v == res)];
        // let testSpeed = (url: string) => {
        //     return new Promise<string>((resolve) => {
        //         let timeOut = setTimeout(() => {
        //             ws.close();
        //             resolve("");
        //         }, 10000)

        //         let cb = () => {
        //             clearTimeout(timeOut);
        //             resolve(url);
        //         }

          
        //         let ws = new WebSocket(url);
        //         ws.binaryType = "arraybuffer";
          
          
        //         ws.onopen = function () {
          
          
          
          
        //             ws.close();
        //             cb();
        //         }
          
        //         ws.onmessage = function (data) {
          
        //             // console.log(data);
          
        //             // ws.close();
          
        //         }
          
        //         ws.onclose = function () {
          
          
        //         }
          
        //         ws.onerror = function (error) {
        //             // console.log(error);
        //             cb();
        //         }
          
        //     })
        // }
        // let promises: Promise<string>[] = []
        // urls.forEach(e => promises.push(testSpeed(e)));
          
        // return res;
    }

    /**
     * 
  
  
     */
    shakeEffect(node: Node, duration: number) {
        let defPos = node.getPosition();
        Tween.stopAllByTarget(node);
        tween(node).repeatForever(
            tween(node)
                .to(0.02, { position: new Vec3(5, 7, 0) })
                .to(0.02, { position: new Vec3(-6, 7, 0) })
                .to(0.02, { position: new Vec3(-13, 3, 0) })
                .to(0.02, { position: new Vec3(3, -6, 0) })
                .to(0.02, { position: new Vec3(-5, 5, 0) })
                .to(0.02, { position: new Vec3(2, -8, 0) })
                .to(0.02, { position: new Vec3(-8, -10, 0) })
                .to(0.02, { position: new Vec3(3, 10, 0) })
                .to(0.02, { position: new Vec3(0, 0, 0) })
        ).start();

        tween(node)
            .delay(duration)
            .call(() => {
                Tween.stopAllByTarget(node);
                node.setPosition(defPos);
            })
            .start();
    }

      
    setChildrenNodeSortByZIndex(parent: Node, sort: (a: Node, b: Node) => number): void {
        if (!parent) {
            return;
        }

        let children = parent.children.concat();
        children.sort(sort)
        let maxIndex = children.length;
        for (const node of children) {
            node.setSiblingIndex(maxIndex);
        }
    }
      
    public countDownDays(t: number) {   
        var d = Math.floor(t / 60 / 60 / 24);
        var h = Math.floor(t / 60 / 60 % 24);
        var m = Math.floor(t / 60 % 60);
        var s = Math.floor(t % 60);

        return {
            d: d,   
            h: h,   
            m: m,   
            s: s,   
        }
    }
      
    public countDownHours(t: number) {   
        var h = Math.floor(t / 60 / 60);
        var m = Math.floor(t / 60 % 60);
        var s = Math.floor(t % 60);
        var hstr = ''
        var mstr = ''
        var sstr = ''
        h < 10 ? hstr = `0${h}` : hstr = `${h}`
        m < 10 ? mstr = `0${m}` : mstr = `${m}`
        s < 10 ? sstr = `0${s}` : sstr = `${s}`
        return {
            h: hstr,   
            m: mstr,   
            s: sstr,   
        }
    }

    /** 
      
      
  
  
      
  
  
  
  
  
  
  
  
  
    * @return String
    * @author adswads@gmail.com
    */
    dateFormat(date?: any, format?: string): string {
          
        if (date == undefined && format == undefined) {
            date = new Date();
            format = "yyyy-MM-dd HH:mm:ss";
        }
          
        else if (typeof (date) == "string") {
            format = date;
            date = new Date();
        }
          
        else if (format === undefined) {
            format = "yyyy-MM-dd HH:mm:ss";
        }
        else { }
          

        var map = {
            "y": date.getFullYear() + "",  
            "M": date.getMonth() + 1 + "",   
            "d": date.getDate() + "",   
            "H": date.getHours(),   
            "m": date.getMinutes() + "",   
            "s": date.getSeconds() + "",   
            "q": Math.floor((date.getMonth() + 3) / 3) + "",   
            "f": date.getMilliseconds() + ""   
        };
          
        if (map["H"] > 12) { map["h"] = map["H"] - 12 + ""; }
        else { map["h"] = map["H"] + ""; }
        map["H"] += "";

        var reg = "yMdHhmsqf";
        var all = "", str = "";
        for (var i = 0, n = 0; i < reg.length; i++) {
            n = format.indexOf(reg[i]);
            if (n < 0) { continue; }
            all = "";
            for (; n < format.length; n++) {
                if (format[n] != reg[i]) {
                    break;
                }
                all += reg[i];
            }
            if (all.length > 0) {
                if (all.length == map[reg[i]].length) {
                    str = map[reg[i]];
                }
                else if (all.length > map[reg[i]].length) {
                    if (reg[i] == "f") {
                        str = map[reg[i]] + this.charString("0", all.length - map[reg[i]].length);
                    }
                    else {
                        str = this.charString("0", all.length - map[reg[i]].length) + map[reg[i]];
                    }
                }
                else {
                    switch (reg[i]) {
                        case "y": str = map[reg[i]].substr(map[reg[i]].length - all.length); break;
                        case "f": str = map[reg[i]].substr(0, all.length); break;
                        default: str = map[reg[i]]; break;
                    }
                }
                format = format.replace(all, str);
            }
        }
        return format;
    }

    /**
      
  
  
    * @return String
    * @author adswads@gmail.com
    */
    charString(char: string, count: number): string {
        var str: string = "";
        while (count--) {
            str += char;
        }
        return str;
    }

      
    addClickTouch(addNode: Node, target: Node, handlerName: string, componentName: string, params?: { customEventData?: string }) {
        let a = new EventHandler();
        a.target = target
        a.handler = handlerName
        a.component = componentName
        a.customEventData = params?.customEventData || ''
        const btm = addNode.getComponent(Button)
        if (btm) {
            btm.clickEvents.push(a);
        } else {
            addNode.addComponent(Button).clickEvents.push(a)
        }
    }

      
    drawQRCode(ctx: Graphics, info: string) {
        var qrcode = new QRCode(-1, QRErrorCorrectLevel.H);
        qrcode.addData(info);
        qrcode.make();

        // var ctx = this.qrcodeNode.getComponent(Graphics) ?? this.qrcodeNode.addComponent(Graphics);

        // compute tileW/tileH based on node width and height
        let uiProps = ctx.node.getComponent(UITransform);
        var tileW = uiProps.width / qrcode.getModuleCount();
        var tileH = uiProps.height / qrcode.getModuleCount();

        // draw in the Graphics
        for (var row = 0; row < qrcode.getModuleCount(); row++) {
            for (var col = 0; col < qrcode.getModuleCount(); col++) {
                // ctx.fillStyle = qrcode.isDark(row, col) ? options.foreground : options.background;
                if (qrcode.isDark(row, col)) {
                    ctx.fillColor = Color.BLACK;
                } else {
                    ctx.fillColor = Color.WHITE;
                }
                var w = (Math.ceil((col + 1) * tileW) - Math.floor(col * tileW));
                var h = (Math.ceil((row + 1) * tileW) - Math.floor(row * tileW));
                ctx.rect(Math.round(col * tileW), Math.round(row * tileH), w, h);
                ctx.fill();
            }
        }
    }

    private async copyWebClipboard(content: string) {
        //@ts-ignore
        const res = await navigator.permissions.query({ name: 'clipboard-write' });
        if (res.state === 'granted') {
            return navigator.clipboard.writeText(content);
        }

        return Promise.reject(res);
    }

      
    copyToClipboard(str: string) {
        if (PlatformUtil.isNativeAndroid()) {
            jsb.copyTextToClipboard(str);
        } else if (PlatformUtil.isNativeIOS()) {
            jsb.copyTextToClipboard(str);
        } else if (sys.isBrowser) {
            this.copyWebClipboard(str);
        }
        console.log('copyToClipboard:', str);
    }

      
    humpToUnderline(data) {
        if (typeof data !== 'object' || !data) return data
        if (Array.isArray(data)) {
            return data.map((item) => this.humpToUnderline(item))
        }

        let newObj = {}
        for (let key in data) {
            let newKey = key.replace(/([A-Z])/g, (res) => {
                return '_' + res.toLowerCase()
            })
            newObj[newKey] = this.humpToUnderline(data[key])
        }
        return newObj
    }

      
    underlineToHump(data) {
        if (typeof data !== 'object' || !data) return data
        if (Array.isArray(data)) {
            return data.map(item => this.underlineToHump(item))
        }

        let newObj = {}
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                let newKey = key.replace(/_([a-z])/g, res => res[1].toUpperCase())
                newObj[newKey] = this.underlineToHump(data[key])
            }
        }
        return newObj
    }

    /**
       
     * @param startPos
     * @param targetPos 
     * @returns 
     */
    calcAngle(startPos?: Vec3, targetPos?: Vec3) {
        let normalize: Vec3 = targetPos.clone().subtract(startPos).normalize();
          
        let angle = v2(0, 1).signAngle(v2(normalize.x, normalize.y)) * 180 / Math.PI;
        return angle;
    }

    /**
       
  
  
     * @returns 
     */
    findHypotenuse(base: number, perpendicular: number) {
        const bSquare = base ** 2;
        const pSquare = perpendicular ** 2;
        const sum = bSquare + pSquare;
        const hypotenuse = Math.sqrt(sum);
        return hypotenuse;
    }

    /**
       
  
  
     */
    getCenterPoint(points: Vec3[] = []) {
        let center = v3();
        let len = points.length;
        if (len > 1) {
            let x = 0,
                y = 0,
                z = 0;

            points.forEach(point => {
                x += point.x;
                y += point.y;
                z += point.z;
            });

            center.x = x / len;
            center.y = y / len;
            center.z = z / len;
        } else {
            return points[0];
        }

        return center;
    }

    private _enteriInt = Math.pow(10, 18);
    private _gweiInt = Math.pow(10, 9);

      
    fightPowerToShow(power: number) {
        return new BigNumber(power).div(10000).toFixed(1, 1)
    }
      
    fightPowershowToNumber(power: number) {
        return new BigNumber(power).times(10000).toFixed(0)
    }
      
    gweiToNum(price: string) {
        if (!price || price == '0') return '0'
        return new BigNumber(price).div(this._gweiInt).toFixed(2, 1);
    }
      
    weiToEtherStr(price: string, digit = 5) {
        let p = CommonUtil.weiToEther(price).toFixed();
        let d = p.split(".");
        if (d[1]) {
            d[1] = d[1].substring(0, digit);
            p = d[0] + "." + d[1];
        }
        // let min = "0.00001";
        // if (new BigNumber(p).lt(min)) {
        //     p = min; // 0
        // }
        return p;
    }
      
    gweiToEther(price: string) {
        return new BigNumber(price).div(this._gweiInt);
    }
      
    weiToEther(price: string) {
        return new BigNumber(price).div(this._enteriInt);
    }
      
    etherToWei(price: string) {
        return new BigNumber(price).times(this._enteriInt);
    }
      
    numToGwei(price: string) {
        return new BigNumber(price).times(this._gweiInt);
    }

      
    getBytesLength(str) {
          
        return str.replace(/[^\x00-\xff]/g, 'xx').length;
    }

      
    nickNamePrefixLimit(name: string) {
        let prefix = name.substring(0, 1);
        let re = /[a-zA-Z\u4e00-\u9fa5]+/;
        return re.test(prefix);
    }
}

export let CommonUtil = new CommonUtils()