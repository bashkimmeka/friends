import mongoose, { Schema } from 'mongoose';

const user = new Schema({
    emri: String,
    mbiemri: String,
    image: String,
    email:String,
    likesCount: Number,
    dislikesCount: Number,
    createdAt: { type:Date,  default:Date.now },
    updatedAt: { type:Date,  default:Date.now },
}, { collection: "user" });

export default mongoose.model("users", user);