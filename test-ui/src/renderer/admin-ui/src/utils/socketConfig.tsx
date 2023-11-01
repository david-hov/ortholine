// @ts-ignore
import * as io from 'socket.io-client'
import { useEffect, useState, createContext } from 'react';

const getServerIp = () => {
    const apiUrl = localStorage.getItem('engine-socket-ip');
    return apiUrl;
};

const socket = io(getServerIp());

export const SocketContext = createContext(socket);

interface ISocketProvider {
    children: any;
}

export const SocketProvider = (props: ISocketProvider) => {
    const [ws, setWs] = useState(socket);

    useEffect(() => {
        const onClose = () => {
            setTimeout(() => {
                setWs(io(getServerIp()));
            }, 6000000);
        };

        ws.addEventListener('close', onClose);

        return () => {
            ws.removeEventListener('close', onClose);
        };
    }, [ws, setWs]);

    return (
        <SocketContext.Provider value={ws}>{props.children}</SocketContext.Provider>
    )
};