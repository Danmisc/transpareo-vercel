// ========================================
// MODERATION SERVICE
// Comprehensive text moderation with OpenAI + robust French fallback
// ========================================

// --- COMPREHENSIVE FRENCH BLACKLIST ---
// Real estate-specific fraud patterns, profanity, scam keywords

const PROFANITY_PATTERNS = [
    // French profanity (common variants and leetspeak)
    "merde", "putain", "connard", "connasse", "enculé", "salope", "pute", "bordel",
    "nique", "foutre", "bais.r", "chier", "couille", "bite", "con ", "cons ",
    "fdp", "ntm", "tg ", "ta gueule", "ferme.la", "casse.toi", "dégage",
    // Hate speech
    "sale arabe", "sale noir", "sale juif", "sale blanc", "nègre", "bougnoule", "youpin",
    "pd ", "pédé", "gouine", "tapette", "travelo",
    // Harassment
    "va mourir", "je vais te", "te buter", "te niquer", "menace", "je sais où",
];

const SCAM_PATTERNS = [
    // Generic scam keywords
    "arnaque", "scam", "spam", "phishing", "gratuit", "gagnez", "loterie", "jackpot",
    "crédit facile", "bitcoin gratuit", "investir maintenant", "rendement garanti",
    "sans risque", "100% garanti", "multipliez", "doublez votre argent",
    "offre limitée", "urgent", "dernière chance",
    // Contact baiting
    "contactez.moi sur whatsapp", "ajoutez.moi sur telegram", "envoyez un sms",
    "mon numéro personnel", "hors plateforme",
    // Money transfer scams
    "western union", "mandat cash", "virement urgent", "rib personnel",
    "payer en crypto", "paiement en btc",
];

const REAL_ESTATE_FRAUD_PATTERNS = [
    // Rental scams
    "loyer très bas", "prix incroyable", "propriétaire à l'étranger",
    "envoyez le dépôt", "payer avant visite", "sans visite",
    "clés contre paiement", "je voyage", "mission humanitaire",
    "appartement trop beau", "urgent déménagement",
    // Fake listings
    "pas de frais d'agence", "loyer charges comprises incroyable",
    "disponible immédiatement prix négociable",
    // Identity theft
    "envoyez vos documents", "carte d'identité requise avant",
    "copie du passeport", "pièces avant visite",
    // Advance fee fraud
    "frais de dossier anticipés", "réservation payante",
    "caution avant signature", "virement pour bloquer",
];

const SUSPICIOUS_PATTERNS = [
    // External contact requests (against ToS)
    /email.{0,20}@/i,
    /\+33\s?[67]/,
    /06\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}/,
    /07\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}/,
    /whatsapp/i,
    /telegram/i,
    /signal\s+app/i,
    // URL spam
    /bit\.ly/i,
    /tinyurl/i,
    /t\.me\//i,
    /wa\.me\//i,
];

// --- MODERATION RESULT TYPE ---
interface ModerationResult {
    flagged: boolean;
    categories: string[];
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    action: "ALLOW" | "WARN" | "BLOCK" | "ESCALATE";
}

