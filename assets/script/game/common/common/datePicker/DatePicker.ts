import { _decorator, Component, Node, Label, instantiate } from 'cc';
import { EventType, UIScrollSelect } from './UIScrollSelect';
const { ccclass, property } = _decorator;

type data = {
    y: number
    m: number
    d: number
}

type dateType = {
    key: number;
    data: dateType[];
}

@ccclass('DatePicker')
export class DatePicker extends Component {
    @property(UIScrollSelect)
    yearScrollSelect: UIScrollSelect = null;
    @property(UIScrollSelect)
    monthScrollSelect: UIScrollSelect = null;
    @property(UIScrollSelect)
    dayScrollSelect: UIScrollSelect = null;
    @property(Label)
    tmpLabel: Label = null;
    okCB: (data: data) => void;
    datexx: dateType[] = [];
    maxDay = 30;
    year = {
        total: 0,
        cur: 0,
        sel: 0,
    }
    month = {
        total: 0,
        cur: 0,
        sel: 0,
    }
    day = {
        total: 0,
        cur: 0,
        sel: 0,
    }
    start() {
        this.tmpLabel.node.active = false;
        let year = new Date().getFullYear();
        let month = new Date().getMonth() + 1;
        let day = new Date().getDate();

        this.year.total = year + 10;
        this.year.cur = year;
        this.year.sel = 0;

        this.month.total = 12;
        this.month.cur = month;
        this.month.sel = 0;

        this.day.total = 31;
        this.day.cur = day;
        this.day.sel = 0;

        this.day.total = this.calcDay();

        this.calcMaxDate();
        // this.year.max = date.year;
        // this.month.max = date.month;
        // this.day.max = date.day;

          
        // let n = 0;
        // for (let index = 0; index < n; index++) {
        //     let sel = this.day.sel + 1;
        //     if (sel > this.day.total) {
        //         if (this.month.sel + 1 > this.month.total) {
        //             this.year.sel++;
        //             this.month.sel = 1;
        //             this.day.sel = 1;
        //         } else {
        //             this.month.sel++;
        //             this.day.sel = 1;
        //         }
        //     } else {
        //         this.day.sel++;
        //     }
        // }

        this.updateYear();
        // this.updateMonth();
        // this.updateDay();
        // this.change(true);
    }

      
    calcMaxDate() {
        let yearxx: dateType[] = []

        let year = this.year.cur;
        let month = this.month.cur;
        let day = this.day.cur;
        for (let index = 0; index < this.maxDay; index++) {

            let maxDay = this.getMaxDay(year, month);
            if (day < maxDay) {
                day++;
            } else if (month < 12) {
                day = 1;
                month++;
            } else {
                day = 1;
                month = 1;
                year++;
            }

            let _year = yearxx.find(v => v.key == year);
            if (!_year) {
                _year = { key: year, data: [] };
                yearxx.push(_year);
            }

            let _month = _year.data.find(v => v.key == month);
            if (!_month) {
                _month = { key: month, data: [] };
                _year.data.push(_month);
            }

            let _day = _month.data.find(v => v.key == day);
            if (!_day) {
                _day = { key: day, data: [] };
                _month.data.push(_day);
            }

            // yearxx[year] = yearxx[year] ?? [];
            // yearxx[year][month] = yearxx[year][month] ?? [];
            // yearxx[year][month][day] = yearxx[year][month][day] ?? [];
        }
        // return { year, month, day };
        this.datexx = yearxx;
    }

    getMaxDay(year: number, month: number) {
        let maxDay = 0;
        if (month == 2) {
            if (year % 4 == 0) {
                maxDay = 29;
            } else {
                maxDay = 28;
            }
        } else {
            let xx = [31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
            maxDay = xx[month - 1];
        }
        return maxDay;
    }

    calcDay() {
        let totalDay = 0;
        if (this.month.sel == 2) {
            if (this.year.sel % 4 == 0) {
                totalDay = 29;
            } else {
                totalDay = 28;
            }
        } else {
            let xx = [31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
            totalDay = xx[this.month.sel - 1];
        }
        return totalDay;
    }

    init(okCB: (data: data) => void) {
        this.okCB = okCB;
    }

    update(deltaTime: number) {

    }

    updateYear() {
        let _year = this.datexx;
        let content = this.yearScrollSelect.content;
        content.destroyAllChildren();
        content.removeAllChildren();
        for (const year of _year) {
            let lab = instantiate(this.tmpLabel.node);
            lab.getComponent(Label).string = `${year.key}`;
            lab.active = true;
            content.addChild(lab);
        }
        this.yearScrollSelect.init(this.year.sel);
    }

    updateMonth() {
        let _year = this.datexx[this.year.sel];
        let _month = _year.data;
        let content = this.monthScrollSelect.content;
        content.destroyAllChildren();
        content.removeAllChildren();
        for (const month of _month) {
            let lab = instantiate(this.tmpLabel.node);
            lab.getComponent(Label).string = `${month.key}`;
            lab.active = true;
            content.addChild(lab);
        }
        this.monthScrollSelect.init(_month[this.month.sel] ? this.month.sel : 0);
    }

    updateDay() {
        let _year = this.datexx[this.year.sel];
        let _month = _year.data;
        let _day = (_month[this.month.sel] ?? _month[0]).data;
        let content = this.dayScrollSelect.content;
        content.destroyAllChildren();
        content.removeAllChildren();
        for (const day of _day) {
            let lab = instantiate(this.tmpLabel.node);
            lab.getComponent(Label).string = `${day.key}`;
            lab.active = true;
            content.addChild(lab);
        }
        this.dayScrollSelect.init(_day[this.day.sel] ? this.day.sel : 0);
    }

    yearSelectEvent(data: { target: UIScrollSelect, type: EventType, index: number }) {
        if (data.type != EventType.SCROLL_END) {
            return;
        }
        this.year.sel = data.index;

        this.updateMonth();
    }

    monthSelectEvent(data: { target: UIScrollSelect, type: EventType, index: number }) {
        if (data.type != EventType.SCROLL_END) {
            return;
        }
        this.month.sel = data.index;

        this.updateDay();
    }
    daySelectEvent(data: { target: UIScrollSelect, type: EventType, index: number }) {
        if (data.type != EventType.SCROLL_END) {
            return;
        }
        this.day.sel = data.index;
    }

    btnClose() {
        let _year = this.datexx[this.year.sel];
        let _month = _year.data;
        let _day = (_month[this.month.sel] ?? _month[0]).data;

        let y = _year.key;
        let m = _month[this.month.sel].key;
        let d = _day[this.day.sel].key;
        this.okCB && this.okCB({
            y: y,
            m: m,
            d: d,
        });
        this.node.active = false;
    }
}

