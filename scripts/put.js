'use strict';

const { v4: uuidv4 } = require('uuid');
const ulid = require('ulid').ulid;
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');

const region = 'us-east-2';
const table = 'tapedeck-test-20210511';

const ddbClient = new DynamoDBClient({
  region: region,
  logger: console
});

(async function () {
  const userId = uuidv4();
  const u = ulid();

  for (let i = 0; i < 5; i++) {
    const putItemParams = {
      TableName: table,
      Item: {
        PK: {
          S: `user#${userId}`
        },
        SK: {
          S: `track#${u}#${(i + '').padStart(3, '0')}`
        }
      }
    };

    try {
      console.log('PutItem params', putItemParams);
      const putItemResponse = await ddbClient.send(
        new PutItemCommand(putItemParams)
      );
      console.log('PutItem response', putItemResponse);
    } catch (error) {
      console.error('PutItem error', error);
      throw error;
    }
  }
})();

//track#009#01F5F0J0FC2Y5HJJ8NFHEZ6M5Z
//track#010#01F5F0NQT9MXEE6336PXKZRCH6
