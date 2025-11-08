
import React from 'react';
import { GameStatus } from '../types';

interface ControlsProps {
    status: GameStatus;
    onStart: () => void;
    onPause: () => void;
    onReset: () => void;
    onShopToggle: () => void;
}

const ControlButton: React.FC<React.PropsWithChildren<{ onClick: () => void, className?: string }>> = ({ onClick, children, className }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-lg font-bold text-white shadow-lg transition-transform transform hover:scale-105 ${className}`}
    >
        {children}
    </button>
);


export const Controls: React.FC<ControlsProps> = ({ status, onStart, onPause, onReset, onShopToggle }) => {
    return (
        <div className="flex justify-center items-center gap-2 md:gap-4 mb-4 flex-wrap">
            {status === GameStatus.STOPPED || status === GameStatus.GAME_OVER ? (
                <ControlButton onClick={onStart} className="bg-green-600 hover:bg-green-700">Start Farming</ControlButton>
            ) : (
                <ControlButton onClick={onPause} className="bg-yellow-500 hover:bg-yellow-600">
                    {status === GameStatus.PAUSED ? 'Resume' : 'Pause'}
                </ControlButton>
            )}
            <ControlButton onClick={onReset} className="bg-red-600 hover:bg-red-700">Reset Farm</ControlButton>
            <ControlButton onClick={onShopToggle} className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.25pc5.197 5.197 0 0 1 5.25-4.5h.154c.318.026.63.098.938.226l.28.121c.226.098.444.22.65.368l.25.187c.217.168.42.36.608.572l.25.287c.18.217.33.45.45.708l.12.28c.128.308.199.62.226.938l.01.154a5.197 5.197 0 0 1-4.5 5.25H13.5Zm-4.5 0H2.25" />
                </svg>
                Shop [E]
            </ControlButton>
        </div>
    );
};
