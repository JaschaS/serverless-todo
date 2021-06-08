import 'source-map-support/register';

import { middyfy } from '@libs/lambda';

import {formatJSONResponse} from "@libs/apiGateway";
import {APIGatewayProxyHandler} from "aws-lambda";
import * as AWS from 'aws-sdk'
import * as AWSXRay from "aws-xray-sdk";
import {getUserId} from "../../libs/userhandler";

import { createLogger } from '@libs/logger'

const logger = createLogger('auth')
const XAWS = AWSXRay.captureAWS(AWS)
const dbClient = new XAWS.DynamoDB.DocumentClient();
const todoTable = process.env.TODOS_TABLE;

const getTodos: APIGatewayProxyHandler = async (event) => {

  const user = getUserId(event.headers.Authorization);
  const result = await todosOfUser(user);

  logger.info(`returning all todos for user ${user}`);
  logger.debug(`todos for user ${user} are ${JSON.stringify(result)}`);

  return formatJSONResponse({
    items: result
  });
}

export const main = middyfy(getTodos);

async function todosOfUser(userId: string) : Promise<AWS.DynamoDB.DocumentClient.ItemList> {
  const results = await dbClient.query({
    TableName: todoTable,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
    //ProjectionExpression: "todoId, attachmentUrl, dueDate, createdAt, done"
  }).promise();

  return results.Items;
}