'use client';

import { useEffect, useState } from 'react';
import { socket } from '../../../socket';

interface Transport {
  name: string;
}

interface SocketEngine {
  transport: Transport;
  on: (event: string, callback: (transport: Transport) => void) => void;
}

interface SocketManager {
  engine: SocketEngine;
}

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState('N/A');

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(
        (socket.io as unknown as SocketManager).engine.transport.name,
      );

      (socket.io as unknown as SocketManager).engine.on(
        'upgrade',
        (transport: Transport) => {
          setTransport(transport.name);
        },
      );
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport('N/A');
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return (
    <div>
      <p>Status: {isConnected ? '✅ connected' : '❌ disconnected'}</p>
      <p>Transport: {transport}</p>
    </div>
  );
}
