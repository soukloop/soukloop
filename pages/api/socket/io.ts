import { Server as NetServer } from 'http'
import { NextApiRequest } from 'next'
import { Server as ServerIO } from 'socket.io'

export const config = {
    api: {
        bodyParser: false,
    },
}

const ioHandler = (req: NextApiRequest, res: any) => {
    if (!res.socket.server.io) {
        const path = '/api/socket/io'
        const httpServer: NetServer = res.socket.server as any
        const io = new ServerIO(httpServer, {
            path: path,
            addTrailingSlash: false,
        })

        io.on('connection', (socket) => {
            console.log('Socket connected:', socket.id)

            socket.on('join-conversation', (conversationId: string) => {
                socket.join(`conversation:${conversationId}`)
                console.log(`Socket ${socket.id} joined conversation:${conversationId}`)
            })

            socket.on('join-user-room', (userId: string) => {
                socket.join(`user:${userId}`)
                console.log(`Socket ${socket.id} joined user:${userId}`)
            })

            socket.on('send-message', (message: any, conversationId: string) => {
                // Broadcast to everyone in the room INCLUDING sender (or excluding? usually excluding sender if they update optimistically)
                // User said: "Emit the socket event (for speed)" and "Push the new message to the local state array immediately (Optimistic Update)"
                // so we should probably broadcast to others: socket.to(...).emit(...)
                socket.to(`conversation:${conversationId}`).emit('new-message', message)
            })

            socket.on('typing', (conversationId: string, userId: string) => {
                socket.to(`conversation:${conversationId}`).emit('typing', userId)
            })

            socket.on('disconnect', () => {
                console.log('Socket disconnected:', socket.id)
            })
        })

        res.socket.server.io = io
        // @ts-ignore
        global.io = io
    }
    res.end()
}

export default ioHandler
