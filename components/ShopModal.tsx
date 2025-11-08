
import React, { useState } from 'react';
import { GameState, GameAction } from '../types';
import { TOOLS, POWERS } from '../constants';

interface ShopModalProps {
    isOpen: boolean;
    onClose: () => void;
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
}

type ShopCategory = 'tools' | 'powers' | 'upgrades';

const ShopTab: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-6 py-2 rounded-t-lg font-bold text-lg transition-colors ${
            active ? 'bg-amber-300 text-amber-900' : 'bg-amber-600 text-amber-100 hover:bg-amber-500'
        }`}
    >
        {children}
    </button>
);

export const ShopModal: React.FC<ShopModalProps> = ({ isOpen, onClose, gameState, dispatch }) => {
    const [category, setCategory] = useState<ShopCategory>('tools');

    if (!isOpen) return null;

    const handleBuy = (category: 'tools' | 'powers' | 'upgrades', key: string) => {
        dispatch({ type: 'BUY_ITEM', payload: { category, key } });
    };

    const renderTools = () => Object.keys(TOOLS).map(key => {
        const tool = TOOLS[key];
        const owned = gameState.ownedTools.includes(key);
        return (
            <div key={key} className={`p-4 rounded-lg flex justify-between items-center ${owned ? 'bg-green-800/50' : 'bg-slate-700/50'}`}>
                <div>
                    <h3 className="text-xl font-bold text-sky-300">{tool.name} [{tool.key}]</h3>
                    <p className="text-sm text-slate-300">Dmg: {tool.damage} | Rate: {(1/tool.fireRate).toFixed(1)}/s | Spd: {tool.projectileSpeed}</p>
                </div>
                {owned ? (
                    <span className="px-4 py-2 rounded bg-green-500 text-white font-bold">OWNED</span>
                ) : (
                    <button onClick={() => handleBuy('tools', key)} disabled={gameState.credits < tool.cost} className="px-4 py-2 rounded bg-yellow-500 text-black font-bold disabled:bg-gray-500 disabled:cursor-not-allowed">
                        🪙 {tool.cost}
                    </button>
                )}
            </div>
        );
    });
    
    const renderPowers = () => Object.keys(POWERS).map(key => {
        const power = POWERS[key];
        const owned = gameState.ownedPowers.includes(key);
        return (
             <div key={key} className={`p-4 rounded-lg flex justify-between items-center ${owned ? 'bg-green-800/50' : 'bg-slate-700/50'}`}>
                <div>
                    <h3 className="text-xl font-bold text-fuchsia-400">{power.name} [{power.key.toUpperCase()}]</h3>
                    <p className="text-sm text-slate-300">{power.description}</p>
                </div>
                {owned ? (
                    <span className="px-4 py-2 rounded bg-green-500 text-white font-bold">OWNED</span>
                ) : (
                    <button onClick={() => handleBuy('powers', key)} disabled={gameState.credits < power.cost} className="px-4 py-2 rounded bg-yellow-500 text-black font-bold disabled:bg-gray-500 disabled:cursor-not-allowed">
                        🪙 {power.cost}
                    </button>
                )}
            </div>
        );
    });
    
    const renderUpgrades = () => Object.keys(gameState.upgrades).map(key => {
        const upgrade = gameState.upgrades[key];
        const level = upgrade.current;
        const maxed = level >= upgrade.levels.length;
        return (
             <div key={key} className={`p-4 rounded-lg flex justify-between items-center ${maxed ? 'bg-green-800/50' : 'bg-slate-700/50'}`}>
                <div>
                    <h3 className="text-xl font-bold text-cyan-400">{upgrade.name} (Lv {level})</h3>
                    <p className="text-sm text-slate-300">{maxed ? 'MAX LEVEL' : `Next: ${upgrade.levels[level]}`}</p>
                </div>
                {maxed ? (
                     <span className="px-4 py-2 rounded bg-green-500 text-white font-bold">MAXED</span>
                ) : (
                    <button onClick={() => handleBuy('upgrades', key)} disabled={gameState.credits < upgrade.costs[level]} className="px-4 py-2 rounded bg-yellow-500 text-black font-bold disabled:bg-gray-500 disabled:cursor-not-allowed">
                        🪙 {upgrade.costs[level]}
                    </button>
                )}
            </div>
        );
    });


    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-800 text-white w-full max-w-2xl rounded-2xl shadow-2xl border-4 border-amber-500" onClick={e => e.stopPropagation()}>
                <header className="p-4 text-center bg-amber-700 rounded-t-lg">
                    <h2 className="text-4xl font-bold text-yellow-200">🌻 Garden Shop 🌻</h2>
                    <p className="text-amber-100">Your Credits: <span className="font-bold text-yellow-300">{gameState.credits} 🪙</span></p>
                </header>
                <nav className="flex justify-center bg-amber-800">
                    <ShopTab active={category === 'tools'} onClick={() => setCategory('tools')}>Tools</ShopTab>
                    <ShopTab active={category === 'powers'} onClick={() => setCategory('powers')}>Powers</ShopTab>
                    <ShopTab active={category === 'upgrades'} onClick={() => setCategory('upgrades')}>Upgrades</ShopTab>
                </nav>
                <div className="p-4 h-[50vh] overflow-y-auto space-y-3 bg-slate-900/50">
                    {category === 'tools' && renderTools()}
                    {category === 'powers' && renderPowers()}
                    {category === 'upgrades' && renderUpgrades()}
                </div>
                 <footer className="p-2 text-center text-sm text-slate-400 bg-slate-900 rounded-b-lg">
                    Press 'E' or click outside to close
                </footer>
            </div>
        </div>
    );
};
