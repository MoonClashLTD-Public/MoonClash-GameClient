import { Color, Texture2D } from "cc";

/**
   
 */
export default class ImageUtil {
    /**
       
  
  
  
     * @example
     *   
     * const color = ImageUtil.getPixelColor(texture, 1, 1);
     * // cc.color(50, 100, 123, 255);
     */
    public static getPixelColor(texture: Texture2D, x: number, y: number): Color {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = texture.width;
        canvas.height = texture.height;
        const image = texture.getHtmlElementObj()!;
        ctx.drawImage(image, 0, 0, texture.width, texture.height);
        const imageData = ctx.getImageData(0, 0, texture.width, texture.height);
        const pixelIndex = ((y - 1) * texture.width * 4) + (x - 1) * 4;
        const pixelData = imageData.data.slice(pixelIndex, pixelIndex + 4);
        const color = new Color(pixelData[0], pixelData[1], pixelData[2], pixelData[3]);
        image.remove();
        canvas.remove();
        return color;
    }

    /**
       
  
  
     */
    public static imageToBase64(url: string, callback?: (dataURL: string) => void): Promise<string> {
        return new Promise(res => {
            let extname = /\.png|\.jpg|\.jpeg/.exec(url)?.[0];
            if (['.png', '.jpg', '.jpeg'].includes(extname)) {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d')!;
                const image = new Image();
                image.src = url;
                image.onload = () => {
                    canvas.height = image.height;
                    canvas.width = image.width;
                    ctx.drawImage(image, 0, 0);
                    extname = extname === '.jpg' ? 'jpeg' : extname!.replace('.', '');
                    const dataURL = canvas.toDataURL(`image/${extname}`);
                    callback && callback(dataURL);
                    res(dataURL);
                    image.remove();
                    canvas.remove();
                }
            }
            else {
                console.warn('Not a jpg/jpeg or png resource!');
                callback && callback("");
                res("");
            }
        });
    }

    /**
       
  
     */
    public static base64ToTexture(base64: string): Texture2D {
        const image = document.createElement('img');
        image.src = base64;
        const texture = new Texture2D();
        texture.initWithElement(image);
        image.remove();
        return texture;
    }

    /**
       
  
     */
    public static base64ToBlob(base64: string): Blob {
        const strings = base64.split(',');
        const type = /image\/\w+|;/.exec(strings[0])[0];
        const data = window.atob(strings[1]);
        const arrayBuffer = new ArrayBuffer(data.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < data.length; i++) {
            uint8Array[i] = data.charCodeAt(i) & 0xff;
        }
        return new Blob([uint8Array], { type: type });
    }
}
