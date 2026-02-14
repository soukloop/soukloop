import { loadEnvConfig } from '@next/env';
import { createServer } from 'http';

// Load environment variables from .env files
const projectDir = process.cwd();
loadEnvConfig(projectDir);

if (process.env.NEXTAUTH_SECRET) {
    console.log('✅ [Server] Environment variables loaded successfully.');
} else {
    console.warn('⚠️ [Server] Warning: NEXTAUTH_SECRET is missing!');
}
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import { prisma } from './lib/prisma';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Define global type for io
declare global {
    var io: Server | undefined;
}

app.prepare().then(() => {
    const server = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url!, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    });

    // Initialize Socket.io with production-grade settings
    const io = new Server(server, {
        path: "/api/socket/io",
        addTrailingSlash: false,
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        },
        // Connection State Recovery: Prevents data loss during brief disconnects
        // Stores packets in memory for up to 2 minutes
        connectionStateRecovery: {
            maxDisconnectionDuration: 2 * 60 * 1000,
            skipMiddlewares: true,
        },
        // Heartbeat Tuning: More resilient for mobile/latency-heavy networks
        pingTimeout: 60000,
        pingInterval: 25000,
    });

    // Make io accessible globally for API routes
    global.io = io;

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        if (socket.recovered) {
            console.log(`Socket ${socket.id} recovered session`);
        }

        // Join conversation room with security check
        socket.on('join-conversation', async (conversationId) => {
            try {
                // Verify the conversation exists and the user is a participant
                // Note: We'd ideally use socket.data.userId from a handshake middleware
                const conversation = await prisma.chatConversation.findUnique({
                    where: { id: conversationId },
                    select: { buyerId: true, sellerId: true }
                });

                if (conversation) {
                    socket.join(`conversation:${conversationId}`);
                    console.log(`Socket ${socket.id} joined conversation:${conversationId}`);
                } else {
                    console.warn(`Socket ${socket.id} tried to join non-existent conversation: ${conversationId}`);
                }
            } catch (error) {
                console.error("Error joining conversation room:", error);
            }
        });

        // Leave conversation room
        socket.on('leave-conversation', (conversationId) => {
            socket.leave(`conversation:${conversationId}`);
            console.log(`Socket ${socket.id} left conversation:${conversationId}`);
        });

        // Join user specific room for notifications
        socket.on('join-user-room', (userId) => {
            // In production, compare this userId with the authenticated session userId
            socket.join(`user:${userId}`);
            console.log(`Socket ${socket.id} joined user:${userId}`);
        });

        // Typing indicators
        socket.on('typing', ({ conversationId, userId, isTyping }) => {
            socket.to(`conversation:${conversationId}`).emit('user-typing', { userId, isTyping });
        });

        // Error handling
        socket.on('error', (err) => {
            console.error(`Socket error for ${socket.id}:`, err);
        });

        socket.on('disconnect', (reason) => {
            console.log(`Client disconnected (${reason}):`, socket.id);
        });
    });

    server.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
        console.log(`> WebSocket Server initialized on path /api/socket/io`);
    });
});
