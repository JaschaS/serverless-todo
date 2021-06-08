
import * as AWS from "aws-sdk";

export interface TodoItem extends AWS.DynamoDB.DocumentClient.AttributeMap {
  userId: string
  todoId: string
  createdAt: string
  name: string
  dueDate: string
  done: boolean
  attachmentUrl?: string
}
