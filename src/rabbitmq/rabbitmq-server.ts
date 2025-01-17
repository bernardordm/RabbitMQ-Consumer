import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, Channel, Connection, Message } from 'amqplib';

@Injectable()
export class RabbitmqServer implements OnModuleInit {
  private connection: Connection;
  private channel: Channel;
  private readonly url: string;

  constructor(private readonly configService: ConfigService) {
    this.url = this.configService.get<string>('RABBITMQ_URL');
  }

  async onModuleInit() {
    await this.start();
  }

  async start() {
    this.connection = await connect(this.url);
    this.channel = await this.connection.createChannel();
  }

  async consume(queue: string, callback: (message: Message) => void) {
    return this.channel.consume(queue, (message) => {
      callback(message);
      this.channel.ack(message);
    });
  }
}