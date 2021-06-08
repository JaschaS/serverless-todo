import { handlerPath } from '@libs/handlerResolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'get',
        path: 'todos',
        cors: true,
        authorizer: "auth"
      }
    }
  ],
  iamRoleStatements: [
      {
        Effect: "Allow",
        Action: [
            "dynamodb:Query"
        ],
        Resource: "arn:aws:dynamodb:${opt:region, self:provider.region}:*:table/${self:provider.environment.TODOS_TABLE}"
      }
  ]
}
