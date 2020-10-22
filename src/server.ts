import { MongoClient } from "mongodb";
import mongoSession from "connect-mongo";
import * as dotenv from "dotenv";
import cors from "cors";
import * as core from "express-serve-static-core";
import express from "express";
import session from "express-session";
import * as gamesController from "./controllers/games.controller";
import * as nunjucks from "nunjucks";
import * as platformsController from "./controllers/platforms.controller";
import GameModel, { Game } from "./models/gameModel";
import PlatformModel, { Platform } from "./models/platformModel";

import bodyParser from "body-parser";
import * as connection from "./controllers/connection.controller";
import { v4 as uuidv4 } from "uuid";

const clientWantsJson = (request: express.Request): boolean => request.get("accept") === "application/json";
let access = false;

const jsonParser = bodyParser.json();
const formParser = bodyParser.urlencoded({ extended: true });

const session_secret = process.env.SESSIONSECRET || "";

dotenv.config();

export function makeApp(mongoClient: MongoClient): core.Express {
  const app = express();

  nunjucks.configure("views", {
    autoescape: true,
    express: app,
  });

  app.disable("x-powered-by");
  app.use("/assets", express.static("public"));
  app.use(cors());
  app.set("view engine", "njk");

  const mongoStore = mongoSession(session);

  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

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

  const platformModel = new PlatformModel(mongoClient.db().collection<Platform>("platforms"));
  const gameModel = new GameModel(mongoClient.db().collection<Game>("games"));

  app.get("/", sessionParser, async (request, response) => {
    await connection
      .checkAccess()(request)
      .then((result) => (access = result));
    response.render("pages/home", {
      access,
    });
  });
  app.get("/api", sessionParser, async (request, response) => {
    await connection
      .checkAccess()(request)
      .then((result) => (access = result));
    response.render("pages/api", {
      access,
    });
  });
  app.get("/login", sessionParser, connection.connect());
  app.get("/logout", sessionParser, connection.logout());
  app.get("/oauth/callback", sessionParser, connection.callback());

  app.get("/platforms", sessionParser, platformsController.index(platformModel));
  app.get("/platforms/new", sessionParser, connection.checkLoginStatus(platformsController.newPlatform()));
  app.get("/platforms/:slug", sessionParser, platformsController.show(platformModel));
  app.get("/platforms/:slug/edit", sessionParser, connection.checkLoginStatus(platformsController.edit(platformModel)));
  app.post(
    "/platforms",
    jsonParser,
    formParser,
    sessionParser,
    connection.checkLoginStatus(platformsController.create(platformModel)),
  );
  app.put(
    "/platforms/:slug",
    jsonParser,
    sessionParser,
    connection.checkLoginStatus(platformsController.update(platformModel)),
  );
  app.post(
    "/platforms/:slug",
    formParser,
    sessionParser,
    connection.checkLoginStatus(platformsController.update(platformModel)),
  );
  app.delete(
    "/platforms/:slug",
    jsonParser,
    sessionParser,
    connection.checkLoginStatus(platformsController.destroy(platformModel)),
  );

  app.get("/platforms/:slug/games", sessionParser, gamesController.list(gameModel));
  app.get("/games", sessionParser, gamesController.index(gameModel));
  app.get("/games/new", gamesController.newGame());
  app.get("/games/:slug", sessionParser, gamesController.show(gameModel));
  app.get("/games/:slug/edit", sessionParser, connection.checkLoginStatus(gamesController.edit(gameModel)));
  app.post(
    "/games",
    jsonParser,
    formParser,
    sessionParser,
    connection.checkLoginStatus(gamesController.create(gameModel, platformModel)),
  );
  app.put(
    "/games/:slug",
    jsonParser,
    sessionParser,
    connection.checkLoginStatus(gamesController.update(gameModel, platformModel)),
  );
  app.post(
    "/games/:slug",
    formParser,
    sessionParser,
    connection.checkLoginStatus(gamesController.update(gameModel, platformModel)),
  );
  app.delete(
    "/games/:slug",
    jsonParser,
    sessionParser,
    connection.checkLoginStatus(gamesController.destroy(gameModel)),
  );

  app.get("/*", sessionParser, async (request, response) => {
    console.log(request.path);
    if (clientWantsJson(request)) {
      response.status(404).json({ error: "Not Found" });
    } else {
      await connection
        .checkAccess()(request)
        .then((result) => (access = result));
      response.status(404).render("pages/not-found", {
        access,
      });
    }
  });

  return app;
}
