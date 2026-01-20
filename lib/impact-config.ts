// Impact configuration constants (can be imported by both server actions and client components)

// Impact coefficients per project type (estimates based on industry standards)
export const IMPACT_COEFFICIENTS = {
    REAL_ESTATE: {
        co2PerEuro: 0.00015, // kg CO2 saved per euro invested
        jobsPerEuro: 0.00001, // jobs supported per 100k€
        housingPer10k: 0.1, // housing units per 10k€
    },
    RENOVATION: {
        co2PerEuro: 0.0005, // Higher CO2 savings for renovations
        jobsPerEuro: 0.000015,
        housingPer10k: 0.15,
    },
    GREEN_ENERGY: {
        co2PerEuro: 0.001, // Highest CO2 impact
        jobsPerEuro: 0.00002,
        housingPer10k: 0,
    },
    BUSINESS: {
        co2PerEuro: 0.0001,
        jobsPerEuro: 0.00003, // Higher job creation
        housingPer10k: 0,
    },
    AGRICULTURE: {
        co2PerEuro: 0.0003,
        jobsPerEuro: 0.000025,
        housingPer10k: 0,
    },
    OTHER: {
        co2PerEuro: 0.0001,
        jobsPerEuro: 0.00001,
        housingPer10k: 0.05,
    }
};

// Project type labels for display
export const PROJECT_TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
    REAL_ESTATE: { label: "Immobilier", icon: "Building2", color: "orange" },
    RENOVATION: { label: "Rénovation", icon: "Home", color: "amber" },
    GREEN_ENERGY: { label: "Énergie Verte", icon: "Leaf", color: "emerald" },
    BUSINESS: { label: "Commerce", icon: "Briefcase", color: "blue" },
    AGRICULTURE: { label: "Agriculture", icon: "Wheat", color: "lime" },
    OTHER: { label: "Autre", icon: "Package", color: "zinc" }
};

// Types
export interface ImpactStats {
    co2Saved: number; // in tons
    jobsSupported: number;
    housingRenovated: number;
    totalInvested: number;
    projectCount: number;
    impactByCategory: Record<string, {
        amount: number;
        co2: number;
        jobs: number;
    }>;
}
