import { Collection, ObjectId } from "mongodb";
import GameModel, { Game } from "./gameModel";

type user = {
  id: string;
  email: string;
  shoppingCard?: Game[];
};
