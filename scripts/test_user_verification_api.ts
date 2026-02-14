
async function main() {
    const BASE_URL = 'http://localhost:3000/api'; // Adjust port if needed

    console.log('Testing User Verification API...');

    // GET Status
    try {
        console.log('GET /user-verification');
        const res = await fetch(`${BASE_URL}/user-verification`);
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
        console.log('\nPOST /user-verification');
        const res = await fetch(`${BASE_URL}/user-verification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cnic: '99999-8888888-7',
                documentUrl: 'https://example.com/new-doc.pdf'
            })
        });
        console.log('Status:', res.status);
        if (res.ok) {
            const data = await res.json();
            console.log('Data:', JSON.stringify(data, null, 2));
        } else {
            console.log('Error (Expected if already exists):', await res.text());
        }
    } catch (e) {
        console.error('Failed to connect:', e);
    }
}

main();
