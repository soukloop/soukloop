const fetch = require('node-fetch');

const routes = [
    'http://localhost:3000/api/products',
    'http://localhost:3000/api/profile',
    'http://localhost:3000/api/user/verification'
];

async function check() {
    for (const route of routes) {
        try {
            console.log(`Checking ${route}...`);
            const res = await fetch(route);
            console.log(`Status: ${res.status}`);
            if (res.status === 500) {
                const text = await res.text();
                console.log(`Error Body: ${text}`);
            }
        } catch (e) {
            console.error(`Failed to reach ${route}: ${e.message}`);
        }
    }
}

check();
