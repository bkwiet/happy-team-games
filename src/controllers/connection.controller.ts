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

export function connect() {
  return async (request: Request, response: Response): Promise<void> => {
    const urlAuth = await oauthClient.getAuthorizationURL().then((authUrl) => authUrl.href);
    response.render("pages/login", { urlAuth });
  };
}

export function callback() {
  return async (request: Request, response: Response): Promise<void> => {
    if (request.query.code) {
      const token = await oauthClient.getTokensFromAuthorizationCode(String(request.query.code));

      if (token.id_token) {
        // const decodedToken = await oauthClient.verifyJWT(token.access_token, jwt_algo);
        console.log(request);
        console.log(token.id_token);
        if (request.session) {
          request.session.accessToken = token.access_token;
          // request.session.accessToken = decodedToken;
        }
        console.log(request.session);
        response.redirect("/");
      } else {
        response.status(401).json({ error: "Failed connection" });
      }
    } else {
      response.status(403).json({ error: "Unauthorized connection" });
    }
  };
}

export function checkLoginStatus(callback: (request: Request, response: Response) => Promise<void>) {
  return async (request: Request, response: Response): Promise<void> => {
    if (!request.session || !request.session.accessToken) {
      // Can't find the session
      response.redirect("/login");
      return;
    }
    callback(request, response);
  };
}

// export function refreshLoginStatus() {}

export function logout() {
  return async (request: Request, response: Response): Promise<void> => {
    if (request.session) {
      request.session.destroy(() => response.redirect("/"));
    } else {
      response.redirect("/");
    }
  };
}
