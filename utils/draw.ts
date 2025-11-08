
import { GameState, Farmer, Pest } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';

const drawFarmer = (ctx: CanvasRenderingContext2D, farmer: Farmer, isCompanion: boolean) => {
    if (farmer.health <= 0 && isCompanion) return;
    
    if (!farmer.invulnerable || Math.floor(Date.now() / 100) % 2 === 0) {
        ctx.fillStyle = isCompanion ? '#DEB887' : '#CD853F';
        ctx.fillRect(farmer.x - farmer.size / 2, farmer.y - farmer.size / 2, farmer.size, farmer.size);
        
        // Hat
        ctx.fillStyle = isCompanion ? '#4169E1' : '#8B4513';
        ctx.beginPath();
        ctx.arc(farmer.x, farmer.y - farmer.size / 2 - 5, farmer.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(farmer.x - 5, farmer.y - 3, 3, 3);
        ctx.fillRect(farmer.x + 2, farmer.y - 3, 3, 3);
    }
    
    if (isCompanion) {
         // Health bar above companion
        const barWidth = farmer.size * 2;
        const healthPercent = farmer.health / farmer.maxHealth;
        
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(farmer.x - barWidth / 2, farmer.y - farmer.size - 15, barWidth, 4);
        
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(farmer.x - barWidth / 2, farmer.y - farmer.size - 15, barWidth * healthPercent, 4);
    }
};

const drawPest = (ctx: CanvasRenderingContext2D, pest: Pest) => {
    ctx.fillStyle = pest.color;
    if (pest.slowed) ctx.globalAlpha = 0.6;
    
    if (pest.type === 'weed') {
        ctx.fillRect(pest.x - pest.size / 2, pest.y - pest.size / 2, pest.size, pest.size);
        ctx.fillStyle = '#228B22';
        ctx.fillRect(pest.x - pest.size / 4, pest.y - pest.size, pest.size / 2, pest.size);
    } else if (pest.type === 'bug') {
        ctx.beginPath();
        ctx.arc(pest.x, pest.y, pest.size, 0, Math.PI * 2);
        ctx.fill();
    } else if (pest.type === 'crow') {
        ctx.beginPath();
        ctx.moveTo(pest.x - pest.size, pest.y);
        ctx.lineTo(pest.x, pest.y - pest.size);
        ctx.lineTo(pest.x + pest.size, pest.y);
        ctx.lineTo(pest.x, pest.y + pest.size / 2);
        ctx.closePath();
        ctx.fill();
    }

    ctx.globalAlpha = 1;

    // Health bar
    const barWidth = pest.size * 2;
    const healthPercent = pest.health / pest.maxHealth;
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(pest.x - barWidth / 2, pest.y - pest.size - 10, barWidth, 4);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(pest.x - barWidth / 2, pest.y - pest.size - 10, barWidth * healthPercent, 4);
};

export const drawGame = (ctx: CanvasRenderingContext2D, state: GameState) => {
    // Draw background grid
    ctx.strokeStyle = '#7CCD7C';
    ctx.lineWidth = 1;
    for (let i = 0; i < CANVAS_WIDTH; i += 50) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, CANVAS_HEIGHT); ctx.stroke();
    }
    for (let i = 0; i < CANVAS_HEIGHT; i += 50) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(CANVAS_WIDTH, i); ctx.stroke();
    }
    
    // Draw coins
    state.coins.forEach(coin => {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath(); ctx.arc(coin.x, coin.y, 8, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#FFA500'; ctx.lineWidth = 2; ctx.stroke();
    });
    
    // Draw ammo pickups
    state.ammoPickups.forEach(pickup => {
        const colors: {[key:string]: string} = { spread: '#FF1493', piercing: '#00FF00', explosive: '#FF4500', homing: '#FFD700' };
        const pulse = Math.sin(Date.now() / 200) * 0.2 + 1;
        const size = 10 * pulse;
        ctx.fillStyle = colors[pickup.type];
        ctx.beginPath(); ctx.moveTo(pickup.x, pickup.y - size); ctx.lineTo(pickup.x + size, pickup.y + size); ctx.lineTo(pickup.x - size, pickup.y + size); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center'; ctx.fillText(pickup.type[0].toUpperCase(), pickup.x, pickup.y + 3);
    });

    // Draw active powers
    state.activePowers.forEach(power => {
        if (power.type === 'scarecrow') {
            ctx.fillStyle = '#8B4513'; ctx.fillRect(power.x - 5, power.y - 20, 10, 40);
            ctx.fillStyle = '#DEB887'; ctx.beginPath(); ctx.arc(power.x, power.y - 25, 12, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#000'; ctx.fillRect(power.x - 3, power.y - 27, 2, 2); ctx.fillRect(power.x + 1, power.y - 27, 2, 2);
        }
    });

    // Draw farmers
    drawFarmer(ctx, state.farmer, false);
    drawFarmer(ctx, state.companion, true);
    
    // Draw water droplets
    state.waterDroplets.forEach(w => {
        ctx.fillStyle = w.color;
        ctx.beginPath(); ctx.arc(w.x, w.y, w.size, 0, Math.PI * 2); ctx.fill();
    });
    
    // Draw pests
    state.pests.forEach(pest => drawPest(ctx, pest));
};
