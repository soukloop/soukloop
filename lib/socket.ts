import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer, Socket } from 'socket.io'

let io: SocketIOServer | null = null

export function initSocket(httpServer: HTTPServer): SocketIOServer {
    if (io) return io

    io = new SocketIOServer(httpServer, {
        cors: {
            origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true
        },
        path: '/api/socket'
    })

    io.on('connection', (socket: Socket) => {
        console.log('Client connected:', socket.id)

        // Join a conversation room
        socket.on('join-conversation', (conversationId: string) => {
            socket.join(`conversation:${conversationId}`)
            console.log(`Socket ${socket.id} joined conversation:${conversationId}`)
        })

        // Leave a conversation room
        socket.on('leave-conversation', (conversationId: string) => {
            socket.leave(`conversation:${conversationId}`)
            console.log(`Socket ${socket.id} left conversation:${conversationId}`)
        })

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id)
        })
    })

    return io
}

export function getIO(): SocketIOServer | null {
    return io
}

// Emit new message to conversation room
export function emitNewMessage(conversationId: string, message: any) {
    if (io) {
        io.to(`conversation:${conversationId}`).emit('new-message', message)
    }
}

// Emit typing indicator
export function emitTyping(conversationId: string, userId: string, isTyping: boolean) {
    if (io) {
        io.to(`conversation:${conversationId}`).emit('user-typing', { userId, isTyping })
    }
}
