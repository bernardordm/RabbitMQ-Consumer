import { createRabbitMQChannel } from '../config/rabbitmq.config';

export class SmsConsumer {
    private channel;
    private smsService: SmsService;


constructor(){
    this.smsService = new SmsService();
    this.init();
}

async init() {
    try {
      console.log('Creating RabbitMQ channel');
      this.channel = await createRabbitMQChannel();
      this.consumeMessages();
    } catch (error) {
      console.error('Error initializing SmsConsumer:', error);
    }
  }

  async consumeMessages(){
    this.channel.consume('sms_queue', async (msg) => {
        if(msg!=null){
            const content = JSON.parse(msg.content.toString());
            console.log("Processando mensagem", content);
            await this.smsService.processSms(content.phoneNumber, content.message);
            this.channel.ack(msg);
        }
    });
  }
}