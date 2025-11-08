
import { GoogleGenAI } from "@google/genai";
import { GameState } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const getAIStrategyTip = async (gameState: GameState): Promise<string> => {
    try {
        const simplifiedGameState = {
            season: gameState.currentSeason,
            health: `${gameState.farmer.health}/${gameState.farmer.maxHealth}`,
            credits: gameState.credits,
            pestsOnScreen: gameState.pests.length,
            ownedTools: gameState.ownedTools,
            ownedPowers: gameState.ownedPowers,
            upgrades: {
                maxEnergy: gameState.upgrades.maxEnergy.current,
                moveSpeed: gameState.upgrades.moveSpeed.current,
                waterDamage: gameState.upgrades.waterDamage.current,
                fireRate: gameState.upgrades.fireRate.current,
            },
            ammo: gameState.ammo
        };

        const prompt = `
            You are a strategy coach for a top-down shooter game called 'Garden Guardian'.
            The player is fighting waves of pests, collecting coins, and buying upgrades.
            Based on the following game state, provide a concise, actionable, and encouraging tip (under 25 words).
            Focus on what to buy next, a combat tactic, or a general strategy.
            Do not repeat yourself or use generic phrases like "Good job". Be specific.

            Game State:
            ${JSON.stringify(simplifiedGameState, null, 2)}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        return response.text.trim();

    } catch (error) {
        console.error("Error fetching AI tip:", error);
        return "Couldn't get a tip right now. Keep fighting!";
    }
};
