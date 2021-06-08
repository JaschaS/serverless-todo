import { handlerPath } from '@libs/handlerResolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'post',
        path: 'todos/{todoId}/attachment',
        authorizer: "auth",
        cors: true
      }
    }
  ],
  iamRoleStatements: [
    {
      Effect: "Allow",
      Action: [
        "s3:PutObject",
        "s3:GetObject"
      ],
      Resource: "arn:aws:s3:::${self:provider.environment.TODO_S3}/*"
    }
  ]
}
