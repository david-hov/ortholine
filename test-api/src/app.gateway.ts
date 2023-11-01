import { Logger } from '@nestjs/common';
import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway(4001, { transport: ['websocket'] })
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() wss: Server;

    private logger = new Logger('AppGateway');

    handleMessage(): void {
        this.wss.emit('msgToClient');
    }

    handleMessageGetToken(payload: any): void {
        this.wss.emit('msgToClientGetToken', payload);
    }

    handleMessageCloseModalsWhenUpdate(): void {
        this.wss.emit('msgToClientCloseModalsWhenUpdate');
    }

    handleMessageSuperNotification(): void {
        this.wss.emit('msgToSuperNotification');
    }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected ${client.id}`);
        client.emit('connection', 'WebSocket successfully connected');
    }

    handleDisconnect(client: Socket, ...args: any[]) {
        this.logger.log(`Client disconnected ${client.id}`);
    }
}