//Process S3 events that are driven once an object has been uploaded to our bucket.
//Update our DynamoDB table with relavent information about said object.

'use strict';

const AWS = require('aws-sdk');

AWS.config.logger = console;

const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

const {
  DynamoDBClient,
  UpdateItemCommand
} = require('@aws-sdk/client-dynamodb');

const itemStatus = 'download-complete';
const region = 'us-east-2';
const table = 'tapedeck-20210421';

const ddbClient = new DynamoDBClient({
  region: region,
  logger: console
});

exports.handler = async (event) => {
  console.log('record count', event.Records.length);

  let i = 0;

  for (const record of event.Records) {
    const { eventTime, eventName, awsRegion } = record;
    const Bucket = record.s3.bucket.name;
    const Key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
    const objectSize = record.s3.object.size;

    console.log('processing event', eventTime, eventName, Bucket, Key);

    if (eventName === 'ObjectCreated:Put') {
      const params = {
        Bucket,
        Key
      };

      try {
        const { Metadata } = await s3.getObject(params).promise();
        if (Metadata && Metadata.PK && Metadata.SK) {
          const { PK, SK } = Metadata;
          const S3URL = `https://${Bucket}.s3.${awsRegion}.amazonaws.com/${Key}`;
          //https://tapedeck-archives.s3.us-east-2.amazonaws.com/d6ade639-bada-4ea2-9381-52c9d625cec2/1ebc2c3d-9972-4ce8-9fa2-b76b7babb44c.mp3

          const now = new Date().toISOString();

          const itemParams = {
            TableName: table,
            //prettier-ignore
            Key: {
              'PK': {
                S: PK
              },
              'SK': {
                S: SK
              }
            },
            //prettier-ignore
            UpdateExpression: 'SET LastModified = :modDate, Status = :status, LastDownloadDate = :downloadDate, DownloadCount = DownloadCount + :downloadCount, S3URL = :url, S3SIZE = :size',
            //prettier-ignore
            ExpressionAttributeValues: {
              ':modDate': {
                S: now
              },
              ':status': { 
                S: itemStatus
              },
              ':downloadDate': { 
                S: now
              },
              ':downloadCount': {
                N: '1'
              },
              ':url': {
                S:S3URL
              },
              ':size': {
                N: objectSize
              }
            }
          };

          try {
            console.log('UpdateItem params', itemParams);
            const putItemResponse = await ddbClient.send(
              new UpdateItemCommand(itemParams)
            );
            console.log('UpdateItem response', putItemResponse);
          } catch (error) {
            console.error('UpdateItem error', error);
            throw error;
          }

          i++;
        } else {
          console.error('Error in metadata', Metadata);
        }
      } catch (error) {
        const message = `Error getting object ${Key} from bucket ${Bucket}`;
        console.error(message, error);
        throw new Error(message);
      }
    } else {
      console.log('skipping event type', eventName);
    }
  }

  return `Processed records: ${i}`;
};