// --- SERVICE ---
export const moderationService = {
    /**
     * Analyze text for policy violations using OpenAI Moderation API with robust fallback.
     */
    analyzeText: async (text: string): Promise<ModerationResult> => {
        if (!text || text.length < 2) {
            return { flagged: false, categories: [], severity: "LOW", action: "ALLOW" };
        }

        const normalizedText = normalizeText(text);

        // 1. Always run local check first (faster + catches French content)
        const localResult = runLocalModeration(normalizedText);

        // If local check flags anything HIGH or CRITICAL, return immediately
        if (localResult.flagged && (localResult.severity === "HIGH" || localResult.severity === "CRITICAL")) {
            return localResult;
        }

        // 2. OpenAI check for subtle violations
        const apiKey = process.env.OPENAI_API_KEY;

        if (apiKey) {
            try {
                const response = await fetch("https://api.openai.com/v1/moderations", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({ input: text }),
                });

                if (response.ok) {
                    const data = await response.json();
                    const result = data.results[0];

                    if (result.flagged) {
                        const categories = Object.keys(result.categories).filter(
                            (key) => result.categories[key]
                        );

                        // Combine with local results
                        const combinedCategories = [...new Set([...localResult.categories, ...categories])];

                        // OpenAI flags are usually serious
                        return {
                            flagged: true,
                            categories: combinedCategories,
                            severity: "HIGH",
                            action: "BLOCK"
                        };
                    }
                }
            } catch (error) {
                console.error("[Moderation] OpenAI API error:", error);
                // Fall through to local result
            }
        }

        // 3. Return local result (or clean result)
        return localResult;
    },

    /**
     * Quick check for usernames/profile names
     */
    checkUsername: (name: string): boolean => {
        const normalized = normalizeText(name);

        // Check profanity only for usernames
        return PROFANITY_PATTERNS.some(pattern => {
            if (pattern.includes(".")) {
                return new RegExp(pattern.replace(/\./g, ".?"), "i").test(normalized);
            }
            return normalized.includes(pattern);
        });
    },

    /**
     * Check if content contains suspicious external contact attempts
     */
    containsExternalContact: (text: string): boolean => {
        return SUSPICIOUS_PATTERNS.some(pattern => pattern.test(text));
    }
};

// --- HELPERS ---

function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/0/g, "o")
        .replace(/1/g, "i")
        .replace(/3/g, "e")
        .replace(/4/g, "a")
        .replace(/5/g, "s")
        .replace(/8/g, "b")
        .replace(/@/g, "a")
        .replace(/\$/g, "s");
}

function runLocalModeration(normalizedText: string): ModerationResult {
    const flaggedCategories: string[] = [];
    let maxSeverity: ModerationResult["severity"] = "LOW";

    // Check profanity
    for (const pattern of PROFANITY_PATTERNS) {
        const regex = pattern.includes(".")
            ? new RegExp(pattern.replace(/\./g, ".?"), "i")
            : null;

        const matches = regex
            ? regex.test(normalizedText)
            : normalizedText.includes(pattern.trim());

        if (matches) {
            flaggedCategories.push("PROFANITY");
            maxSeverity = "MEDIUM";
            break;
        }
    }

    // Check scam patterns
    for (const pattern of SCAM_PATTERNS) {
        const regex = pattern.includes(".")
            ? new RegExp(pattern.replace(/\./g, ".?"), "i")
            : null;

        const matches = regex
            ? regex.test(normalizedText)
            : normalizedText.includes(pattern);

        if (matches) {
            flaggedCategories.push("SCAM");
            maxSeverity = "HIGH";
            break;
        }
    }

    // Check real estate fraud patterns
    for (const pattern of REAL_ESTATE_FRAUD_PATTERNS) {
        const regex = pattern.includes(".")
            ? new RegExp(pattern.replace(/\./g, ".?"), "i")
            : null;

        const matches = regex
            ? regex.test(normalizedText)
            : normalizedText.includes(pattern);

        if (matches) {
            flaggedCategories.push("REAL_ESTATE_FRAUD");
            maxSeverity = "CRITICAL";
            break;
        }
    }

    // Check suspicious patterns (regex-based)
    for (const pattern of SUSPICIOUS_PATTERNS) {
        if (pattern.test(normalizedText)) {
            flaggedCategories.push("EXTERNAL_CONTACT");
            if (maxSeverity !== "CRITICAL") maxSeverity = "MEDIUM";
            break;
        }
    }

    // Determine action
    let action: ModerationResult["action"] = "ALLOW";
    if (flaggedCategories.length > 0) {
        switch (maxSeverity) {
            case "CRITICAL": action = "ESCALATE"; break;
            case "HIGH": action = "BLOCK"; break;
            case "MEDIUM": action = "WARN"; break;
            default: action = "ALLOW";
        }
    }

    return {
        flagged: flaggedCategories.length > 0,
        categories: [...new Set(flaggedCategories)],
        severity: maxSeverity,
        action
    };
}
