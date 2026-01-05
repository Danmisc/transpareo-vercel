const https = require('https');
const fs = require('fs');
const path = require('path');

// Read .env manually to get the key
try {
    const envPath = path.resolve(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=(.+)/);

    if (!match) {
        console.error("❌ KEY NOT FOUND in .env");
        process.exit(1);
    }

    const apiKey = match[1].trim();
    console.log(`🔑 Key found: ${apiKey.substring(0, 10)}...`);

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            const json = JSON.parse(data);
            if (json.error) {
                console.error("❌ API ERROR:", json.error);
            } else {
                console.log("\n✅ AVAILABLE MODELS:");
                json.models.forEach(m => {
                    if (m.name.includes("gemini")) {
                        console.log(`- ${m.name.replace('models/', '')} (${m.supportedGenerationMethods.join(', ')})`);
                    }
                });
            }
        });
    }).on('error', (err) => {
        console.error("Network Error:", err);
    });

} catch (e) {
    console.error("Error:", e.message);
}
