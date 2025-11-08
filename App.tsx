
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { Controls } from './components/Controls';
import { ShopModal } from './components/ShopModal';
import { GameOverScreen } from './components/GameOverScreen';
import { AINature, GameState, GameStatus } from './types';
import { TOOLS, POWERS } from './constants';
import { useGameLogic } from './hooks/useGameLogic';
import { AIToggle } from './components/AIToggle';
import { AICoach } from './components/AICoach';

const App: React.FC = () => {
    const { gameState, dispatch, gameStatus, setGameStatus, resetGame } = useGameLogic();
    const [isShopOpen, setIsShopOpen] = useState(false);
    const [isCoachOpen, setIsCoachOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'e') {
                e.preventDefault();
                setIsShopOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const toggleAI = (nature: AINature) => {
        dispatch({ type: 'TOGGLE_AI', payload: nature });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-sky-300 to-green-300 p-4 font-sans text-green-900">
            <div className="w-full max-w-5xl mx-auto bg-green-100/50 rounded-2xl shadow-2xl p-4 md:p-6 border-4 border-amber-600 backdrop-blur-sm">
                <header className="text-center mb-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-green-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                        🌻 Garden Guardian AI 🌻
                    </h1>
                    <p className="text-green-700 mt-1">Protect your crops from pests with the help of an AI coach!</p>
                </header>

                <Controls
                    status={gameStatus}
                    onStart={() => setGameStatus(GameStatus.RUNNING)}
                    onPause={() => setGameStatus(prev => prev === GameStatus.PAUSED ? GameStatus.RUNNING : GameStatus.PAUSED)}
                    onReset={() => {
                        resetGame();
                        setIsShopOpen(false);
                    }}
                    onShopToggle={() => setIsShopOpen(!isShopOpen)}
                />

                <div className="relative w-full aspect-[4/3] mx-auto border-4 border-amber-700 rounded-lg shadow-inner overflow-hidden">
                    <GameCanvas 
                        gameState={gameState} 
                        dispatch={dispatch} 
                        gameStatus={gameStatus} 
                        setGameStatus={setGameStatus}
                    />
                    <GameOverScreen 
                        status={gameStatus} 
                        state={gameState} 
                        onReset={() => {
                            resetGame();
                            setIsShopOpen(false);
                        }} 
                    />
                </div>
                
                <HUD state={gameState} />

                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-4">
                    <AIToggle 
                        aiNature={gameState.aiNature}
                        onToggle={toggleAI}
                    />
                     <button
                        onClick={() => setIsCoachOpen(true)}
                        className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg shadow-md hover:bg-blue-600 transition-colors flex items-center gap-2"
                        title="Get a strategy tip from the AI Coach"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z" />
                        </svg>
                        Ask Coach
                    </button>
                </div>
                
            </div>
            
            <ShopModal
                isOpen={isShopOpen}
                onClose={() => setIsShopOpen(false)}
                gameState={gameState}
                dispatch={dispatch}
            />

            <AICoach
                isOpen={isCoachOpen}
                onClose={() => setIsCoachOpen(false)}
                gameState={gameState}
            />

            <footer className="mt-4 text-center text-sm text-green-800/80">
                <p>Move: WASD | Water: SPACE/CLICK | Tools: 1-5 | Ammo: 6-0 | Powers: Q,R,F,T,G,Z,X,C,V,B | Shop: E</p>
            </footer>
        </div>
    );
};

export default App;
