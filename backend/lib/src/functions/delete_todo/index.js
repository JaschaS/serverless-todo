import { handlerPath } from '@libs/handlerResolver';
export default {
    handler: `${handlerPath(__dirname)}/handler.main`,
    events: [
        {
            http: {
                method: 'delete',
                path: 'todos/{todoId}',
                authorizer: "auth",
                cors: true
            }
        }
    ],
    iamRoleStatements: [
        {
            Effect: "Allow",
            Action: [
                "dynamodb:DeleteItem"
            ],
            Resource: "arn:aws:dynamodb:${opt:region, self:provider.region}:*:table/${self:provider.environment.TODOS_TABLE}/index/${self:provider.environment.INDEX_NAME}"
        },
        {
            Effect: "Allow",
            Action: [
                "dynamodb:DeleteItem"
            ],
            Resource: "arn:aws:dynamodb:${opt:region, self:provider.region}:*:table/${self:provider.environment.TODOS_TABLE}"
        }
    ]
};
//# sourceMappingURL=index.js.map