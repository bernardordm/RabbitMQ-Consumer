import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as smpp from 'smpp';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from '../schemas/messsage.schema';

@Injectable()
export class SmppService implements OnModuleInit, OnModuleDestroy {
  private session: smpp.Session;

  constructor(@InjectModel(Message.name) private messageModel: Model<MessageDocument>) {}

  async onModuleInit() {
    this.connect();
  }

  async onModuleDestroy() {
    this.session.close();
  }

  private connect() {
    this.session = new smpp.Session({ host: process.env.SMPP_HOST, port: process.env.SMPP_PORT });

    this.session.on('error', (error) => {
      console.error('SMPP connection error:', error);
      this.reconnect();
    });

    this.session.on('close', () => {
      console.log('SMPP connection closed');
      this.reconnect();
    });

    this.session.bind_transceiver(
      {
        system_id: process.env.SMPP_SYSTEM_ID,
        password: process.env.SMPP_PASSWORD,
      },
      (pdu) => {
        if (pdu.command_status === 0) {
          console.log('SMPP connection established');
        } else {
          console.error('Failed to establish SMPP connection', pdu);
          this.reconnect();
        }
      },
    );
  }

  private reconnect() {
    setTimeout(() => {
      console.log('Reconnecting to SMPP...');
      this.connect();
    }, 5000); // Reconnect after 5 seconds
  }

  async sendSMS(destination: string, message: string) {
    return new Promise<void>((resolve, reject) => {
      this.session.submit_sm(
        {
          destination_addr: destination,
          short_message: message,
        },
        async (pdu) => {
          if (pdu.command_status === 0) {
            console.log('Message sent successfully');
            await this.messageModel.updateOne({ phoneNumber: destination, message }, { status: 'sent' });
            resolve();
          } else {
            await this.messageModel.updateOne({ phoneNumber: destination, message }, { status: 'failed' });
            reject(new Error('Failed to send message'));
          }
        },
      );
    });
  }
}