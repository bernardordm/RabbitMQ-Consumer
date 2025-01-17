import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RabbitmqServer } from './rabbitmq/rabbitmq-server';
import { SmppService } from './smpp/smpp-service';
import { Message, MessageSchema } from './schemas/messsage.schema';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
  ],
  providers: [RabbitmqServer, SmppService, ConfigService],
})
export class AppModule {}