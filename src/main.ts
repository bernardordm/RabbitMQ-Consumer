import express from 'express';
import SmsConsumer from './consumers/sms.consumer';
import dotenv from 'dotenv';

dotenv.config();

async function startConsumer() {
  // Inicializar o consumidor de SMS
  const uri = process.env.RABBITMQ_URL || 'amqp://localhost';
  const queue = 'sms_queue';
  const smsConsumer = new SmsConsumer(uri, queue);

  try {
    await smsConsumer.start();
    console.log('Connected to RabbitMQ');
    smsConsumer.consume((message) => {
      const content = message.content.toString();
      console.log(`Received message: ${content}`);
      // Process the message here
    });
  } catch (error) {
    console.error('Failed to connect to RabbitMQ', error);
    process.exit(1); // Exit the process with an error code
  }
}

async function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;

  app.get('/', (req, res) => {
    res.send('Server is running');
  });

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

async function bootstrap() {
  await startConsumer();
  await startServer();
}

bootstrap();