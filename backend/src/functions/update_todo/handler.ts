import 'source-map-support/register';

import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';

import schema from './schema';
import * as AWS from "aws-sdk";
import {TodoItem} from "../../models/TodoItem";
import * as AWSXRay from "aws-xray-sdk";
import {formatJSONResponse} from "@libs/apiGateway";

import { createLogger } from '@libs/logger'

const logger = createLogger('auth')
const XAWS = AWSXRay.captureAWS(AWS)
const dbClient = new XAWS.DynamoDB.DocumentClient();
const todoTable = process.env.TODOS_TABLE;
const todoIndex = process.env.INDEX_NAME;

const updateTodo: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {

  const todoId = event.pathParameters.todoId;
  if(!todoId) {
    logger.info(`not able to update todo - missing ${todoId}`);

    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({message: "Missing path parameters todo-id"})
    };
  }

  const results = await getTodoItem(todoId);

  if(results.Count == 0) {
    logger.info(`not able to update todo - todo with id ${todoId} not found`);

    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({message: "No todo-item found for given todo-id"})
    };
  }

  logger.info(`updating todo with id ${todoId}`);

  const todoItems: TodoItem[] = results.Items as TodoItem[];
  await updateItem(event.body.name, event.body.dueDate, event.body.done, todoItems[0]);

  return formatJSONResponse(null);
}

export const main = middyfy(updateTodo);

async function getTodoItem(todoId: string) : Promise<AWS.DynamoDB.DocumentClient.QueryOutput>  {
  const results = await dbClient.query({
    TableName: todoTable,
    IndexName: todoIndex,
    KeyConditionExpression: 'todoId = :todoId',
    ExpressionAttributeValues: {
      ':todoId': todoId
    }
  }).promise();

  return results;
}

async function updateItem(name: string, dueDate: string, done: boolean, existing: TodoItem) {

  let updateItem: TodoItem = {
    name: name ?? existing.name,
    done: done ?? existing.done,
    dueDate: dueDate ?? existing.dueDate,
    todoId: existing.todoId,
    createdAt: existing.createdAt,
    attachmentUrl: existing.attachmentUrl,
    userId: existing.userId,
    timestamp: existing.timestamp
  };

  await dbClient.put({
    TableName: todoTable,
    Item: updateItem
  }).promise();
}