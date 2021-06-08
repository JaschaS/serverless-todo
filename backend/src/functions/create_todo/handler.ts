import 'source-map-support/register';

import { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import { getUserId } from '@libs/userhandler';

import schema from './schema';
import * as AWS from "aws-sdk";
import * as AWSXRay from "aws-xray-sdk"
import {TodoItem} from "../../models/TodoItem";
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '@libs/logger'

const logger = createLogger('auth')
const XAWS = AWSXRay.captureAWS(AWS)
const dbClient = new XAWS.DynamoDB.DocumentClient();
const todoTable = process.env.TODOS_TABLE;
const bucketName = process.env.TODO_S3;

const createTodo: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {

  const todoId = uuidv4();
  const user = getUserId(event.headers.Authorization);

  logger.info(`create new todo for user ${user} and id ${todoId}`);

  const todoItem: TodoItem = {
    userId: user,
    todoId: todoId,
    createdAt: Date.now().toLocaleString(),
    done: false,
    attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`,
    ...event.body
  }

  await dbClient.put({
    TableName: todoTable,
    Item: todoItem
  }).promise();

  return formatJSONResponse({
    "item": todoItem
  });
}

export const main = middyfy(createTodo);
