import { MongoClient } from "mongodb";
import * as core from "express-serve-static-core";
import express from "express";
import session from "express-session";
import mongoSession from "connect-mongo";
import * as nunjucks from "nunjucks";
import * as gamesController from "./controllers/games.controller";
import * as platformsController from "./controllers/platforms.controller";
import GameModel, { Game } from "./models/gameModel";
import PlatformModel, { Platform } from "./models/platformModel";
import bodyParser from "body-parser";
import cors from "cors";
import { oauthClient } from "./controllers/login.controller";

const clientWantsJson = (request: express.Request): boolean => request.get("accept") === "application/json";

const jsonParser = bodyParser.json();
const formParser = bodyParser.urlencoded({ extended: true });
const session_secret = process.env.SESSIONSECRET || "";

export function makeApp(mongoClient: MongoClient): core.Express {
  const app = express();

  nunjucks.configure("views", {
    autoescape: true,
    express: app,
  });

  app.use("/assets", express.static("public"));
  app.set("view engine", "njk");
  app.use(cors());

  const mongoStore = mongoSession(session);
  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

  const sessionParser = session({
    secret: session_secret,
    name: "session_id",
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
  //const panierModel = new PanierModel.collection("panier");

  app.get("/", (_request, response) => response.render("pages/home"));
  app.get("/api", (_request, response) => response.render("pages/api"));
  app.get("/login", async (_request, response) => {
    const urlAuth = await oauthClient.getAuthorizationURL().then((authUrl) => authUrl.href);
    response.render("pages/login", { urlAuth });
  });

  app.get("/oauth/callback", sessionParser, (_request, response) => {
    const queryCode = String(_request.query.code);
    oauthClient
      .getTokensFromAuthorizationCode(queryCode)
      .then((token) => {
        if (_request.session) {
          _request.session.accessToken = token.access_token;
        }
        console.log(_request.session);
        response.redirect("/");
      })
      .catch((error) => console.log(error));
  });

  app.get("/platforms", platformsController.index(platformModel));
  app.get("/platforms/new", platformsController.newPlatform());
  app.get("/platforms/:slug", platformsController.show(platformModel));
  app.get("/platforms/:slug/edit", platformsController.edit(platformModel));
  app.post("/platforms", jsonParser, formParser, platformsController.create(platformModel));
  app.put("/platforms/:slug", jsonParser, platformsController.update(platformModel));
  app.post("/platforms/:slug", formParser, platformsController.update(platformModel));
  app.delete("/platforms/:slug", jsonParser, platformsController.destroy(platformModel));

  app.get("/platforms/:slug/games", gamesController.list(gameModel));
  app.get("/games", gamesController.index(gameModel));
  app.get("/games/new", gamesController.newGame());
  app.get("/games/:slug", gamesController.show(gameModel));
  app.get("/games/:slug/edit", gamesController.edit(gameModel));
  app.post("/games", jsonParser, formParser, gamesController.create(gameModel, platformModel));
  app.put("/games/:slug", jsonParser, gamesController.update(gameModel, platformModel));
  app.post("/games/:slug", formParser, gamesController.update(gameModel, platformModel));
  app.delete("/games/:slug", jsonParser, gamesController.destroy(gameModel));

  app.post("/platformsPanierIndex", jsonParser, formParser, platformsController.addPanierIndex(platformModel));

  app.get("/*", (request, response) => {
    console.log(request.path);
    if (clientWantsJson(request)) {
      response.status(404).json({ error: "Not Found" });
    } else {
      response.status(404).render("pages/not-found");
    }
  });

  return app;
}
