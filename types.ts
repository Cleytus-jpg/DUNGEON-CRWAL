
export enum GameStatus {
    STOPPED = 'STOPPED',
    RUNNING = 'RUNNING',
    PAUSED = 'PAUSED',
    GAME_OVER = 'GAME_OVER',
}

export enum AINature {
    NONE = 'NONE',
    ASSIST = 'ASSIST',
    AUTO = 'AUTO',
}

export type Farmer = {
    x: number;
    y: number;
    size: number;
    health: number;
    maxHealth: number;
    speed: number;
    invulnerable: boolean;
    invulnerableTime: number;
};

export type Companion = Farmer & {
    lastFireTime: number;
    currentTool: string;
};

export type WaterDroplet = {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    damage: number;
    color: string;
    ammoType: string;
    exploded?: boolean;
    piercedEnemies?: number[];
};

export type Pest = {
    id: number;
    x: number;
    y: number;
    type: 'weed' | 'bug' | 'crow';
    health: number;
    maxHealth: number;
    speed: number;
    damage: number;
    size: number;
    color: string;
    slowed: boolean;
};

export type Coin = {
    id: number;
    x: number;
    y: number;
    value: number;
    lifetime: number;
};

export type AmmoPickup = {
    id: number;
    x: number;
    y: number;
    type: string;
    amount: number;
    lifetime: number;
};

export type ActivePower = {
    id: number;
    type: 'scarecrow';
    x: number;
    y: number;
    lifetime: number;
    shootTimer: number;
};

export type Upgrade = {
    name: string;
    current: number;
    levels: string[];
    costs: number[];
};

export type GameState = {
    farmer: Farmer;
    companion: Companion;
    waterDroplets: WaterDroplet[];
    pests: Pest[];
    coins: Coin[];
    ammoPickups: AmmoPickup[];
    ammo: { [key: string]: number };
    currentAmmoType: string;
    currentTool: string;
    lastFireTime: number;
    ownedTools: string[];
    ownedPowers: string[];
    powerCooldowns: { [key: string]: number };
    activePowers: ActivePower[];
    upgrades: { [key: string]: Upgrade };
    currentSeason: number;
    pestsPerSeason: number;
    pestsKilledThisSeason: number;
    spawnTimer: number;
    spawnInterval: number;
    credits: number;
    score: number;
    highScore: number;
    aiNature: AINature;
};

export type GameAction =
    | { type: 'MOVE_FARMER'; payload: { dx: number; dy: number } }
    | { type: 'SET_FARMER_POSITION'; payload: { x: number; y: number } }
    | { type: 'FIRE_WATER'; payload: { droplets: Omit<WaterDroplet, 'id'>[] } }
    | { type: 'SET_AMMO'; payload: { type: string; count: number } }
    | { type: 'SET_CURRENT_AMMO_TYPE'; payload: string }
    | { type: 'TICK'; payload: { deltaTime: number; keys: { [key: string]: boolean }; mouse: MouseState } }
    | { type: 'SWITCH_TOOL'; payload: string }
    | { type: 'ACTIVATE_POWER'; payload: { key: string; mouse: MouseState } }
    | { type: 'BUY_ITEM'; payload: { category: 'tools' | 'powers' | 'upgrades'; key: string } }
    | { type: 'TOGGLE_AI', payload: AINature }
    | { type: 'RESET_GAME'; payload: GameState };

export interface MouseState {
    x: number;
    y: number;
    pressed: boolean;
}
