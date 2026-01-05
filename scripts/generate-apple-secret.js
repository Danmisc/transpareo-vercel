const { SignJWT } = require('jose');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function generate() {
    console.log("🍎 Générateur de Secret Apple Sign-In");
    console.log("-----------------------------------");

    try {
        const teamId = await question("Team ID (ex: A1B2C3D4E5): ");
        const keyId = await question("Key ID (ex: 1A2B3C4D5E): ");
        const clientId = await question("Service ID / Client ID (ex: com.app.service): ");
        const keyPath = await question("Chemin vers le fichier .p8 (ex: ./AuthKey.p8): ");

        let privateKey;
        try {
            // Remove 'file:///' prefix if user pasted it
            const cleanPath = keyPath.replace(/^file:\/\/\//, '').replace(/^"|"$/g, '');
            privateKey = fs.readFileSync(cleanPath, 'utf8');
        } catch (e) {
            console.error(`❌ Impossible de lire le fichier: ${e.message}`);
            rl.close();
            return;
        }

        const secret = await new SignJWT({})
            .setAudience('https://appleid.apple.com')
            .setIssuer(teamId)
            .setIssuedAt()
            .setExpirationTime('180d') // Valid for 6 months
            .setSubject(clientId)
            .setProtectedHeader({ alg: 'ES256', kid: keyId })
            .sign(importPrivateKey(privateKey));

        console.log("\n✅ VOTRE SECRET APPLE (AUTH_APPLE_SECRET) :");
        console.log("-----------------------------------");
        console.log(secret);
        console.log("-----------------------------------");
        console.log("⚠️ Copiez ce secret dans votre fichier .env");
        console.log("⚠️ Il expirera dans 6 mois.");

    } catch (err) {
        console.error("Erreur:", err);
    } finally {
        rl.close();
    }
}

// Helper to convert PEM to KeyObject if needed, but jose usually takes PEM string directly?
// 'jose' library 'importPKCS8' is typically used.
// Let's assume standard crypto or try/catch.
// Actually, 'importPKCS8' is async.

const { importPKCS8 } = require('jose');

async function importPrivateKey(pem) {
    return await importPKCS8(pem, 'ES256');
}

generate();
