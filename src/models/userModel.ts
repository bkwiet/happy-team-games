import { url } from "inspector";
import { Collection, ObjectId } from "mongodb";
import platforms from "../../data/platforms";
import { Game } from "./gameModel";

// id , email, card , sub

type UserInput = {
  name: string;
  price: number;
  imgUrl: string;
};

// export default class UsermModel {
//   findOne(_id: ObjectId) {
//     throw new Error("Method not implemented.");
//   }
//   find(_id: ObjectId) {
//     throw new Error("Method not implemented.");
//   }
//   private collection: Collection;
//   constructor(collection: Collection) {
//     this.collection = collection;
//   }
//   async insertOne(payload: UserInput): Promise<Platform> {
//     if (!payload.games) {
//       payload.games = [];
//     }
//     const dbResponse = await this.collection.insertOne(payload);
//     const { ops } = dbResponse;
//     return ops[0];
//   }
// }
