import OAuth2Client, { OAuth2ClientConstructor } from "@fwl/oauth2";
import * as dotenv from "dotenv";
import { Request, Response } from "express";

dotenv.config();

const client_id = process.env.CLIENTID || "";
const client_secret = process.env.CLIENTSECRET || "";
const audience = process.env.AUDIENCE || "";
const name = process.env.NAME || "";
const jwt_algo = process.env.JWALGORITHM || "";

const oauthClientConstructorProps: OAuth2ClientConstructor = {
  openIDConfigurationURL: "https://fewlines.connect.prod.fewlines.tech/.well-known/openid-configuration",
  clientID: client_id,
  clientSecret: client_secret,
  redirectURI: "http://localhost:8080/oauth/callback",
  audience: audience,
  scopes: ["openid", "email", "phone"],
};

export const oauthClient = new OAuth2Client(oauthClientConstructorProps);

export function signIn() {
  return async (request: Request, response: Response): Promise<void> => {
    const urlAuth = await oauthClient.getAuthorizationURL().then((authUrl) => authUrl.href);
    response.render("pages/login", { urlAuth });
  };
}

export function connect() {
  return async (request: Request, response: Response): Promise<void> => {
    // const queryCode = String(request.query.code);
    // oauthClient
    //   .getTokensFromAuthorizationCode(queryCode)
    //   .then((token) => oauthClient.verifyJWT(token.access_token, jwt_algo))
    //   .then((decodedToken) => {
    //     if (request.session) {
    //       // _request.session.accessToken = token.access_token;
    //       request.session.accessToken = decodedToken;
    //     }
    //     console.log(request.session);
    //     response.redirect("/");
    //   })
    //   .catch((error) => console.log(error));

    if (request.query.code) {
      const token = await oauthClient.getTokensFromAuthorizationCode(String(request.query.code));

      if (token) {
        const decodedToken = await oauthClient.verifyJWT(token.access_token, jwt_algo);
        if (request.session) {
          // _request.session.accessToken = token.access_token;
          request.session.accessToken = decodedToken;
        }
        console.log(request.session);
        response.redirect("/");
      } else {
        response.status(401).json({ error: "Connection failed" });
      }
    } else {
      response.status(403).json({ error: "Connection unauthorized" });
    }
  };
}
