//Convert INSERT events from our DynamoDB table
//into SQS messages to be processed by the
//archive2 function.

'use strict';

const sqsQueueUrl =
  'https://sqs.us-east-2.amazonaws.com/336249122316/tapedeck-process-queue';

//use the old SDK because it's included by default in lambda runtimes.
const AWS = require('aws-sdk');

AWS.config.logger = console;

const sqs = new AWS.SQS({
  apiVersion: '2012-11-05'
});

exports.handler = async (event) => {
  console.log('record count', event.Records.length);

  //console.log('Received event:', JSON.stringify(event, null, 2));

  let i = 0;
  for (const record of event.Records) {
    if (record.eventName === 'INSERT') {
      console.log('processing record: %j', record.dynamodb);

      const PK = record.dynamodb.NewImage.PK.S;
      const SK = record.dynamodb.NewImage.SK.S;
      const URL = record.dynamodb.NewImage.URL.S;

      const msg = {
        PK,
        SK,
        URL
      };

      console.log('queue msg', msg);

      const params = {
        MessageBody: JSON.stringify(msg),
        QueueUrl: sqsQueueUrl
      };

      try {
        const response = new Promise((resolve, reject) => {
          sqs.sendMessage(params, (err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          });
        });

        await response;

        console.log('sendMessage response', response);

        i++;
      } catch (error) {
        console.error('sendMessage error', error);
        throw error;
      }
    } else {
      console.log('skip event', record.eventID, record.eventName);
    }
  }

  return `Processed records: ${i}`;
};
