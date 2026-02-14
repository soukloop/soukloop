
import { Centrifuge } from 'centrifuge';
import WebSocket from 'ws';
import jwt from 'jsonwebtoken';

// Use same secret as in server config
const TOKEN_SECRET = 'centrifugo_token_secret';
const CENTRIFUGO_URL = 'ws://127.0.0.1:8000/connection/websocket';

async function testConnection() {
    console.log(`Connecting to ${CENTRIFUGO_URL}...`);

    // Generate a token
    const token = jwt.sign({
        sub: 'test-user',
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
    }, TOKEN_SECRET);

    console.log('Generated token for test-user');

    // Need to provide WebSocket implementation for Node environment
    // centrifuge@5 requires a websocket polyfill in Node if not global
    // But let's see if it picks up 'ws' from global or if we need to pass it.
    // Actually, centrifuge 5.x detects environment. 
    // In Node it requires 'ws' package to be passed or globally available.
    // Let's rely on 'ws' package being installed? 'centrifuge' package usually has 'ws' as dep or peerDep?
    // Checking package.json... 'centrifuge' is installed. 'ws' is NOT explicitly in deps.
    // But 'socket.io' is there.

    // We might need to install 'ws' for this script if it's not present.
    // But let's try assuming it might work or we use what's available.
    // Wait, the error is in browser (SocketProvider).
    // The script is running in Node.
    // If 'ws' is missing, the script will fail with a different error.

    // Let's just try basic WebSocket connection first using 'ws' package if likely available (implied by centrifuge devDep?)
    // Actually, let's use the 'centrifuge' package.

    try {
        // @ts-ignore
        const client = new Centrifuge(CENTRIFUGO_URL, {
            token: token,
            // In node, we might need to pass websocket constructor
            websocket: WebSocket
        });

        client.on('connected', (ctx) => {
            console.log('CONNECTED successfully!', ctx);
            client.disconnect();
            process.exit(0);
        });

        client.on('error', (err) => {
            console.error('CONNECTION ERROR:', err);
            process.exit(1);
        });

        client.on('disconnected', (ctx) => {
            console.log('Disconnected:', ctx);
        });

        client.connect();

        // Timeout
        setTimeout(() => {
            console.error('Timeout waiting for connection');
            client.disconnect();
            process.exit(1);
        }, 5000);

    } catch (e) {
        console.error('Script error:', e);
    }
}

testConnection();
