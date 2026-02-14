
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');

try {
    const content = fs.readFileSync(envPath, 'utf8');
    console.log('--- .env.local content check ---');

    const lines = content.split('\n');
    let hasQuotes = false;

    for (const line of lines) {
        if (line.trim().startsWith('NEXTAUTH_URL=')) {
            console.log('Found NEXTAUTH_URL line:', line.trim());
            if (line.includes("'") || line.includes('"')) {
                hasQuotes = true;
                console.log('⚠️  Potential issue: Quotes detected in NEXTAUTH_URL.');
            }
        }
        if (line.trim().startsWith('NEXTAUTH_SECRET=')) {
            console.log('Found NEXTAUTH_SECRET line:', line.trim());
            if (line.includes("'") || line.includes('"')) {
                hasQuotes = true;
                console.log('⚠️  Potential issue: Quotes detected in NEXTAUTH_SECRET.');
            }
        }
    }

    if (hasQuotes) {
        console.log('\nRECOMMENDATION: Remove quotes from .env.local values.');
    } else {
        console.log('\nFormat looks okay regarding quotes.');
    }

} catch (err) {
    console.error('Error reading .env.local:', err.message);
}
