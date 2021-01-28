
import { Document } from 'mongoose';
export interface IPassport extends Document {
    password: string;
    userId: string;
}