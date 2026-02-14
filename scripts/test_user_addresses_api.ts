
async function main() {
    const BASE_URL = 'http://localhost:3000/api'; // Adjust port if needed

    console.log('Testing User Addresses API...');

    // 1. You need to be authenticated for this to work. 
    // This script assumes it's running in an environment where it can access the session or you'd need to add headers.
    // Since we are running outside the browser context, we would need a valid session cookie.

    // For now, this script serves as a template for you to run or use in Postman.

    console.log('NOTE: These endpoints require authentication. If running from a standalone script without cookies, they will return 401.');

    // GET All
    try {
        console.log('GET /user-addresses');
        const res = await fetch(`${BASE_URL}/user-addresses`);
        console.log('Status:', res.status);
        if (res.ok) {
            const data = await res.json();
            console.log('Data:', JSON.stringify(data, null, 2));
        } else {
            console.log('Error:', await res.text());
        }
    } catch (e) {
        console.error('Failed to connect:', e);
    }

    // POST New
    try {
        console.log('\nPOST /user-addresses');
        const res = await fetch(`${BASE_URL}/user-addresses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                addressLine: '456 Test Ave',
                city: 'Testville',
                state: 'TS',
                country: 'Testland',
                postalCode: '67890',
                isDefault: true
            })
        });
        console.log('Status:', res.status);
        if (res.ok) {
            const data = await res.json();
            console.log('Data:', JSON.stringify(data, null, 2));
        } else {
            console.log('Error:', await res.text());
        }
    } catch (e) {
        console.error('Failed to connect:', e);
    }
}

main();
