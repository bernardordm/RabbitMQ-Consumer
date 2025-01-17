import { Schema, model, Document } from "mongoose";

export interface SmsDocument extends Document {
    phoneNumber: string;
    message: string;
    status: string;
    createdAt: Date;
}

const smsSchema = new Schema<SmsDocument>({
    phoneNumber: {type: String, required: true},
    message: {type: String, required: true},
    status: {type: String, default: 'pending'},
    createdAt: {type: Date, default: Date.now},
});

export const Sms = model<SmsDocument>('Sms', smsSchema);