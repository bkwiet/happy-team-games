import * as oauth2 from "@fwl/oauth2";
const client_id = process.env.CLIENTID || "";
const client_secret = process.env.CLIENTSECRET || "";
const audience = process.env.AUDIENCE || "";
const name = process.env.NAME || "";
const jwt = process.env.JWALGORITHM || "";

const oauthClientConstructorProps: OAuth2ClientConstructor = {
  openIDConfigurationURL: "https://fewlines.connect.prod.fewlines.tech/.well-known/openid-configuration",
  clientID: client_id,
  clientSecret: client_secret,
  redirectURL: "***",
  audience: "***",
  scopes: ["***", "***"],
};
const oauthClient = new OAuth2Client(oauthClientConstructorProps);