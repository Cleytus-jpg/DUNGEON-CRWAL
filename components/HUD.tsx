
import React from 'react';
import { GameState } from '../types';
import { TOOLS, POWERS } from '../constants';

interface HUDProps {
    state: GameState;
}

const StatBar: React.FC<{ label: string; value: number; maxValue: number; color: string; bgColor?: string }> = ({ label, value, maxValue, color, bgColor = 'bg-red-600' }) => (
    <div>
        <span className="text-white text-sm font-bold">{label}:</span>
        <div className={`w-full h-4 ${bgColor} rounded-full overflow-hidden border-2 border-black/50`}>
            <div className={`${color} h-full rounded-full transition-all duration-300`} style={{ width: `${(value / maxValue) * 100}%` }}></div>
        </div>
    </div>
);

export const HUD: React.FC<HUDProps> = React.memo(({ state }) => {
    const { farmer, companion, currentTool, ammo, currentAmmoType, credits, currentSeason, score, highScore, pestsKilledThisSeason, pestsPerSeason, powerCooldowns, ownedPowers } = state;
    
    const ammoColors: { [key: string]: string } = {
        standard: 'text-sky-300', spread: 'text-pink-400', piercing: 'text-lime-400', explosive: 'text-orange-500', homing: 'text-yellow-400'
    };
    const ammoName = currentAmmoType.charAt(0).toUpperCase() + currentAmmoType.slice(1);
    const ammoCount = currentAmmoType === 'standard' ? '∞' : ammo[currentAmmoType];

    return (
        <div className="w-full text-white">
            {/* Top Info Bar */}
            <div className="bg-slate-800/80 p-2 rounded-lg mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center md:text-left">
                <div className="col-span-1">
                    <StatBar label="Your Energy" value={farmer.health} maxValue={farmer.maxHealth} color="bg-green-500" />
                </div>
                <div className="col-span-1">
                    <StatBar label="Helper's Energy" value={companion.health} maxValue={companion.maxHealth} color="bg-blue-500" />
                </div>
                <div className="col-span-2 md:col-span-1 flex flex-col items-center justify-center">
                    <p className="text-lg font-bold">Tool: <span className="text-yellow-300">{TOOLS[currentTool].name}</span></p>
                    <p className={`text-lg font-bold ${ammoColors[currentAmmoType]}`}>Ammo: {ammoName} [{ammoCount}]</p>
                </div>
                <div className="col-span-2 md:col-span-1 flex flex-col items-center justify-center text-xl font-bold">
                    <p>🪙 <span className="text-yellow-400">{credits}</span></p>
                    <p>⭐ Score: <span className="text-cyan-300">{score}</span></p>
                </div>
            </div>

            {/* Bottom Season Progress Bar */}
             <div className="w-full mt-2">
                <div className="flex justify-between text-sm font-bold text-green-800">
                    <span>Season: {currentSeason}</span>
                    <span>High Score: {highScore}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-5 border-2 border-black/50 overflow-hidden">
                    <div className="bg-yellow-400 h-full rounded-full text-center text-black text-xs font-bold leading-5" style={{ width: `${(pestsKilledThisSeason / pestsPerSeason) * 100}%` }}>
                        {pestsKilledThisSeason} / {pestsPerSeason} Pests
                    </div>
                </div>
            </div>

            {/* Cooldowns Display */}
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {ownedPowers.map(key => {
                    const cd = powerCooldowns[key];
                    const power = POWERS[key];
                    const ready = !cd || cd <= 0;
                    return (
                        <div key={key} className={`relative w-16 h-10 flex items-center justify-center rounded-md border-2 ${ready ? 'bg-green-600 border-green-400' : 'bg-gray-700 border-gray-500'}`}>
                           {!ready && (
                                <div className="absolute bottom-0 left-0 bg-purple-500/70 h-full" style={{ width: `${100 - (cd / power.cooldown) * 100}%`}}></div>
                           )}
                           <span className="relative font-bold text-lg z-10">{power.key.toUpperCase()}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});
