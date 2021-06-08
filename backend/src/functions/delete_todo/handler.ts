import 'source-map-support/register';

import { middyfy } from '@libs/lambda';
import type {APIGatewayProxyHandler} from "aws-lambda";
import * as AWS from "aws-sdk";
import * as AWSXRay from "aws-xray-sdk";
import {getUserId} from "../../libs/userhandler";
import { createLogger } from '@libs/logger'

const logger = createLogger('auth')

const XAWS = AWSXRay.captureAWS(AWS)
const dbClient = new XAWS.DynamoDB.DocumentClient();
const todoTable = process.env.TODOS_TABLE;

const deleteTodo: APIGatewayProxyHandler = async (event) => {

  const todoId = event.pathParameters.todoId;
  const user = getUserId(event.headers.Authorization);

  if(!todoId) {
    logger.info(`not able to delete todo - missing ${todoId} for user ${user}`);

    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({message: "Missing path parameters todo-id"})
    };
  }

  logger.info(`deleting todo with id ${todoId} and user ${user}`);

  await dbClient.delete({
    TableName: todoTable,
    Key: {
      todoId: todoId,
      userId: user
    }
  }).promise();

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: null
  };
}

export const main = middyfy(deleteTodo);
