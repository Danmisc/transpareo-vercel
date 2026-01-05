const https = require('https');
const fs = require('fs');
const path = require('path');

try {
    const envPath = path.resolve(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=(.+)/);

    if (!match) process.exit(1);

    const apiKey = match[1].trim();
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            const json = JSON.parse(data);
            const models = json.models
                .filter(m => m.supportedGenerationMethods.includes('generateContent'))
                .map(m => m.name.replace('models/', ''));

            fs.writeFileSync('gemini-models.txt', models.join('\n'));
            console.log("Models saved to gemini-models.txt");
        });
    });

} catch (e) { console.error(e); }
