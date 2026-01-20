import crypto from 'crypto';

// These should be in .env
// We trim to avoid issues with copy-paste spaces
const SUMSUB_APP_TOKEN = (process.env.SUMSUB_APP_TOKEN || 'sbx_fake_token').trim();
const SUMSUB_SECRET_KEY = (process.env.SUMSUB_SECRET_KEY || 'sbx_fake_secret').trim();
const SUMSUB_BASE_URL = 'https://api.sumsub.com';
const DEFAULT_LEVEL_NAME = (process.env.SUMSUB_LEVEL_NAME || 'basic-kyc-level').trim();

export async function createSumsubAccessToken(userId: string, levelName: string = DEFAULT_LEVEL_NAME) {
    if (!process.env.SUMSUB_APP_TOKEN) {
        console.warn("Missing SUMSUB_APP_TOKEN. Returning mock token for Dev UI.");
        return "mock_token_" + userId;
    }

    const path = `/resources/accessTokens?userId=${userId}&levelName=${levelName}`;
    const method = 'POST';
    const ts = Math.floor(Date.now() / 1000);

    const signature = crypto
        .createHmac('sha256', SUMSUB_SECRET_KEY)
        .update(ts + method + path)
        .digest('hex');

    const config = {
        method,
        headers: {
            'X-App-Token': SUMSUB_APP_TOKEN,
            'X-App-Access-Sig': signature,
            'X-App-Access-Ts': ts.toString(),
            'Content-Type': 'application/json'
        }
    };

    try {
        const response = await fetch(SUMSUB_BASE_URL + path, config);
        const data = await response.json();

        if (!response.ok) {
            console.error("Sumsub API Error Response:", data);
            throw new Error(`Sumsub API (${response.status}): ${data.description || data.message || "Unknown error"}`);
        }

        return data.token;
    } catch (error: any) {
        console.error("Sumsub Token Gen Error:", error.message);
        throw error;
    }
}

export async function getSumsubApplicantStatus(externalUserId: string) {
    if (!process.env.SUMSUB_APP_TOKEN) return null;

    const ts = Math.floor(Date.now() / 1000);
    const method = 'GET';
    const lookupPath = `/resources/applicants/-;externalUserId=${externalUserId}/one`;

    const signature = crypto
        .createHmac('sha256', SUMSUB_SECRET_KEY)
        .update(ts + method + lookupPath)
        .digest('hex');

    const config = {
        method,
        headers: {
            'X-App-Token': SUMSUB_APP_TOKEN,
            'X-App-Access-Sig': signature,
            'X-App-Access-Ts': ts.toString(),
            'Content-Type': 'application/json'
        }
    };

    try {
        const response = await fetch(SUMSUB_BASE_URL + lookupPath, config);
        const data = await response.json();
        if (!response.ok) throw new Error("API Error");
        return data;
    } catch (e) {
        console.error("Sumsub Status Check Error", e);
        return null;
    }
}
