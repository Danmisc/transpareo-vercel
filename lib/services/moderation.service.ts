
export const moderationService = {
    /**
     * Analyze text for policy violations using OpenAI Moderation API.
     * Returns true if flagged as unsafe.
     */
    analyzeText: async (text: string): Promise<{ flagged: boolean; categories: string[] }> => {
        if (!text || text.length < 2) return { flagged: false, categories: [] };

        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            console.warn("OPENAI_API_KEY not found. Skipping AI moderation.");
            // Fallback to basic keyword check if offline
            const basicBadWords = ["spam", "scam", "insulte"];
            const hasBadWord = basicBadWords.some(w => text.toLowerCase().includes(w));
            if (hasBadWord) return { flagged: true, categories: ["Basic Filter"] };
            return { flagged: false, categories: [] };
        }

        try {
            const response = await fetch("https://api.openai.com/v1/moderations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                },
                body: JSON.stringify({ input: text }),
            });

            if (!response.ok) {
                console.error("OpenAI Moderation API failed:", response.statusText);
                return { flagged: false, categories: [] };
            }

            const data = await response.json();
            const result = data.results[0];

            if (result.flagged) {
                const categories = Object.keys(result.categories).filter(
                    (key) => result.categories[key]
                );
                return { flagged: true, categories };
            }

            return { flagged: false, categories: [] };

        } catch (error) {
            console.error("Moderation error:", error);
            return { flagged: false, categories: [] };
        }
    }
};
