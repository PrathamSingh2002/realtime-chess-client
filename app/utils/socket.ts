'use client'
import {io} from 'socket.io-client' 
export const base_url = process.env.NEXT_PUBLIC_BASE_URL
console.log(base_url)
const socket = io(base_url,{
    transports:['websocket'],
    withCredentials:true
}); // Replace with your server URL
export default socket;