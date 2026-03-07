const { Centrifuge } = require('centrifuge');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

const TOKEN_SECRET = process.env.CENTRIFUGO_TOKEN_SECRET || 'centrifugo_token_secret';
const CENTRIFUGO_URL = 'wss://realtime.soukloop.com/connection/websocket';

const token = jwt.sign({
    sub: 'test-user',
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
}, TOKEN_SECRET);

console.log('Connecting to', CENTRIFUGO_URL);

const client = new Centrifuge(CENTRIFUGO_URL, {
    token: token,
    websocket: WebSocket
});

client.on('connected', (ctx) => {
    console.log('CONNECTED', ctx);
    client.disconnect();
});

client.on('disconnected', (ctx) => {
    console.log('DISCONNECTED', ctx);
    client.disconnect();
});

client.on('error', (err) => {
    console.log('ERROR', err);
});

client.connect();
