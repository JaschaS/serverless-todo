import createTodo from '@functions/create_todo';
import updateTodo from '@functions/update_todo';
import getTodos from '@functions/get_todos';
import deleteTodo from '@functions/delete_todo';
import generateUploadUrl from '@functions/generate_upload_url';
import auth from '@functions/auth';
const serverlessConfiguration = {
    service: 'serverless-todo',
    frameworkVersion: '2',
    custom: {
        webpack: {
            webpackConfig: './webpack.config.js',
            includeModules: true,
        },
    },
    plugins: ['serverless-offline', 'serverless-webpack', 'serverless-iam-roles-per-function'],
    provider: {
        name: 'aws',
        runtime: 'nodejs14.x',
        profile: "serverless",
        region: "eu-west-1",
        apiGateway: {
            minimumCompressionSize: 1024,
            shouldStartNameWithService: true
        },
        tracing: {
            lambda: true,
            apiGateway: true
        },
        environment: {
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
            TODOS_TABLE: "serverless_todos",
            INDEX_NAME: "todoId",
            TODO_S3: "serverless-jascha-s3"
        },
        lambdaHashingVersion: '20201221'
    },
    resources: {
        Resources: {
            TodoDynamoDBTable: {
                Type: 'AWS::DynamoDB::Table',
                Properties: {
                    AttributeDefinitions: [
                        {
                            AttributeName: "userId",
                            AttributeType: "S"
                        },
                        {
                            AttributeName: "todoId",
                            AttributeType: "S"
                        }
                    ],
                    KeySchema: [
                        {
                            AttributeName: "userId",
                            KeyType: "HASH"
                        },
                        {
                            AttributeName: "todoId",
                            KeyType: "RANGE"
                        }
                    ],
                    ProvisionedThroughput: {
                        ReadCapacityUnits: 1,
                        WriteCapacityUnits: 1
                    },
                    TableName: "${self:provider.environment.TODOS_TABLE}",
                    GlobalSecondaryIndexes: [{
                            IndexName: "${self:provider.environment.INDEX_NAME}",
                            KeySchema: [
                                {
                                    AttributeName: "todoId",
                                    KeyType: "HASH",
                                }
                            ],
                            Projection: {
                                ProjectionType: "ALL"
                            },
                            ProvisionedThroughput: {
                                ReadCapacityUnits: 1,
                                WriteCapacityUnits: 1
                            }
                        }]
                }
            },
            ImagesBucket: {
                Type: "AWS::S3::Bucket",
                Properties: {
                    BucketName: "${self:provider.environment.TODO_S3}",
                    CorsConfiguration: {
                        CorsRules: [
                            {
                                AllowedOrigins: ["*"],
                                AllowedHeaders: ["*"],
                                AllowedMethods: ["GET", "POST", "PUT", "POST", "DELETE", "HEAD"],
                                MaxAge: 3000
                            }
                        ]
                    }
                }
            },
            BucketPolicy: {
                Type: "AWS::S3::BucketPolicy",
                Properties: {
                    PolicyDocument: {
                        Id: "Serverless-S3-Policy",
                        Version: "2012-10-17",
                        Statement: [
                            {
                                Sid: "PublicReadForGetBucketObjects",
                                Effect: "Allow",
                                Principal: "*",
                                Action: "s3:GetObject",
                                Resource: "arn:aws:s3:::${self:provider.environment.TODO_S3}/*"
                            }
                        ]
                    },
                    Bucket: {
                        Ref: "ImagesBucket"
                    }
                }
            },
            GatewayResponseDefault4xx: {
                Type: "AWS::ApiGateway::GatewayResponse",
                Properties: {
                    ResponseParameters: {
                        "gatewayresponse.header.Access-Control-Allow-Origin": "'*'",
                        "gatewayresponse.header.Access-Control-Allow-Headers": "'*'"
                    },
                    ResponseType: "DEFAULT_4XX",
                    RestApiId: {
                        Ref: "ApiGatewayRestApi"
                    }
                }
            }
        }
    },
    functions: { auth, generateUploadUrl, deleteTodo, getTodos, createTodo, updateTodo },
};
module.exports = serverlessConfiguration;
//# sourceMappingURL=serverless.js.map