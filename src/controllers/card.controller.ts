import { Request, Response, NextFunction } from "express";
import { MongoClient, ObjectId } from "mongodb";
import { checkAccess } from "./connection.controller";
import GameModel from "../models/gameModel";

// Draft card controller without Cardmodel and userModel

const clientWantsJson = (request: Request): boolean => request.get("accept") === "application/json";
let access = false;

export function index(mongoClient: MongoClient) {
  return async (request: Request, response: Response): Promise<void> => {
    const products = await mongoClient.db().collection("card").find().toArray();
    await checkAccess()(request).then((result) => (access = result));
    let total = 0;

    products.forEach((product) => {
      total += parseInt(product.price);
    });
    response.render("card/index", { products, access, total });
  };
}

export async function howManyProduct(mongoClient: MongoClient): Promise<number> {
  const products = await mongoClient.db().collection("card").find().toArray();
  return products.length;
}

export function cardFollow(mongoClient: MongoClient) {
  return async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      if (request.session?.accessToken) {
        const products = await mongoClient.db().collection("card").find().toArray();
        response.locals.card_products_number = products.length;
      }
    } catch (error) {
      console.log(error);
    } finally {
      next();
    }
  };
}

export function addProduct(mongoClient: MongoClient, gameModel: GameModel) {
  return async (request: Request, response: Response): Promise<void> => {
    console.log(request.body);
    const game = await gameModel.findBySlug(request.body.game);

    if (game) {
      const addedGame = {
        name: game.name,
        cover: game.cover.url,
        slug: game.slug,
        platforms: game.platforms,
        price: game.price,
      };
      mongoClient
        .db()
        .collection("card")
        .insertOne(addedGame)
        .then(() => {
          response.redirect("/games/" + addedGame.slug);
        })
        .catch((error) => response.status(400).json({ error: error }));
    }
  };
}

export function delProduct(mongoClient: MongoClient) {
  return async (request: Request, response: Response): Promise<void> => {
    // Add error controller > due to some missed arguments
    console.log(request.body);
    const _id = new ObjectId(request.body.id);
    mongoClient
      .db()
      .collection("card")
      .findOne({ _id })
      .then((product) => {
        if (product) {
          mongoClient.db().collection("card").deleteOne({ _id });
        }
      })
      .then(() => response.redirect("/card"))
      .catch((error) => response.status(400).json({ error: error }));
  };
}

export function checkout(mongoClient: MongoClient) {
  return async (request: Request, response: Response): Promise<void> => {
    await checkAccess()(request).then((result) => (access = result));
    const products = await mongoClient.db().collection("card").find().toArray();
    let total = 0;

    products.forEach((product) => {
      total += parseInt(product.price);
    });
    response.render("card/checkout", { access, total });
  };
}

// export function pay() {}
