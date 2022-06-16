import jwksRsa, { GetVerificationKey } from "jwks-rsa";
import { expressjwt } from "express-jwt";

const jwtCheck = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: "https://xpns.eu.auth0.com/.well-known/jwks.json",
  }) as GetVerificationKey,
  audience: "http://localhost:3200",
  issuer: "https://xpns.eu.auth0.com/",
  algorithms: ["RS256"],

});

export { jwtCheck };
