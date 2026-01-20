// ========================================
// EU ECSPR COMPLIANCE CONSTANTS
// ========================================

export const COMPLIANCE_LIMITS = {
    ANNUAL_LIMIT_NO_KYC: 1000,          // €1000/year without full KYC
    WARNING_THRESHOLD: 1000,             // Warning for investments >€1000
    PATRIMONY_PERCENTAGE: 5,             // Warning if >5% of declared patrimony
    MIN_INVESTMENT: 10,                  // Minimum per investment
    MAX_INVESTMENT_UNVERIFIED: 100000,   // Max per investment
    COOLING_OFF_DAYS: 4,                 // Rétractation period (EU regulation)
};

// Investor sophistication levels
export type InvestorSophistication = "NON_SOPHISTICATED" | "SOPHISTICATED";
