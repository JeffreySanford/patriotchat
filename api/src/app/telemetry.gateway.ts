import { Logger, OnModuleDestroy } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Subscription } from 'rxjs';
import { PipelineStageUpdate } from '@patriotchat/shared';
import { PipelineTelemetryService } from './pipeline-telemetry.service';

const TELEMETRY_ORIGINS: string[] = [
  'http://localhost:4200',
  'http://127.0.0.1:4200',
  'http://localhost:4205',
  'http://127.0.0.1:4205',
];

@WebSocketGateway({
  namespace: '/telemetry',
  transports: ['websocket', 'polling'],
  cors: {
    origin: TELEMETRY_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class TelemetryGateway
  implements OnGatewayInit, OnModuleDestroy, OnGatewayConnection
{
  @WebSocketServer()
  server!: Server;

  private subscription?: Subscription;
  private readonly logger: Logger = new Logger(TelemetryGateway.name);

  constructor(private readonly telemetry: PipelineTelemetryService) {}

  afterInit(): void {
    this.logger.log('Telemetry socket server ready on /telemetry/socket.io');
    this.subscription = this.telemetry.updates$.subscribe(
      (updates: PipelineStageUpdate[]) => {
        const latest: PipelineStageUpdate | undefined = updates.at(-1);
      if (latest) {
        this.server.emit('stage', latest);
      }
    });
  }

  handleConnection(socket: Socket): void {
    this.logger.debug(`Telemetry client connected (id=${socket.id})`);
    this.telemetry.getLatest().forEach((update: PipelineStageUpdate) =>
      socket.emit('stage', update),
    );
    socket.on('disconnect', () => {
      this.logger.debug(`Telemetry client disconnected (id=${socket.id})`);
    });
  }

  onModuleDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
