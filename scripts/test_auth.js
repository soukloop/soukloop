
const http = require('http');

console.log('Testing /api/auth/session endpoint...');

const req = http.request('http://localhost:3000/api/auth/session', (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('BODY START (First 500 chars):');
        console.log(data.substring(0, 500));
        console.log('BODY END');

        if (res.statusCode === 200) {
            try {
                JSON.parse(data);
                console.log('✅ Response is valid JSON.');
            } catch (e) {
                console.log('❌ Response is NOT valid JSON.');
            }
        }
    });
});

req.on('error', (e) => {
    console.error(`❌ Request failed: ${e.message}`);
});

req.end();
