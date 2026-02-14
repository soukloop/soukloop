const { Client } = require('pg');

const passwords = [
    'admin',
    'password',
    'root',
    '1234',
    '12345',
    'postgres',
    'hajisarwar',
    '', // empty password
];

async function checkPassword(password) {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'postgres', // default db always exists
        password: password,
        port: 5432,
    });

    try {
        await client.connect();
        console.log(`SUCCESS: The password is '${password}'`);
        await client.end();
        return true;
    } catch (err) {
        // console.log(`Failed with '${password}': ${err.message}`);
        return false;
    }
}

async function run() {
    console.log("Checking common passwords...");
    for (const p of passwords) {
        if (await checkPassword(p)) {
            process.exit(0);
        }
    }
    console.log("FAILURE: None of the common passwords worked.");
    process.exit(1);
}

run();
