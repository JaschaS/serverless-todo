import 'source-map-support/register';

import { middyfy } from '@libs/lambda';

import {APIGatewayAuthorizerResult, APIGatewayTokenAuthorizerHandler} from "aws-lambda";
import {APIGatewayTokenAuthorizerEvent} from "aws-lambda/trigger/api-gateway-authorizer";
import {verify} from "jsonwebtoken";
import {JwtToken} from "./JwtToken";
import { createLogger } from '@libs/logger'

const logger = createLogger('auth')

const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJVUXvips17BbRMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi1uaTJkYmdwai5ldS5hdXRoMC5jb20wHhcNMjEwNjA3MjAwMzAwWhcN
MzUwMjE0MjAwMzAwWjAkMSIwIAYDVQQDExlkZXYtbmkyZGJncGouZXUuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwcui1NXgNka9Vto4
6rPYsa1j26O0t4Q5rjKlBrL/JyRoqSKZRYy2Ayi7X3z4xiEzxf00aI5EaopmOQvE
SIZOvp1EYrZoCSxnS9MGT1pKEKw8UEZbVacrQvmrVMlRpRHi1fzzIklevsPoA4Oc
sGVUdqLxlKpiSh/eHsbKhzYMJC0Ix6ns7j6ydDTsw4midAgno0QlhwQTFs8Ln+mq
Y/g9j8U/U9YbMDJ4sLnDqzebIcedc7osiYSxc1OH1JF/L2ZuhtXS+ESnrHOTIvjZ
CUZ1Wlfl31HadWSXtmnrVkn08DjTIMXxu29VSbTJdh4iW5idGwFlcWnS/8ly/gKy
x/4T3QIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQ8souMaRHG
kNrN92Yd0dzRtIRsSDAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AMFlnafnW4UtYowqiWiFPHJ++rVwikEBf/F2mvNThVhfulljBZGSSBJc77dRFmcQ
284gmeDcMWfolqCkW6hhbhnH2UxyZhnCFwsbymcJdehvZns7KiWLlsDByg/pdoD2
OdEA/9rI5kqopqcHVz2PBUE+mbTZCJcX2gQVQ3BoEArqERbOaUr1lUQ3J1k7vZYO
VFLcxN5Ztt4r/hDbmYYLGiydS96UEmNpPaNpCt4jTrCgwVVm8/auIKe1dIfzHvve
jdcW3C2fm+knRLHJkW360BR4IqREJ8OfCaM0V/lLS18IBLZkUYocpCF/tf/tbFqV
/a4/POo+VIZx2FvzvXj4L7Y=
-----END CERTIFICATE-----`

const auth: APIGatewayTokenAuthorizerHandler = async (event : APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {

  try {
    logger.info(`Validating user`);

    const decodedToken = validate(event.authorizationToken);

    return {
      principalId: decodedToken.sub,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Allow",
            Resource: "*"
          }
        ]
      }
    };
  }
  catch (e) {

    logger.error(`User was not authorized - reason: ${e}`);

    return {
      principalId: "user",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Deny",
            Resource: "*"
          }
        ]
      }
    };
  }
}

export const main = middyfy(auth);

function validate(authHeader: string): JwtToken {
  if(!authHeader) throw new Error("Missing authorization header");
  if(!authHeader.toLocaleLowerCase().startsWith("bearer ")) throw new Error("Invalid authorization header");

  const token = authHeader.split(" ")[1]

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtToken;
}