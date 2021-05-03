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
  console.log('event', JSON.stringify(event, null, 2));
  console.log('record count', event.Records.length);

  let i = 0;

  for (const record of event.Records) {
    const { eventTime, eventName, awsRegion } = record;
    const Bucket = record.s3.bucket.name;
    const Key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
    const objectSize = record.s3.object.size;

    console.log('processing event', eventTime, eventName, Bucket, Key);

    if (
      eventName === 'ObjectCreated:Put' ||
      eventName === 'ObjectCreated:CompleteMultipartUpload'
    ) {
      const params = {
        Bucket,
        Key
      };

      let Metadata = null;

      try {
        console.log('geting head object');
        const headResponse = await s3.headObject(params).promise();
        console.log('head object response', headResponse);
        Metadata = headResponse.Metadata;
      } catch (error) {
        const message = `Error getting head object ${Key} from bucket ${Bucket}`;
        console.error(message, error);
        throw new Error(message);
      }

      if (Metadata && Metadata.pk && Metadata.sk) {
        //Amazon S3 stores user-defined metadata keys in *lowercase*
        //https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingMetadata.html#object-metadata
        const { pk, sk } = Metadata;
        const S3URL = `https://${Bucket}.s3.${awsRegion}.amazonaws.com/${Key}`;
        //https://tapedeck-archives.s3.us-east-2.amazonaws.com/d6ade639-bada-4ea2-9381-52c9d625cec2/1ebc2c3d-9972-4ce8-9fa2-b76b7babb44c.mp3

        const now = new Date().toISOString();

        const itemParams = {
          TableName: table,
          //prettier-ignore
          Key: {
            'PK': {
              S: pk
            },
            'SK': {
              S: sk
            }
          },
          //prettier-ignore
          UpdateExpression: 'SET LastModified = :modDate, ItemStatus = :itemStatus, LastDownloadDate = :downloadDate, DownloadCount = DownloadCount + :downloadCount, S3URL = :url, S3Size = :size',
          //prettier-ignore
          ExpressionAttributeValues: {
            ':modDate': {
              S: now
            },
            ':itemStatus': { 
              S: itemStatus
            },
            ':downloadDate': { 
              S: now
            },
            ':downloadCount': {
              N: '1'
            },
            ':url': {
              S: S3URL
            },
            ':size': {
              N: objectSize+''
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
        console.error(
          'Error - metadata missing or required user-defined keys not present',
          Metadata
        );
      }
    } else {
      console.log('skipping event type', eventName);
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      count: i
    })
  };
};
