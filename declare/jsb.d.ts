declare module jsb {
    export class Device {
        static setKeepScreenOn(b: boolean): void
    }
    export function copyTextToClipboard(str: string): void
}