import React, { useRef, useEffect, useCallback } from 'react';
import { GameState, GameStatus, GameAction, MouseState } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, TOOLS } from '../constants';
import { drawGame } from '../utils/draw';

interface GameCanvasProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
    gameStatus: GameStatus;
    setGameStatus: React.Dispatch<React.SetStateAction<GameStatus>>;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, dispatch, gameStatus, setGameStatus }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number>(0);
    const lastTime = useRef<number>(0);
    
    const mouseState = useRef<MouseState>({ x: 0, y: 0, pressed: false });
    const keysState = useRef<{ [key: string]: boolean }>({});

    const gameLoop = useCallback((time: number) => {
        const deltaTime = (time - lastTime.current) / 1000;
        lastTime.current = time;

        if (gameStatus === GameStatus.RUNNING) {
            
            // Player Movement (if not full auto)
            if(gameState.aiNature !== 'AUTO') {
                let dx = 0;
                let dy = 0;
                const speedBonus = 1 + (gameState.upgrades.moveSpeed.current * 0.15);
                const moveSpeed = gameState.farmer.speed * speedBonus * deltaTime;

                if (keysState.current['w'] || keysState.current['arrowup']) dy -= 1;
                if (keysState.current['s'] || keysState.current['arrowdown']) dy += 1;
                if (keysState.current['a'] || keysState.current['arrowleft']) dx -= 1;
                if (keysState.current['d'] || keysState.current['arrowright']) dx += 1;

                if (dx !== 0 || dy !== 0) {
                    const magnitude = Math.sqrt(dx * dx + dy * dy);
                    const farmer = gameState.farmer;
                    farmer.x += (dx / magnitude) * moveSpeed;
                    farmer.y += (dy / magnitude) * moveSpeed;
                    farmer.x = Math.max(farmer.size, Math.min(CANVAS_WIDTH - farmer.size, farmer.x));
                    farmer.y = Math.max(farmer.size, Math.min(CANVAS_HEIGHT - farmer.size, farmer.y));
                }
            }


            // Player Firing
            if ((keysState.current[' '] || mouseState.current.pressed) && gameState.aiNature !== 'AUTO') {
                 const now = performance.now();
                 const tool = TOOLS[gameState.currentTool];
                 const fireRateBonus = 1 + (gameState.upgrades.fireRate.current * 0.15);
                 if (now - gameState.lastFireTime > (tool.fireRate * 1000) / fireRateBonus) {
                    const dx = mouseState.current.x - gameState.farmer.x;
                    const dy = mouseState.current.y - gameState.farmer.y;
                    const angle = Math.atan2(dy, dx);
                    const damageBonus = 1 + (gameState.upgrades.waterDamage.current * 0.20);
                    
                    const shotsToFire = [];
                    const ammoType = gameState.currentAmmoType;

                    if (ammoType === 'standard' || gameState.ammo[ammoType] <= 0) {
                        if (gameState.ammo[ammoType] <= 0 && ammoType !== 'standard') dispatch({ type: 'SET_CURRENT_AMMO_TYPE', payload: 'standard' });
                        shotsToFire.push({ angle: angle, color: tool.color, ammoType: 'standard' });
                    } else if (ammoType === 'spread') {
                        for (let i = -2; i <= 2; i++) shotsToFire.push({ angle: angle + (i * 0.2), color: '#FF1493', ammoType: 'spread' });
                        dispatch({type: 'SET_AMMO', payload: {type: 'spread', count: gameState.ammo.spread -1 }})
                    } else if (ammoType === 'piercing') {
                        shotsToFire.push({ angle: angle, color: '#00FF00', ammoType: 'piercing' });
                        dispatch({type: 'SET_AMMO', payload: {type: 'piercing', count: gameState.ammo.piercing -1 }})
                    } else if (ammoType === 'explosive') {
                        shotsToFire.push({ angle: angle, color: '#FF4500', ammoType: 'explosive' });
                        dispatch({type: 'SET_AMMO', payload: {type: 'explosive', count: gameState.ammo.explosive -1 }})
                    } else if (ammoType === 'homing') {
                        shotsToFire.push({ angle: angle, color: '#FFD700', ammoType: 'homing' });
                        dispatch({type: 'SET_AMMO', payload: {type: 'homing', count: gameState.ammo.homing -1 }})
                    }
                    
                    const spawnDist = gameState.farmer.size / 2 + 5;
                    const startX = gameState.farmer.x + Math.cos(angle) * spawnDist;
                    const startY = gameState.farmer.y + Math.sin(angle) * spawnDist;

                    const droplets = shotsToFire.map(shot => ({
                        x: startX, y: startY,
                        vx: Math.cos(shot.angle) * tool.projectileSpeed, vy: Math.sin(shot.angle) * tool.projectileSpeed,
                        size: tool.projectileSize, damage: tool.damage * damageBonus, color: shot.color, ammoType: shot.ammoType
                    }));

                    dispatch({ type: 'FIRE_WATER', payload: { droplets } });
                 }
            }


            dispatch({ type: 'TICK', payload: { deltaTime, keys: keysState.current, mouse: mouseState.current } });
        }
        
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx && canvas) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawGame(ctx, gameState);
        }

        animationFrameId.current = requestAnimationFrame(gameLoop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameStatus, dispatch, gameState.farmer, gameState.currentTool, gameState.lastFireTime, gameState.aiNature]);

    useEffect(() => {
        lastTime.current = performance.now();
        animationFrameId.current = requestAnimationFrame(gameLoop);
        return () => {
            if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameLoop]);

    useEffect(() => {
        if (gameState.farmer.health <= 0 && gameStatus === GameStatus.RUNNING) {
            const currentHighScore = parseInt(localStorage.getItem('farmingHighScore_react') || '0');
            if(gameState.score > currentHighScore) {
                 localStorage.setItem('farmingHighScore_react', gameState.score.toString());
            }
            setGameStatus(GameStatus.GAME_OVER);
        }
    }, [gameState.farmer.health, gameState.score, gameStatus, setGameStatus]);
    
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseState.current.x = e.clientX - rect.left;
            mouseState.current.y = e.clientY - rect.top;
        };
        const handleMouseDown = () => { mouseState.current.pressed = true; };
        const handleMouseUp = () => { mouseState.current.pressed = false; };
        const handleKeyDown = (e: KeyboardEvent) => { 
            const key = e.key.toLowerCase();
            keysState.current[key] = true;
            
            // Tool and ammo switching
            if (gameStatus === GameStatus.RUNNING) {
                if (['1', '2', '3', '4', '5'].includes(key)) {
                    const toolKey = Object.keys(TOOLS).find(k => TOOLS[k].key === key);
                    if (toolKey) dispatch({ type: 'SWITCH_TOOL', payload: toolKey });
                }
                if (key >= '6' && key <= '0') {
                    const ammoMap: {[key:string]: string} = {'6': 'standard', '7':'spread', '8':'piercing', '9':'explosive', '0':'homing'};
                    dispatch({type: 'SET_CURRENT_AMMO_TYPE', payload: ammoMap[key]});
                }
                const powerKeys = "qrftgzxcvb";
                if(powerKeys.includes(key)) {
                    const powerKey = Object.keys(TOOLS).find(k => TOOLS[k].key === key);
                    dispatch({ type: 'ACTIVATE_POWER', payload: { key, mouse: mouseState.current }});
                }
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => { keysState.current[e.key.toLowerCase()] = false; };

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameStatus]);

    return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="bg-green-200" />;
};