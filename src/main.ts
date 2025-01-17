import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RabbitmqServer } from './rabbitmq/rabbitmq-server';
import { SmppService } from './smpp/smpp-service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);

  const rabbitmqServer = app.get(RabbitmqServer);
  await rabbitmqServer.start();

  const smppService = app.get(SmppService);
  await smppService.onModuleInit();

  rabbitmqServer.consume('sms_queue', async (message) => {
    const content = message.content.toString();
    console.log(`Received message: ${content}`);

    let parsedMessage;
    try {
      parsedMessage = JSON.parse(content);
    } catch (error) {
      console.error('Failed to parse message content:', error);
      return;
    }

    const { phoneNumber, message: text } = parsedMessage;
    if (!phoneNumber || !text) {
      console.error('Invalid message format:', parsedMessage);
      return;
    }

    try {
      await smppService.sendSMS(phoneNumber, text);
      console.log(`Message sent to ${phoneNumber}: ${text}`);
    } catch (error) {
      console.error(`Failed to send message to ${phoneNumber}: ${error.message}`);
    }
  });
}

bootstrap();