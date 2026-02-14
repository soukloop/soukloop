// Using native fetch (available in Node.js 18+)

async function main() {
    const email = 'test_auto_verify@example.com';
    const code = '197275'; // Code from last_otp.txt

    console.log(`Verifying ${email} with code ${code}...`);

    const response = await fetch('http://localhost:3001/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
    });

    const data = await response.json();
    console.log('Response:', data);

    if (response.ok) {
        console.log('Verification Successful!');
    } else {
        console.log('Verification Failed.');
    }
}

main();
