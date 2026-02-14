const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')
const { loadEnvConfig } = require('@next/env')

// Load environment variables from .env.local
loadEnvConfig('./')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
    const httpServer = createServer((req, res) => {
        const parsedUrl = parse(req.url, true)
        handle(req, res, parsedUrl)
    })

    // Initialize Socket.io
    const io = new Server(httpServer, {
        path: '/api/socket/io',
        cors: {
            origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true
        }
    })

    // Store io instance globally for use in API routes
    global.io = io

    io.on('connection', (socket) => {
        console.log('🔌 Client connected:', socket.id)

        // Join a conversation room
        socket.on('join-conversation', (conversationId) => {
            socket.join(`conversation:${conversationId}`)
            console.log(`📥 Socket ${socket.id} joined conversation:${conversationId}`)
        })

        // Join user specific room (for global notifications/list updates)
        socket.on('join-user-room', (userId) => {
            socket.join(`user:${userId}`)
            console.log(`👤 Socket ${socket.id} joined user:${userId}`)
        })

        // Leave a conversation room
        socket.on('leave-conversation', (conversationId) => {
            socket.leave(`conversation:${conversationId}`)
            console.log(`📤 Socket ${socket.id} left conversation:${conversationId}`)
        })

        // Typing indicator
        socket.on('typing', ({ conversationId, userId, isTyping }) => {
            socket.to(`conversation:${conversationId}`).emit('user-typing', { userId, isTyping })
        })

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('❌ Client disconnected:', socket.id)
        })
    })

    httpServer.listen(port, () => {
        console.log(`
🚀 Server ready on http://${hostname}:${port}
📡 Socket.io enabled for realtime chat
----------------------------------------
🔍 Env Check:
   NEXTAUTH_URL: ${process.env.NEXTAUTH_URL}
   NODE_ENV: ${process.env.NODE_ENV}
----------------------------------------
    `)
    })
})
