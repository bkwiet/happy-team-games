import { ObjectId } from "mongodb";

import { Collection, ObjectId } from "mongodb";
import { Platform } from "./platformModel";
import { Game } from "./gameModel";

export type CardInput = {
  product?: Game[] | Platform[];
};

export type Card = CardInput & {
  _id: ObjectId;
};

export default class Card {}
