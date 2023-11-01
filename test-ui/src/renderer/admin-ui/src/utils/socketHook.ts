import { SocketContext } from './socketConfig';
import { useContext } from 'react';

export const useSocket = () => {
    const socket = useContext(SocketContext);
    return socket;
};