import bcrypt from 'bcrypt';
import { model, Schema, Model } from 'mongoose';
import { IPassport } from '../model/passport';

const PassportSchema = new Schema({
    password: String,
    userId: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { collection: "passport" });

export interface PassportModel extends Model<IPassport>{
    createPassport(password: string, userId: string): Promise<any>
}

PassportSchema.statics.createPassport = function (password, userId) {
    console.log('user: '+userId)
    console.log('password: '+password)
    const salt = bcrypt.genSaltSync(10);
    return this.create({
        password: bcrypt.hashSync(password, salt),
        userId
    })
}
export const PassportDB: PassportModel = model<IPassport, PassportModel>('passport', PassportSchema);
//export default model<PassportModel>("passport", PassportSchema);