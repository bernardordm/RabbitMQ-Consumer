import express from 'express';
import SmsConsumer from './consumers/sms.consumer';
import dotenv from 'dotenv';
import connectDB from './config/mongoose.config';
import { Sms } from './models/sms.model';

dotenv.config();

async function startConsumer() {
  const uri = process.env.RABBITMQ_URL || 'amqp://localhost';
  const queue = 'sms_queue';
  const smsConsumer = new SmsConsumer(uri, queue);

  try {
    await smsConsumer.start();
    console.log('Connected to RabbitMQ');
    smsConsumer.consume(async (message) => {
      const content = message.content.toString();
      console.log(`Received message: ${content}`);
      // Process the message and save to MongoDB
      const smsData = JSON.parse(content);
      const sms = new Sms(smsData);
      await sms.save();
      console.log('SMS saved to MongoDB');
    });
  } catch (error) {
    console.error('Failed to connect to RabbitMQ', error);
    process.exit(1); // Exit the process with an error code
  }
}

async function startServer() {
  const app = express();
  const port = process.env.PORT || 3002;

  app.get('/', (req, res) => {
    res.send('Server is running');
  });

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

async function bootstrap() {
  await connectDB();
  await startConsumer();
  await startServer();
}

bootstrap();