import {io} from 'socket.io-client' 
export const base_url = process.env.BASE_URL || 'http://localhost:5000'
const socket = io(base_url); // Replace with your server URL
export default socket;