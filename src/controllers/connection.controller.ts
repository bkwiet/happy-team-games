import OAuth2Client, { OAuth2ClientConstructor } from "@fwl/oauth2";
import * as dotenv from "dotenv";
import { Request, Response } from "express";

dotenv.config();

const open_id = process.env.OPEN_ID || "";
const client_id = process.env.CLIENT_ID || "";
const client_secret = process.env.CLIENT_SECRET || "";
const audience = process.env.AUDIENCE || "";
const oauth_callback_url = process.env.OAUTH_CALLBACK_URL || "";
const name = process.env.NAME || "";
const jwt_algo = process.env.JWT_ALGORITHM || "";

const oauthClientConstructorProps: OAuth2ClientConstructor = {
  openIDConfigurationURL: open_id,
  clientID: client_id,
  clientSecret: client_secret,
  redirectURI: oauth_callback_url,
  audience: audience,
  scopes: ["openid", "email", "phone"],
};

export const oauthClient = new OAuth2Client(oauthClientConstructorProps);

export function connect() {
  return async (request: Request, response: Response): Promise<void> => {
    // Ajouter gestion des erreurs =>
    const oauth_URL = await oauthClient.getAuthorizationURL().then((authUrl) => authUrl.href);
    response.render("pages/login", { oauth_URL });
  };
}

export function callback() {
  return async (request: Request, response: Response): Promise<void> => {
    if (request.query.code) {
      const token = await oauthClient.getTokensFromAuthorizationCode(String(request.query.code));

      if (token.id_token) {
        // const decodedID_Token = await oauthClient.verifyJWT(token.id_token, jwt_algo).then();
        if (request.session) {
          request.session.accessToken = token.access_token;
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
      response.redirect("/login");
      return;
    }
    try {
      await oauthClient.verifyJWT(request.session.accessToken, jwt_algo);
      callback(request, response);
    } catch {
      response.redirect("/login");
    }
  };
}

export function checkAccess() {
  return async (request: Request): Promise<boolean> => {
    if (!request.session || !request.session.accessToken) {
      return false;
    }
    try {
      await oauthClient.verifyJWT(request.session.accessToken, jwt_algo);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
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
