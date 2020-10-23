import { Request, Response } from "express";
import { MongoClient } from "mongodb";
import { checkAccess } from "./connection.controller";
import GameModel from "../models/gameModel";

// Draft card controller without Cardmodel and userModel

const clientWantsJson = (request: Request): boolean => request.get("accept") === "application/json";
let access = false;

export function index(mongoClient: MongoClient) {
  return async (request: Request, response: Response): Promise<void> => {
    const products = await mongoClient.db().collection("card").find().toArray();
    await checkAccess()(request).then((result) => (access = result));
    response.render("card/index", { products, access });
  };
}

export function addProduct(mongoClient: MongoClient, gameModel: GameModel) {
  return async (request: Request, response: Response): Promise<void> => {
    console.log(request.body);
    const game = await gameModel.findBySlug(request.body.game);

    if (game) {
      const products = await mongoClient.db().collection("card").find().toArray();
      const addedGame = { id: products.length + 1, name: game.name, slug: game.slug, price: game.price };
      mongoClient
        .db()
        .collection("card")
        .insertOne(addedGame)
        .then((result) => {
          response.redirect("/games/" + addedGame.slug);
        })
        .catch((error) => response.status(400).json({ error: error }));
    }
  };
}

export function delProduct(mongoClient: MongoClient) {
  return async (request: Request, response: Response): Promise<void> => {
    mongoClient
      .db()
      .collection("card")
      .findOne({ id: parseInt(request.body.id) })
      .then((product) => {
        if (product) {
          mongoClient
            .db()
            .collection("card")
            .deleteOne({ id: parseInt(request.body.id) });
        }
      })
      .then(() => response.redirect("/card"))
      .catch((error) => response.status(400).json({ error: error }));
  };
}

export function checkout() {
  return async (request: Request, response: Response): Promise<void> => {
    await checkAccess()(request).then((result) => (access = result));
    response.render("card/checkout", { access });
  };
}

// export function pay() {}
