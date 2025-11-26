export abstract class DataBase {
    abstract init();
    abstract updData(): Promise<boolean>;

    abstract destory();

    abstract addEvent();
    abstract removeEvent();
}