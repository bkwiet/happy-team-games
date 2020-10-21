import OAuth2Client, {
  OpenIDConfiguration,
  OAuth2ClientConstructor,
  decodeJWTPart,
  rsaPublicKeyToPEM,
  MissingJWKSURI,
  InvalidKeyIDRS256,
  MissingKeyIDHS256,
  AlgoNotSupported,
  InvalidAudience,
  ScopesNotSupported,
  OAuth2Tokens,
} from "@fwl/oauth2";

import * as dotenv from "dotenv";
dotenv.config();

const client_id = process.env.CLIENTID || "";
const client_secret = process.env.CLIENTSECRET || "";
const audience = process.env.AUDIENCE || "";
const name = process.env.NAME || "";
const jwt = process.env.JWALGORITHM || "";

const oauthClientConstructorProps: OAuth2ClientConstructor = {
  openIDConfigurationURL: "https://fewlines.connect.prod.fewlines.tech/.well-known/openid-configuration",
  clientID: client_id,
  clientSecret: client_secret,
  redirectURI: "http://localhost:8080/oauth/callback",
  audience: audience,
  scopes: ["openid", "email", "phone"],
};

export const oauthClient = new OAuth2Client(oauthClientConstructorProps);

// oauthClient
//   .getAuthorizationURL()
//   .then((result) => {
//     console.log(result);
//   })
//   .catch((error) => {
//     console.log(error);
//   });
