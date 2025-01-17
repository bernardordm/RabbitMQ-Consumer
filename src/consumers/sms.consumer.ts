import { Connection, Channel, connect, Message } from 'amqplib';
import { Sms } from '../models/sms.model';

export default class SmsConsumer {
  private conn: Connection;
  private channel: Channel;

  constructor(private uri: string, private queue: string) {}

  async start(): Promise<void> {
    this.conn = await connect(this.uri);
    this.channel = await this.conn.createChannel();
    await this.channel.assertQueue(this.queue, { durable: true });
  }

  async consume(callback: (message: Message) => void) {
    return this.channel.consume(this.queue, async (message) => {
      if (message) {
        await callback(message);
        this.channel.ack(message);
      }
    });
  }
}

// Exemplo de uso
const uri = process.env.RABBITMQ_URL || 'amqp://localhost';
const queue = 'sms_queue';

const smsConsumer = new SmsConsumer(uri, queue);
smsConsumer.start().then(() => {
  smsConsumer.consume(async (message) => {
    const content = message.content.toString();
    console.log(`Received message: ${content}`);

    // Processar a mensagem e salvar no MongoDB
    const smsData = JSON.parse(content);
    const sms = new Sms(smsData);
    await sms.save();
    console.log('SMS saved to MongoDB');
  });
});