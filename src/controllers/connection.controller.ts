import OAuth2Client, { OAuth2ClientConstructor, OAuth2Tokens } from "@fwl/oauth2";
import * as dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";
import * as express from "express";

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

type id_token = {
  aud: string[];
  email: string;
  email_verified: boolean;
  exp: number;
  iat: number;
  iss: string;
  sub: string;
};

export const oauthClient = new OAuth2Client(oauthClientConstructorProps);

export async function connect(request: Request, response: Response): Promise<void> {
  const oauth_URL = await oauthClient.getAuthorizationURL().then((authUrl) => authUrl.href);
  response.render("pages/login", { oauth_URL });
}

export async function callback(request: Request, response: Response): Promise<void> {
  try {
    if (request.query.code) {
      const token = await oauthClient.getTokensFromAuthorizationCode(String(request.query.code));
      const decoded = await oauthClient.verifyJWT(token.access_token, jwt_algo);

      if (decoded) {
        if (request.session) {
          const decoded_id_token: id_token = await oauthClient.verifyJWT(String(token.id_token), jwt_algo);
          request.session.accessToken = token.access_token;
          if (decoded_id_token) {
            request.session.userID = decoded_id_token.email;
          }
        }
        console.log(request.session?.accessToken);
        response.redirect("/");
      } else {
        response.status(403).json({ error: "Unauthorized connection" });
      }
    }
  } catch (error) {
    response.status(401).json({ message: "Unauthorized connection" });
  }
}

export async function connectionStatus(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const decoded = await oauthClient.verifyJWT(request.session?.accessToken, jwt_algo);
    if (decoded) {
      response.locals.isConnected = true;
      response.locals.userID = request.session?.userID;
    } else {
      response.locals.isConnected = false;
    }
  } catch (error) {
    response.locals.isConnected = false;
  } finally {
    next();
  }
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

export async function logout(request: Request, response: Response): Promise<void> {
  if (request.session) {
    request.session.destroy(() => response.redirect("/"));
  } else {
    response.redirect("/");
  }
}
