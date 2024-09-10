'use client'

import { io } from 'socket.io-client';

export const base_url = process.env.NEXT_PUBLIC_BASE_URL;
const socket = io(base_url);

export default socket;