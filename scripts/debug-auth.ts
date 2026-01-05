


console.log("Checking Auth Configuration...");

const required = [
    "AUTH_SECRET",
    "AUTH_GOOGLE_ID",
    "AUTH_GOOGLE_SECRET",
    "DATABASE_URL"
];

const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
    console.error("❌ MISSING ENV VARS:", missing);
    process.exit(1);
} else {
    console.log("✅ All required Env Vars present.");
}

async function verifyImport() {
    try {
        console.log("Attempting to import lib/auth...");
        const auth = await import("../lib/auth");
        console.log("✅ lib/auth imported successfully.");
        console.log("Handlers exported?", !!auth.handlers);
    } catch (e) {
        console.error("❌ Failed to import lib/auth:", e);
    }
}

verifyImport();
