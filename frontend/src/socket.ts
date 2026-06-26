'use client';

import io from 'socket.io-client';
import 'dotenv/config';

export const socket = io(
  process.env.NEXT_PUBLIC_PORT_URL || 'http://localhost:3001',
  {
    query: {
      userId: '123',
    },
  },
);
