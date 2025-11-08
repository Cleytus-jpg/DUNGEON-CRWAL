import { GameState, AINature } from "./types";

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const TOOLS: { [key: string]: any } = {
    wateringCan: { name: 'Watering Can', key: '1', damage: 10, fireRate: 0.4, projectileSpeed: 225, projectileSize: 4, color: '#00BFFF', cost: 0 },
    gardenHose: { name: 'Garden Hose', key: '2', damage: 15, fireRate: 0.2, projectileSpeed: 300, projectileSize: 5, color: '#1E90FF', cost: 150 },
    sprinkler: { name: 'Sprinkler', key: '3', damage: 8, fireRate: 0.15, projectileSpeed: 260, projectileSize: 6, color: '#87CEEB', cost: 300 },
    rainMaker: { name: 'Rain Maker', key: '4', damage: 25, fireRate: 0.55, projectileSpeed: 375, projectileSize: 8, color: '#4169E1', cost: 600 },
    cloudSeeder: { name: 'Cloud Seeder', key: '5', damage: 50, fireRate: 0.8, projectileSpeed: 450, projectileSize: 10, color: '#0000CD', cost: 1000 }
};

export const POWERS: { [key: string]: any } = {
    fertilizer: { name: 'Fertilizer Bomb', key: 'q', cooldown: 5, description: 'Explosive fertilizer destroys nearby weeds', cost: 200 },
    pesticide: { name: 'Pesticide Spray', key: 'r', cooldown: 8, description: 'Circular spray of pesticide', cost: 300 },
    scarecrow: { name: 'Scarecrow', key: 'f', cooldown: 15, description: 'Summon a scarecrow to fight pests', cost: 400 },
    greenhouse: { name: 'Greenhouse Shield', key: 't', cooldown: 20, description: 'Temporary invincibility shield', cost: 500 },
    compost: { name: 'Compost Heal', key: 'g', cooldown: 12, description: 'Restore farm energy', cost: 250 },
    seedBurst: { name: 'Seed Burst', key: 'z', cooldown: 6, description: 'Fire seeds in all directions', cost: 350 },
    beeSwarm: { name: 'Bee Swarm', key: 'x', cooldown: 10, description: 'Release helpful bees', cost: 450 },
    rootTrap: { name: 'Root Trap', key: 'c', cooldown: 7, description: 'Slow nearby pests', cost: 300 },
    sunBeam: { name: 'Sun Beam', key: 'v', cooldown: 9, description: 'Piercing beam of sunlight', cost: 550 },
    harvest: { name: 'Quick Harvest', key: 'b', cooldown: 15, description: 'Instantly collect nearby coins', cost: 400 }
};

export const INITIAL_GAME_STATE: GameState = {
    farmer: { x: 400, y: 300, size: 20, health: 100, maxHealth: 100, speed: 150, invulnerable: false, invulnerableTime: 0 },
    companion: { x: 350, y: 300, size: 20, health: 100, maxHealth: 100, speed: 135, invulnerable: false, invulnerableTime: 0, lastFireTime: 0, currentTool: 'wateringCan' },
    waterDroplets: [],
    pests: [],
    coins: [],
    ammoPickups: [],
    ammo: { spread: 30, piercing: 20, explosive: 15, homing: 10 },
    currentAmmoType: 'standard',
    currentTool: 'wateringCan',
    lastFireTime: 0,
    ownedTools: ['wateringCan'],
    ownedPowers: [],
    powerCooldowns: {},
    activePowers: [],
    upgrades: {
        maxEnergy: { name: 'Max Energy', current: 0, levels: ['+20 Max Energy', '+20 Max Energy', '+30 Max Energy'], costs: [100, 200, 400] },
        moveSpeed: { name: 'Movement Speed', current: 0, levels: ['+15% Speed', '+15% Speed', '+20% Speed'], costs: [150, 300, 500] },
        waterDamage: { name: 'Water Damage', current: 0, levels: ['+20% Damage', '+20% Damage', '+30% Damage'], costs: [200, 400, 600] },
        fireRate: { name: 'Watering Speed', current: 0, levels: ['+15% Fire Rate', '+15% Fire Rate', '+20% Fire Rate'], costs: [180, 350, 550] }
    },
    currentSeason: 1,
    pestsPerSeason: 20,
    pestsKilledThisSeason: 0,
    spawnTimer: 0,
    spawnInterval: 3,
    credits: 50,
    score: 0,
    highScore: parseInt(localStorage.getItem('farmingHighScore_react')) || 0,
    aiNature: AINature.NONE,
};