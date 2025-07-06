"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUser } from '@clerk/nextjs';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    if (user?.id) {
      // Initialize socket connection
      const newSocket = io(process.env.NODE_ENV === 'production' 
        ? process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin
        : window.location.origin, {
        path: '/api/socket.io',
        transports: ['websocket', 'polling'],
      });

      newSocket.on('connect', () => {
        console.log('Connected to Socket.io server');
        setIsConnected(true);
        
        // Join user to their personal room for notifications
        newSocket.emit('join-user', user.id);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from Socket.io server');
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [user?.id]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
