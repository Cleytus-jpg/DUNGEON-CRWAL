
import React from 'react';
import { AINature } from '../types';

interface AIToggleProps {
    aiNature: AINature;
    onToggle: (nature: AINature) => void;
}

const options = [
    { value: AINature.NONE, label: 'Manual', description: 'You are in full control.' },
    { value: AINature.ASSIST, label: 'Helper', description: 'Your companion assists you.' },
    { value: AINature.AUTO, label: 'Auto-Farm', description: 'AI controls both characters.' },
];

export const AIToggle: React.FC<AIToggleProps> = ({ aiNature, onToggle }) => {
    const currentIndex = options.findIndex(opt => opt.value === aiNature);
    const nextIndex = (currentIndex + 1) % options.length;
    const nextNature = options[nextIndex].value;

    const currentOption = options[currentIndex];
    
    const colors = {
        [AINature.NONE]: 'bg-red-500 hover:bg-red-600',
        [AINature.ASSIST]: 'bg-yellow-500 hover:bg-yellow-600',
        [AINature.AUTO]: 'bg-green-500 hover:bg-green-600',
    };

    return (
         <button
            onClick={() => onToggle(nextNature)}
            className={`px-4 py-2 text-white font-bold rounded-lg shadow-md transition-colors flex flex-col items-center text-center ${colors[aiNature]}`}
            title="Click to change AI mode"
        >
            <span>{currentOption.label} Mode</span>
            <span className="text-xs font-normal">{currentOption.description}</span>
        </button>
    );
};
