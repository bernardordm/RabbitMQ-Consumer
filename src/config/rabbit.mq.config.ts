import * as amqp from 'amqplib'
import { connect } from 'http2';

export const rabbitmqConfig = {
    url: process.env.RABBITMQ_URL || 'amqp://localhost',
    queue:'sms_queue',
};

export async function createRabbitMQChannel(){
    try{
        const connection = await amqp.connect(rabbitmqConfig.url, {
            rejectUnauthorized: true
        });
   

    const channel = await connection.createChannel();
    await channel.assertQueue(rabbitmqConfig.queue, {durable: true});
    console.log ('RabbitMQ connected and queue asserted');
    return channel;
}

    catch (error){
        console.error('Error connecting to RabbitMQ', error);
        throw error;
    }
    
}