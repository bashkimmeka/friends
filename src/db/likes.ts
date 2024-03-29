import { Model, model, Schema, Document } from "mongoose";
import { ILike } from "../model/like";
const LikeSchema = new Schema(
  {
    source: String,
    target: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "like" }
);

export interface IlikeInterface extends ILike, Document {}

export interface LikeModel extends Model<IlikeInterface> {
  hasLikedUser(like: any): Promise<any>;
  existingLikeUnlike(like: any): Promise<any>;
}

LikeSchema.statics.hasLikedUser = function (like: ILike) {
  return new Promise((resolve) => {
    this.find({ source: like.source, target: like.target }).exec(function (
      err: any,
      res: any
    ) {
      resolve(res.length > 0);
    });
  });
};

LikeSchema.statics.existingLikeUnlike = function (like: ILike) {
  return new Promise((resolve) => {
    this.deleteOne({ source: like.source, target: like.target }).exec(function (
      err: any,
      res: any
    ) {
      resolve(!err);
    });
  });
};

export const Like: LikeModel = model<IlikeInterface, LikeModel>(
  "Like",
  LikeSchema
);
