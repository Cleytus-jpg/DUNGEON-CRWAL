
import React from 'react';
import { GameState, GameStatus } from '../types';

interface GameOverScreenProps {
    status: GameStatus;
    state: GameState;
    onReset: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ status, state, onReset }) => {
    if (status !== GameStatus.GAME_OVER) return null;

    const isNewHighScore = state.score >= state.highScore;

    return (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white text-center p-4 z-10">
            <h2 className="text-5xl font-bold text-red-500 mb-4 animate-pulse">FARM OVERWHELMED!</h2>
            <div className="space-y-2 text-xl">
                <p>Final Score: <span className="font-bold text-cyan-400">{state.score}</span></p>
                {isNewHighScore ? (
                     <p className="text-2xl font-bold text-yellow-400 animate-bounce">★ NEW HIGH SCORE! ★</p>
                ) : (
                    <p>High Score: <span className="font-bold text-yellow-400">{state.highScore}</span></p>
                )}
                <p>Season Reached: <span className="font-bold text-green-400">{state.currentSeason}</span></p>
            </div>
            <button
                onClick={onReset}
                className="mt-8 px-8 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-2xl font-bold shadow-lg transition-transform transform hover:scale-105"
            >
                Farm Again
            </button>
        </div>
    );
};
