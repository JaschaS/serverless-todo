import 'source-map-support/register';

import { middyfy } from '@libs/lambda';

import {formatJSONResponse} from "@libs/apiGateway";
import type {APIGatewayProxyHandler} from "aws-lambda";
import * as AWS from 'aws-sdk'
import * as AWSXRay from "aws-xray-sdk";

import { createLogger } from '@libs/logger'

const logger = createLogger('auth')
const XAWS = AWSXRay.captureAWS(AWS);

const bucketName = process.env.TODO_S3;

const s3 = new XAWS.S3({
  signatureVersion: "v4"
});

const generateUploadUrl: APIGatewayProxyHandler = async (event) => {

  const todoId = event.pathParameters.todoId;

  if(!todoId) {

    logger.info(`was not able to generate upload url - wrong todo id ${todoId}`);

    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({message: "Missing path parameters todo-id"})
    };
  }

  logger.info(`generating upload url for todo ${todoId}`);

  const signedUrl = s3.getSignedUrl("putObject", {
    Bucket: bucketName,
    Key: todoId,
    Expires: 300
  })

  return formatJSONResponse({
    uploadUrl: signedUrl
  });
}

export const main = middyfy(generateUploadUrl);