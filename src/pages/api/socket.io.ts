import { Server } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get the server instance from the response object
  const httpServer = (res.socket as import('net').Socket & { server: import('http').Server & { io?: Server } }).server;

  if (httpServer.io) {
    console.log('Socket.io server already running');
    res.end();
    return;
  }

  const io = new Server(httpServer, {
    path: '/api/socket.io',
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  httpServer.io = io;

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Join user to their own room for personal notifications
    socket.on('join-user', (userId: string) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Handle like notifications
    socket.on('like-post', (data: { postId: number; userId: string; likedByUser: string }) => {
      // Send notification to post owner
      socket.to(`user-${data.userId}`).emit('notification', {
        type: 'like',
        message: `${data.likedByUser} liked your post`,
        postId: data.postId,
        timestamp: new Date().toISOString()
      });
    });

    // Handle comment notifications
    socket.on('comment-post', (data: { postId: number; userId: string; commentedByUser: string }) => {
      // Send notification to post owner
      socket.to(`user-${data.userId}`).emit('notification', {
        type: 'comment',
        message: `${data.commentedByUser} commented on your post`,
        postId: data.postId,
        timestamp: new Date().toISOString()
      });
    });

    // Handle follow notifications
    socket.on('follow-user', (data: { userId: string; followedByUser: string }) => {
      // Send notification to followed user
      socket.to(`user-${data.userId}`).emit('notification', {
        type: 'follow',
        message: `${data.followedByUser} started following you`,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  console.log('Socket.io server started');
  res.end();
}
