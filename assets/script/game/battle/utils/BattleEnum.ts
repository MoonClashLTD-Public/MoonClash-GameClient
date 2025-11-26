export enum BattlePrefabs {
    BattleAudio = 'battleAudio',   
    Flighter = 'flighter',   
    BattleCards = 'battleCards',   
    BattleInfo = 'battleInfo',   
    BattleWatcherInfo = 'battleWatcherInfo',   
    BattleBornTime = 'battleBornTime',   
    BattleDieEffect = 'battleDieEffect',   
    BattleBornEffect = 'battleBornEffect',   
    BattleBornCost = 'battleBornCost',   
}

export enum FlighterAnimType {
    NONE = 'none',
    IDLE = 'idle',
    JUMPING = 'jump',
    RUSH = 'rush',
    RUN = 'run',
    PROTECT = 'protect',
    GUARD = 'guard',
    ATTACK = 'attack',
    DIE = 'die',   
}

export enum BattlePowerType {
    NONE = 0,
      
    NORMAL,
      
    DOUBLE,
}
export enum BattleTimeType {
    NONE = 0,
      
    TIME120,
    TIME60,
    TIME30,
}

  
export enum BattleEvent {
      
    ENTER = "BattleEnter",
      
    QUIT = "BattleQuit",
      
    REDTOWERREDUCE = "BattleRedTowerReduce",
      
    BLUETOWERREDUCE = "BattleBlueTowerReduce",
}

export type BattleTowerType = {
    leftTower: number   
    rightTower: number   
    centerTower: number   
    dieFId: number   
}