import schema from './schema';
import { handlerPath } from '@libs/handlerResolver';
export default {
    handler: `${handlerPath(__dirname)}/handler.main`,
    events: [
        {
            http: {
                method: 'patch',
                path: 'todos/{todoId}',
                cors: true,
                authorizer: "auth",
                request: {
                    schema: {
                        'application/json': schema
                    }
                }
            }
        }
    ],
    iamRoleStatements: [
        {
            Effect: "Allow",
            Action: [
                "dynamodb:Query"
            ],
            Resource: "arn:aws:dynamodb:${opt:region, self:provider.region}:*:table/${self:provider.environment.TODOS_TABLE}/index/${self:provider.environment.INDEX_NAME}"
        },
        {
            Effect: "Allow",
            Action: [
                "dynamodb:PutItem"
            ],
            Resource: "arn:aws:dynamodb:${opt:region, self:provider.region}:*:table/${self:provider.environment.TODOS_TABLE}"
        }
    ]
};
//# sourceMappingURL=index.js.map