/**
 * AML/PEP Screening Service - SELF-CODED VERSION
 * Anti-Money Laundering and Politically Exposed Persons screening
 * 
 * This version uses open-source sanctions lists instead of paid APIs.
 * Data sources: EU Sanctions, OFAC SDN, UN Consolidated List
 * 
 * For production, consider downloading and caching these lists:
 * - EU: https://webgate.ec.europa.eu/fsd/fsf/public/files/xmlFullSanctionsList_1_1/content
 * - OFAC: https://www.treasury.gov/ofac/downloads/sdn.csv
 * - UN: https://scsanctions.un.org/resources/xml/en/consolidated.xml
 */

export interface ScreeningResult {
    passed: boolean;
    matches: ScreeningMatch[];
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    screenedAt: Date;
    provider: string;
}

export interface ScreeningMatch {
    listName: string;
    matchScore: number;
    entityName: string;
    entityType: string;
    reason?: string;
}

/**
 * Known high-profile sanctioned individuals and entities
 * This is a simplified list - in production, use full sanctions databases
 */
const SANCTIONS_DATABASE: { name: string; list: string; type: string }[] = [
    // Sample entries from major sanctions lists (for demo purposes)
    // In production, download and parse full lists from official sources
    { name: "Vladimir Putin", list: "EU Sanctions", type: "PEP" },
    { name: "Kim Jong Un", list: "OFAC", type: "HEAD_OF_STATE" },
    { name: "Bashar al-Assad", list: "EU Sanctions", type: "PEP" },
    { name: "Islamic Revolutionary Guard Corps", list: "OFAC", type: "ORGANIZATION" },
    { name: "Hezbollah", list: "EU Sanctions", type: "ORGANIZATION" },
    { name: "Al-Qaeda", list: "UN Consolidated", type: "TERRORIST" },
    // Add more as needed from official sources
];

/**
 * List of high-risk jurisdictions (FATF Grey/Black list 2024)
 */
export const HIGH_RISK_COUNTRIES = [
    'AF', // Afghanistan
    'IR', // Iran  
    'KP', // North Korea
    'MM', // Myanmar
    'SY', // Syria
    'YE', // Yemen
    'BY', // Belarus
    'RU', // Russia (post-2022)
    'VE', // Venezuela
    'ZW', // Zimbabwe
    'SD', // Sudan
    'LY', // Libya
];

/**
 * PEP (Politically Exposed Persons) titles to flag
 */
const PEP_TITLES = [
    'president', 'prime minister', 'minister', 'senator',
    'governor', 'mayor', 'ambassador', 'general', 'admiral',
    'chief executive', 'director', 'chairman', 'ceo'
];

/**
 * Calculate string similarity using Levenshtein distance
 * Returns a score between 0 and 1
 */
function calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 1;
    if (s1.length === 0 || s2.length === 0) return 0;

    // Simple word overlap for performance
    const words1 = new Set(s1.split(/\s+/));
    const words2 = new Set(s2.split(/\s+/));

    let matches = 0;
    words1.forEach(w => {
        if (words2.has(w) && w.length > 2) matches++;
    });

    const totalWords = Math.max(words1.size, words2.size);
    const wordScore = matches / totalWords;

    // Also check for substring match
    const substringMatch = s1.includes(s2) || s2.includes(s1);

    return substringMatch ? Math.max(wordScore, 0.85) : wordScore;
}

/**
 * Screen a user against local sanctions database
 * No external API required!
 */
export async function screenUser(
    fullName: string,
    dateOfBirth?: string,
    nationality?: string
): Promise<ScreeningResult> {
    console.log(`[AML] Screening: ${fullName}`);

    const matches: ScreeningMatch[] = [];
    const nameLower = fullName.toLowerCase();

    // 1. Check against sanctions database
    for (const entry of SANCTIONS_DATABASE) {
        const similarity = calculateSimilarity(fullName, entry.name);
        if (similarity >= 0.7) {
            matches.push({
                listName: entry.list,
                matchScore: similarity,
                entityName: entry.name,
                entityType: entry.type,
                reason: `Correspondance avec ${entry.list}`
            });
        }
    }

    // 2. Check for PEP-related titles in name (rare but catches obvious cases)
    for (const title of PEP_TITLES) {
        if (nameLower.includes(title)) {
            matches.push({
                listName: 'PEP_FLAG',
                matchScore: 0.6,
                entityName: fullName,
                entityType: 'POTENTIAL_PEP',
                reason: `Titre politique détecté: ${title}`
            });
            break;
        }
    }

    // 3. Check nationality against high-risk countries
    if (nationality && HIGH_RISK_COUNTRIES.includes(nationality.toUpperCase())) {
        matches.push({
            listName: 'FATF_GREY_LIST',
            matchScore: 0.5,
            entityName: fullName,
            entityType: 'HIGH_RISK_JURISDICTION',
            reason: `Nationalité à risque: ${nationality}`
        });
    }

    // Determine risk level
    let riskLevel: ScreeningResult['riskLevel'] = 'LOW';
    if (matches.length > 0) {
        const maxScore = Math.max(...matches.map(m => m.matchScore));
        if (maxScore >= 0.95) riskLevel = 'CRITICAL';
        else if (maxScore >= 0.85) riskLevel = 'HIGH';
        else if (maxScore >= 0.70) riskLevel = 'MEDIUM';
        else riskLevel = 'LOW'; // Low confidence matches
    }

    // Only fail if high-confidence match
    const passed = !matches.some(m => m.matchScore >= 0.85);

    console.log(`[AML] Result: ${passed ? 'PASSED' : 'FLAGGED'} (${matches.length} matches, risk: ${riskLevel})`);

    return {
        passed,
        matches,
        riskLevel,
        screenedAt: new Date(),
        provider: 'SELF_CODED'
    };
}

/**
 * Quick check if user needs enhanced due diligence
 */
export function requiresEDD(
    transactionVolume: number,
    highRiskCountry: boolean,
    pepStatus: boolean
): boolean {
    if (pepStatus) return true;
    if (highRiskCountry) return true;
    if (transactionVolume > 15000) return true; // €15,000 EU threshold
    return false;
}

/**
 * Check if a country code is high-risk
 */
export function isHighRiskCountry(countryCode: string): boolean {
    return HIGH_RISK_COUNTRIES.includes(countryCode.toUpperCase());
}
