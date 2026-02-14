const fs = require('fs');
const path = require('path');

async function main() {
    try {
        const otpPath = path.join(process.cwd(), 'last_otp.txt');
        if (!fs.existsSync(otpPath)) {
            console.error("last_otp.txt not found");
            return;
        }
        const code = fs.readFileSync(otpPath, 'utf-8').trim();
        console.log(`Found OTP: ${code}`);

        const email = 'ahsan@example.comtest_auto_verify@example.com';

        console.log(`Verifying ${email}...`);

        const response = await fetch('http://localhost:3002/api/auth/verify-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code })
        });

        const text = await response.text();
        console.log('Status:', response.status);

        try {
            const data = JSON.parse(text);
            console.log('Response:', data);
        } catch (e) {
            console.log('Response (Text):', text.substring(0, 500));
        }

    } catch (err) {
        console.error("Script failed:", err);
    }
}

main();
