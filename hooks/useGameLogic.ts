import { useReducer, useState } from 'react';
import { GameAction, GameState, GameStatus, Pest, WaterDroplet, Coin, AmmoPickup, ActivePower, AINature, MouseState } from '../types';
import { INITIAL_GAME_STATE, TOOLS, POWERS, CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const distance = (x1: number, y1: number, x2: number, y2: number) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

let nextId = 0;

function gameReducer(state: GameState, action: GameAction): GameState {
    switch (action.type) {
        case 'TOGGLE_AI':
            return { ...state, aiNature: action.payload };

        case 'FIRE_WATER':
            const newDroplets = action.payload.droplets.map(d => ({ ...d, id: nextId++ }));
            return {
                ...state,
                waterDroplets: [...state.waterDroplets, ...newDroplets],
                lastFireTime: performance.now()
            };

        case 'SWITCH_TOOL':
            if (state.ownedTools.includes(action.payload)) {
                return { ...state, currentTool: action.payload };
            }
            return state;
        
        case 'SET_CURRENT_AMMO_TYPE':
             if (action.payload === 'standard' || state.ammo[action.payload] > 0) {
                return { ...state, currentAmmoType: action.payload };
            }
            return state;

        case 'BUY_ITEM':
            const { category, key } = action.payload;
            if (category === 'tools') {
                const tool = TOOLS[key];
                if (!state.ownedTools.includes(key) && state.credits >= tool.cost) {
                    return { ...state, credits: state.credits - tool.cost, ownedTools: [...state.ownedTools, key] };
                }
            }
            if (category === 'powers') {
                const power = POWERS[key];
                if (!state.ownedPowers.includes(key) && state.credits >= power.cost) {
                    return { ...state, credits: state.credits - power.cost, ownedPowers: [...state.ownedPowers, key] };
                }
            }
            if (category === 'upgrades') {
                const upgrade = state.upgrades[key];
                if (upgrade.current < upgrade.levels.length && state.credits >= upgrade.costs[upgrade.current]) {
                    const newUpgrades = { ...state.upgrades, [key]: { ...upgrade, current: upgrade.current + 1 } };
                    const newMaxHealth = 100 + (newUpgrades.maxEnergy.current === 1 ? 20 : newUpgrades.maxEnergy.current === 2 ? 40 : newUpgrades.maxEnergy.current === 3 ? 70 : 0);
                    return {
                        ...state,
                        credits: state.credits - upgrade.costs[upgrade.current],
                        upgrades: newUpgrades,
                        farmer: { ...state.farmer, maxHealth: newMaxHealth },
                        companion: { ...state.companion, maxHealth: newMaxHealth },
                    };
                }
            }
            return state;
        
        case 'ACTIVATE_POWER':
             const powerKey = action.payload.key;
             const power = POWERS[powerKey];
             if (state.ownedPowers.includes(powerKey) && (!state.powerCooldowns[powerKey] || state.powerCooldowns[powerKey] <= 0)) {
                const newState = { ...state, powerCooldowns: { ...state.powerCooldowns, [powerKey]: power.cooldown }};
                let newDroplets: Omit<WaterDroplet, 'id'>[] = [];
                let newActivePowers: ActivePower[] = [...state.activePowers];
                
                switch(powerKey) {
                    case 'fertilizer':
                        newState.pests.forEach(p => { if(distance(state.farmer.x, state.farmer.y, p.x, p.y) < 150) p.health -= 100; });
                        break;
                    case 'pesticide':
                        for (let i = 0; i < 16; i++) {
                            const angle = (i / 16) * Math.PI * 2;
                            newDroplets.push({ x: state.farmer.x, y: state.farmer.y, vx: Math.cos(angle) * 300, vy: Math.sin(angle) * 300, size: 6, damage: 15, color: '#00FF00', ammoType: 'power' });
                        }
                        break;
                    case 'scarecrow':
                        newActivePowers.push({ id: nextId++, type: 'scarecrow', x: state.farmer.x, y: state.farmer.y, lifetime: 10, shootTimer: 0 });
                        break;
                    case 'greenhouse':
                        newState.farmer.invulnerable = true;
                        newState.farmer.invulnerableTime = 5;
                        break;
                    case 'compost':
                        newState.farmer.health = Math.min(newState.farmer.maxHealth, newState.farmer.health + 50);
                        break;
                    case 'seedBurst':
                        for (let i = 0; i < 20; i++) {
                            const angle = Math.random() * Math.PI * 2;
                            newDroplets.push({ x: state.farmer.x, y: state.farmer.y, vx: Math.cos(angle) * 350, vy: Math.sin(angle) * 350, size: 5, damage: 12, color: '#8B4513', ammoType: 'power' });
                        }
                        break;
                    case 'beeSwarm':
                        for (let i = 0; i < 10; i++) {
                            setTimeout(() => {
                                const angle = Math.random() * Math.PI * 2;
                                newDroplets.push({ x: state.farmer.x, y: state.farmer.y, vx: Math.cos(angle) * 250, vy: Math.sin(angle) * 250, size: 4, damage: 8, color: '#FFD700', ammoType: 'power' });
                            }, i * 100);
                        }
                        break;
                    case 'rootTrap':
                        newState.pests.forEach(p => {
                            if (distance(state.farmer.x, state.farmer.y, p.x, p.y) < 200) {
                                p.slowed = true;
                                setTimeout(() => { p.slowed = false; }, 5000);
                            }
                        });
                        break;
                    case 'sunBeam':
                        const dx = action.payload.mouse.x - state.farmer.x;
                        const dy = action.payload.mouse.y - state.farmer.y;
                        const angle = Math.atan2(dy, dx);
                        for (let i = 0; i < 5; i++) {
                            newDroplets.push({ x: state.farmer.x + Math.cos(angle) * i * 30, y: state.farmer.y + Math.sin(angle) * i * 30, vx: Math.cos(angle) * 600, vy: Math.sin(angle) * 600, size: 12, damage: 40, color: '#FFFF00', ammoType: 'power' });
                        }
                        break;
                    case 'harvest':
                        let harvestedCredits = 0;
                        newState.coins = state.coins.filter(c => {
                            if (distance(state.farmer.x, state.farmer.y, c.x, c.y) < 200) {
                                harvestedCredits += c.value;
                                return false;
                            }
                            return true;
                        });
                        newState.credits += harvestedCredits;
                        break;
                }

                if (newDroplets.length > 0) {
                    newState.waterDroplets = [...newState.waterDroplets, ...newDroplets.map(d => ({ ...d, id: nextId++ }))];
                }
                newState.activePowers = newActivePowers;
                return newState;
            }
            return state;


        case 'TICK':
            const { deltaTime, mouse } = action.payload;
            let newState = { ...state };

            // Update timers
            if (newState.farmer.invulnerable) {
                newState.farmer.invulnerableTime -= deltaTime;
                if (newState.farmer.invulnerableTime <= 0) newState.farmer.invulnerable = false;
            }
            if (newState.companion.invulnerable) {
                newState.companion.invulnerableTime -= deltaTime;
                if (newState.companion.invulnerableTime <= 0) newState.companion.invulnerable = false;
            }

            Object.keys(newState.powerCooldowns).forEach(key => {
                if (newState.powerCooldowns[key] > 0) newState.powerCooldowns[key] -= deltaTime;
            });
            
            // update water droplets
            newState.waterDroplets = newState.waterDroplets.map(w => {
                if (w.ammoType === 'homing' && newState.pests.length > 0) {
                    const nearest = newState.pests.reduce((closest, pest) => {
                        const d = distance(w.x, w.y, pest.x, pest.y);
                        return d < closest.dist ? { pest, dist: d } : closest;
                    }, { pest: null, dist: Infinity });
                    if (nearest.pest) {
                        const angle = Math.atan2(nearest.pest.y - w.y, nearest.pest.x - w.x);
                        const speed = Math.sqrt(w.vx**2 + w.vy**2);
                        const turnSpeed = 0.1;
                        w.vx += (Math.cos(angle) * speed - w.vx) * turnSpeed;
                        w.vy += (Math.sin(angle) * speed - w.vy) * turnSpeed;
                    }
                }
                return { ...w, x: w.x + w.vx * deltaTime, y: w.y + w.vy * deltaTime };
            }).filter(w => w.x > -50 && w.x < CANVAS_WIDTH + 50 && w.y > -50 && w.y < CANVAS_HEIGHT + 50);

            // spawn pests
            newState.spawnTimer -= deltaTime;
            if (newState.spawnTimer <= 0 && newState.pestsKilledThisSeason < newState.pestsPerSeason) {
                const newPests: Pest[] = [];
                for (let i = 0; i < 2; i++) {
                    const side = Math.floor(Math.random() * 4);
                    let x, y;
                    if (side === 0) { x = Math.random() * CANVAS_WIDTH; y = -20; }
                    else if (side === 1) { x = CANVAS_WIDTH + 20; y = Math.random() * CANVAS_HEIGHT; }
                    else if (side === 2) { x = Math.random() * CANVAS_WIDTH; y = CANVAS_HEIGHT + 20; }
                    else { x = -20; y = Math.random() * CANVAS_HEIGHT; }
                    
                    const types = ['weed', 'bug', 'crow'] as const;
                    const type = types[Math.floor(Math.random() * types.length)];
                    let health = 20 + newState.currentSeason * 5;
                    let speed = 35 + newState.currentSeason * 5;
                    let damage = 5 + Math.floor(newState.currentSeason / 2);
                    let size = 15;
                    let color = '#8B4513';

                    if (type === 'bug') { health *= 0.7; speed *= 1.5; size = 10; color = '#FF0000'; } 
                    else if (type === 'crow') { health *= 1.3; speed *= 0.8; damage *= 1.5; size = 18; color = '#000000'; }

                    newPests.push({ id: nextId++, x, y, type, health, maxHealth: health, speed, damage, size, color, slowed: false });
                }
                newState.pests = [...newState.pests, ...newPests];
                newState.spawnTimer = newState.spawnInterval;
            }
            
            // update pests
            newState.pests.forEach(pest => {
                const distToPlayer = distance(pest.x, pest.y, newState.farmer.x, newState.farmer.y);
                const distToCompanion = distance(pest.x, pest.y, newState.companion.x, newState.companion.y);
                const target = distToPlayer < distToCompanion ? newState.farmer : newState.companion;

                const dx = target.x - pest.x;
                const dy = target.y - pest.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist > 0) {
                    const currentSpeed = pest.speed * (pest.slowed ? 0.3 : 1);
                    pest.x += (dx / dist) * currentSpeed * deltaTime;
                    pest.y += (dy / dist) * currentSpeed * deltaTime;
                }
                // Pest collision
                if (!newState.farmer.invulnerable && distance(newState.farmer.x, newState.farmer.y, pest.x, pest.y) < newState.farmer.size + pest.size) {
                    newState.farmer.health -= pest.damage;
                    newState.farmer.invulnerable = true;
                    newState.farmer.invulnerableTime = 1;
                }
                if (newState.companion.health > 0 && !newState.companion.invulnerable && distance(newState.companion.x, newState.companion.y, pest.x, pest.y) < newState.companion.size + pest.size) {
                    newState.companion.health -= pest.damage;
                    newState.companion.invulnerable = true;
                    newState.companion.invulnerableTime = 1;
                }
            });

            // Droplet-pest collision
            const newCoins: Coin[] = [];
            const newAmmoPickups: AmmoPickup[] = [];
            const dropletsToRemove = new Set<number>();
            newState.waterDroplets.forEach(w => {
                newState.pests.forEach(pest => {
                    if (distance(w.x, w.y, pest.x, pest.y) < w.size + pest.size) {
                        if (w.ammoType === 'piercing' && (w.piercedEnemies?.includes(pest.id))) return;

                        pest.health -= w.damage;
                        if (w.ammoType !== 'piercing') {
                            dropletsToRemove.add(w.id);
                        } else {
                            w.piercedEnemies = [...(w.piercedEnemies || []), pest.id];
                        }
                        
                        if (w.ammoType === 'explosive' && !w.exploded) {
                            w.exploded = true;
                            newState.pests.forEach(p => { if (distance(w.x, w.y, p.x, p.y) < 80) p.health -= w.damage * 0.5; });
                        }

                        if (pest.health <= 0) {
                            newState.pestsKilledThisSeason++;
                            newState.score += 10;
                            newCoins.push({ id: nextId++, x: pest.x, y: pest.y, value: 5 + Math.floor(Math.random() * 10), lifetime: 10 });
                            if (Math.random() < 0.4) {
                                const ammoTypes = ['spread', 'piercing', 'explosive', 'homing'];
                                const type = ammoTypes[Math.floor(Math.random() * ammoTypes.length)];
                                newAmmoPickups.push({ id: nextId++, x: pest.x + (Math.random() - 0.5) * 30, y: pest.y + (Math.random() - 0.5) * 30, type, amount: Math.floor(Math.random() * 5) + 3, lifetime: 15 });
                            }
                        }
                    }
                });
            });

            newState.waterDroplets = newState.waterDroplets.filter(w => !dropletsToRemove.has(w.id));
            newState.pests = newState.pests.filter(p => p.health > 0);
            newState.coins = [...newState.coins, ...newCoins];
            newState.ammoPickups = [...newState.ammoPickups, ...newAmmoPickups];
            
            // Collect coins & ammo
            let collectedCredits = 0;
            newState.coins = newState.coins.filter(c => {
                c.lifetime -= deltaTime;
                if(distance(newState.farmer.x, newState.farmer.y, c.x, c.y) < newState.farmer.size + 10 || distance(newState.companion.x, newState.companion.y, c.x, c.y) < newState.companion.size + 10) {
                    collectedCredits += c.value;
                    return false;
                }
                return c.lifetime > 0;
            });
            newState.credits += collectedCredits;
            
            newState.ammoPickups = newState.ammoPickups.filter(p => {
                p.lifetime -= deltaTime;
                if(distance(newState.farmer.x, newState.farmer.y, p.x, p.y) < newState.farmer.size + 12 || distance(newState.companion.x, newState.companion.y, p.x, p.y) < newState.companion.size + 12) {
                    newState.ammo[p.type] = (newState.ammo[p.type] || 0) + p.amount;
                    return false;
                }
                return p.lifetime > 0;
            });

            // Season progression
            if (newState.pestsKilledThisSeason >= newState.pestsPerSeason) {
                newState.currentSeason++;
                newState.pestsKilledThisSeason = 0;
                newState.pestsPerSeason += 10;
                newState.spawnInterval = Math.max(0.5, newState.spawnInterval - 0.1);
            }

            // Active powers
            const newPowerDroplets: Omit<WaterDroplet, 'id'>[] = [];
            newState.activePowers.forEach(p => {
                p.lifetime -= deltaTime;
                if (p.type === 'scarecrow') {
                    p.shootTimer -= deltaTime;
                    if (p.shootTimer <= 0 && newState.pests.length > 0) {
                        const nearest = newState.pests.reduce((closest, pest) => {
                            const d = distance(p.x, p.y, pest.x, pest.y);
                            return d < closest.dist ? { pest, dist: d } : closest;
                        }, { pest: null, dist: Infinity });
                        if (nearest.pest && nearest.dist < 200) {
                            const angle = Math.atan2(nearest.pest.y - p.y, nearest.pest.x - p.x);
                            newPowerDroplets.push({ x: p.x, y: p.y, vx: Math.cos(angle) * 400, vy: Math.sin(angle) * 400, size: 5, damage: 20, color: '#FFD700', ammoType: 'power' });
                        }
                        p.shootTimer = 0.5;
                    }
                }
            });
            newState.activePowers = newState.activePowers.filter(p => p.lifetime > 0);
            if (newPowerDroplets.length > 0) {
                newState.waterDroplets = [...newState.waterDroplets, ...newPowerDroplets.map(d => ({ ...d, id: nextId++ }))];
            }

            // AI Logic
            if (newState.aiNature === AINature.AUTO || newState.aiNature === AINature.ASSIST) {
                const companion = newState.companion;
                let moveX = 0, moveY = 0;

                const nearestAmmo = newState.ammoPickups.reduce((c, p) => (distance(companion.x, companion.y, p.x, p.y) < c.dist ? { item: p, dist: distance(companion.x, companion.y, p.x, p.y) } : c), {item:null, dist:300});
                const nearestCoin = newState.coins.reduce((c, p) => (distance(companion.x, companion.y, p.x, p.y) < c.dist ? { item: p, dist: distance(companion.x, companion.y, p.x, p.y) } : c), {item:null, dist:250});
                const nearestPest = newState.pests.reduce((c, p) => (distance(companion.x, companion.y, p.x, p.y) < c.dist ? { item: p, dist: distance(companion.x, companion.y, p.x, p.y) } : c), {item:null, dist:Infinity});
                
                let target = null;
                if (nearestAmmo.item) target = nearestAmmo.item;
                else if (nearestCoin.item) target = nearestCoin.item;
                else if (nearestPest.item) target = nearestPest.item;

                if (target) {
                    const dx = target.x - companion.x;
                    const dy = target.y - companion.y;
                    const dist = Math.sqrt(dx*dx+dy*dy);
                    if (dist > 5) {
                        moveX = dx/dist;
                        moveY = dy/dist;
                    }
                } else {
                     // Watch the player's back
                    const desiredDist = 80;
                    const aimDx = mouse.x - newState.farmer.x;
                    const aimDy = mouse.y - newState.farmer.y;
                    const aimDist = Math.sqrt(aimDx * aimDx + aimDy * aimDy);

                    let guardX, guardY;
                    
                    // Position the companion behind the player, opposite to the aiming direction
                    if (aimDist > 10) {
                        guardX = newState.farmer.x - (aimDx / aimDist) * desiredDist;
                        guardY = newState.farmer.y - (aimDy / aimDist) * desiredDist;
                    } else {
                        // Default to a position slightly behind and to the side if not aiming
                        guardX = newState.farmer.x - 40;
                        guardY = newState.farmer.y + 40;
                    }

                    const distToGuardPos = distance(companion.x, companion.y, guardX, guardY);

                    if (distToGuardPos > 15) { // Move if not already at the desired spot, with a small buffer
                        const moveDx = guardX - companion.x;
                        const moveDy = guardY - companion.y;
                        moveX = moveDx / distToGuardPos;
                        moveY = moveDy / distToGuardPos;
                    }
                }

                const speedBonus = 1 + (newState.upgrades.moveSpeed.current * 0.15);
                companion.x += moveX * companion.speed * speedBonus * deltaTime;
                companion.y += moveY * companion.speed * speedBonus * deltaTime;
                companion.x = clamp(companion.x, companion.size, CANVAS_WIDTH - companion.size);
                companion.y = clamp(companion.y, companion.size, CANVAS_HEIGHT - companion.size);

                // Companion firing
                if (nearestPest.item) {
                     const tool = TOOLS[companion.currentTool];
                     const fireRateBonus = 1 + (newState.upgrades.fireRate.current * 0.15);
                     if (performance.now() - companion.lastFireTime > (tool.fireRate * 1000) / fireRateBonus) {
                        const dx = nearestPest.item.x - companion.x;
                        const dy = nearestPest.item.y - companion.y;
                        const angle = Math.atan2(dy, dx);
                        const damageBonus = 1 + (newState.upgrades.waterDamage.current * 0.20);
                        
                        const spawnDist = companion.size / 2 + 5;
                        const startX = companion.x + Math.cos(angle) * spawnDist;
                        const startY = companion.y + Math.sin(angle) * spawnDist;

                        newState.waterDroplets.push({ id: nextId++, x: startX, y: startY, vx: Math.cos(angle) * tool.projectileSpeed, vy: Math.sin(angle) * tool.projectileSpeed, size: tool.projectileSize, damage: tool.damage * damageBonus, color: '#00CED1', ammoType: 'standard' });
                        companion.lastFireTime = performance.now();
                     }
                }

                 // Auto-farmer logic
                if (newState.aiNature === AINature.AUTO) {
                    const farmer = newState.farmer;
                    let f_moveX = 0, f_moveY = 0;
                    
                    const f_nearestAmmo = newState.ammoPickups.reduce((c, p) => (distance(farmer.x, farmer.y, p.x, p.y) < c.dist ? { item: p, dist: distance(farmer.x, farmer.y, p.x, p.y) } : c), {item:null, dist:300});
                    const f_nearestCoin = newState.coins.reduce((c, p) => (distance(farmer.x, farmer.y, p.x, p.y) < c.dist ? { item: p, dist: distance(farmer.x, farmer.y, p.x, p.y) } : c), {item:null, dist:250});
                    const f_nearestPest = newState.pests.reduce((c, p) => (distance(farmer.x, farmer.y, p.x, p.y) < c.dist ? { item: p, dist: distance(farmer.x, farmer.y, p.x, p.y) } : c), {item:null, dist:Infinity});
                    
                    let f_target = null;
                    if (f_nearestAmmo.item) f_target = f_nearestAmmo.item;
                    else if (f_nearestCoin.item) f_target = f_nearestCoin.item;
                    else if (f_nearestPest.item) f_target = f_nearestPest.item;
    
                    if (f_target) {
                        const dx = f_target.x - farmer.x;
                        const dy = f_target.y - farmer.y;
                        const dist = Math.sqrt(dx*dx+dy*dy);
                        if (dist > 5) {
                            f_moveX = dx/dist;
                            f_moveY = dy/dist;
                        }
                    }

                    const speedBonus = 1 + (newState.upgrades.moveSpeed.current * 0.15);
                    farmer.x += f_moveX * farmer.speed * speedBonus * deltaTime;
                    farmer.y += f_moveY * farmer.speed * speedBonus * deltaTime;
                    farmer.x = clamp(farmer.x, farmer.size, CANVAS_WIDTH - farmer.size);
                    farmer.y = clamp(farmer.y, farmer.size, CANVAS_HEIGHT - farmer.size);

                    // Farmer auto-firing
                    if (f_nearestPest.item) {
                         const tool = TOOLS[newState.currentTool];
                         const fireRateBonus = 1 + (newState.upgrades.fireRate.current * 0.15);
                         if (performance.now() - newState.lastFireTime > (tool.fireRate * 1000) / fireRateBonus) {
                            const dx = f_nearestPest.item.x - farmer.x;
                            const dy = f_nearestPest.item.y - farmer.y;
                            const angle = Math.atan2(dy, dx);
                            const damageBonus = 1 + (newState.upgrades.waterDamage.current * 0.20);
                            
                            const spawnDist = farmer.size / 2 + 5;
                            const startX = farmer.x + Math.cos(angle) * spawnDist;
                            const startY = farmer.y + Math.sin(angle) * spawnDist;

                            newState.waterDroplets.push({ id: nextId++, x: startX, y: startY, vx: Math.cos(angle) * tool.projectileSpeed, vy: Math.sin(angle) * tool.projectileSpeed, size: tool.projectileSize, damage: tool.damage * damageBonus, color: tool.color, ammoType: 'standard' });
                            newState.lastFireTime = performance.now();
                         }
                    }
                }
            }


            return newState;

        case 'RESET_GAME':
             return {
                ...INITIAL_GAME_STATE,
                highScore: state.highScore, // Keep high score across resets
             };

        default:
            return state;
    }
}

export const useGameLogic = () => {
    const [gameState, dispatch] = useReducer(gameReducer, INITIAL_GAME_STATE);
    const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.STOPPED);

    const resetGame = () => {
        const highScore = Math.max(gameState.score, gameState.highScore);
        if (highScore > gameState.highScore) {
             localStorage.setItem('farmingHighScore_react', highScore.toString());
        }
        dispatch({ type: 'RESET_GAME', payload: {...INITIAL_GAME_STATE, highScore }});
        setGameStatus(GameStatus.STOPPED);
    };

    return { gameState, dispatch, gameStatus, setGameStatus, resetGame };
};