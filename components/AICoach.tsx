
import React, { useState, useEffect } from 'react';
import { GameState } from '../types';
import { getAIStrategyTip } from '../services/geminiService';

interface AICoachProps {
    isOpen: boolean;
    onClose: () => void;
    gameState: GameState;
}

export const AICoach: React.FC<AICoachProps> = ({ isOpen, onClose, gameState }) => {
    const [tip, setTip] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const fetchTip = async () => {
        setIsLoading(true);
        setTip('');
        try {
            const newTip = await getAIStrategyTip(gameState);
            setTip(newTip);
        } catch (error) {
            setTip("Sorry, the coach is busy planning. Try again in a moment!");
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (isOpen) {
            fetchTip();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-800 text-white w-full max-w-md rounded-2xl shadow-2xl border-4 border-blue-500" onClick={e => e.stopPropagation()}>
                <header className="p-4 text-center bg-blue-700 rounded-t-lg flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-blue-200 flex items-center gap-2">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z" />
                        </svg>
                        AI Coach
                    </h2>
                    <button onClick={onClose} className="text-blue-200 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>
                
                <div className="p-6 h-48 flex items-center justify-center text-center bg-slate-900/50">
                    {isLoading ? (
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
                    ) : (
                        <p className="text-xl italic text-blue-200">"{tip}"</p>
                    )}
                </div>

                <footer className="p-3 bg-slate-900 rounded-b-lg flex justify-center">
                    <button 
                        onClick={fetchTip} 
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg shadow-md hover:bg-blue-600 transition-colors disabled:bg-gray-500 disabled:cursor-wait flex items-center gap-2"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.991-2.69a8.25 8.25 0 0 0-11.667 0l-3.181 3.183" />
                        </svg>
                        {isLoading ? 'Thinking...' : 'New Tip'}
                    </button>
                </footer>
            </div>
        </div>
    );
};
