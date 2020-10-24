import { MongoClient } from "mongodb";
import mongoSession from "connect-mongo";
import * as dotenv from "dotenv";
import cors from "cors";
import * as core from "express-serve-static-core";
import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from "uuid";
import * as nunjucks from "nunjucks";
import * as gamesController from "./controllers/games.controller";
import * as platformsController from "./controllers/platforms.controller";
import * as connection from "./controllers/connection.controller";
import * as card from "./controllers/card.controller";
import GameModel, { Game } from "./models/gameModel";
import PlatformModel, { Platform } from "./models/platformModel";

const clientWantsJson = (request: express.Request): boolean => request.get("accept") === "application/json";
let access = false;

const jsonParser = bodyParser.json();
const formParser = bodyParser.urlencoded({ extended: true });

const session_secret = process.env.SESSIONSECRET || "";

dotenv.config();

export function makeApp(mongoClient: MongoClient): core.Express {
  const app = express();
  const mongoStore = mongoSession(session);
  const gameModel = new GameModel(mongoClient.db().collection<Game>("games"));
  const platformModel = new PlatformModel(mongoClient.db().collection<Platform>("platforms"));
  const sessionParser = session({
    secret: session_secret,
    name: "happy_tg_sessionID",
    genid: () => uuidv4(),
    resave: false,
    saveUninitialized: true,
    store: new mongoStore({
      client: mongoClient,
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 3600000),
    },
  });

  nunjucks.configure("views", {
    autoescape: true,
    express: app,
  });

  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

  app.disable("x-powered-by");
  app.set("view engine", "njk");
  app.use("/assets", express.static("public"));
  app.use(cors());
  app.use("/*", sessionParser, connection.connectionStatus);
  app.use("/*", card.cardFollow(mongoClient));

  // Index / Api routes
  app.get("/", sessionParser, async (request, response) => {
    response.render("pages/home");
  });
  app.get("/api", sessionParser, async (request, response) => {
    await connection
      .checkAccess()(request)
      .then((result) => (access = result));
    response.render("pages/api", {
      access,
    });
  });

  // Login / Logout routes

  app.get("/login", connection.connect);
  app.get("/logout", connection.logout);
  app.get("/oauth/callback", connection.callback);

  // Platforms routes

  app.get("/platforms", platformsController.index(platformModel));
  app.get("/platforms/new", connection.checkLoginStatus(platformsController.newPlatform()));
  app.get("/platforms/:slug", platformsController.show(platformModel));
  app.get("/platforms/:slug/edit", connection.checkLoginStatus(platformsController.edit(platformModel)));
  app.post(
    "/platforms",
    jsonParser,
    formParser,
    connection.checkLoginStatus(platformsController.create(platformModel)),
  );
  app.put("/platforms/:slug", jsonParser, connection.checkLoginStatus(platformsController.update(platformModel)));
  app.post("/platforms/:slug", formParser, connection.checkLoginStatus(platformsController.update(platformModel)));
  app.delete("/platforms/:slug", jsonParser, connection.checkLoginStatus(platformsController.destroy(platformModel)));

  app.get("/platforms/:slug/games", gamesController.list(gameModel));

  // Games routes

  app.get("/games", gamesController.index(gameModel));
  app.get("/games/new", connection.checkLoginStatus(gamesController.newGame()));
  app.get("/games/:slug", gamesController.show(gameModel));
  app.get("/games/:slug/edit", connection.checkLoginStatus(gamesController.edit(gameModel)));
  app.post(
    "/games",
    jsonParser,
    formParser,
    connection.checkLoginStatus(gamesController.create(gameModel, platformModel)),
  );
  app.put("/games/:slug", jsonParser, connection.checkLoginStatus(gamesController.update(gameModel, platformModel)));
  app.post("/games/:slug", formParser, connection.checkLoginStatus(gamesController.update(gameModel, platformModel)));
  app.delete("/games/:slug", jsonParser, connection.checkLoginStatus(gamesController.destroy(gameModel)));

  // Ecommerce routes
  app.get("/card", connection.checkLoginStatus(card.index(mongoClient)));
  app.get("/card/checkout", connection.checkLoginStatus(card.checkout(mongoClient)));
  app.post("/card/add", formParser, connection.checkLoginStatus(card.addProduct(mongoClient, gameModel)));
  app.post("/card/remove", formParser, connection.checkLoginStatus(card.delProduct(mongoClient)));

  // Bad request routes
  app.get("/*", async (request, response) => {
    console.log(request.path);
    if (clientWantsJson(request)) {
      response.status(404).json({ error: "Not Found" });
    } else {
      response.status(404).render("pages/not-found");
    }
  });

  return app;
}
