'use strict';

const ulid = require('ulid').ulid;
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { region, table } = require('../awsconfig.js');

const client = new DynamoDBClient({
  region: region,
  logger: console
});

const badStatus = (msg) => {
  console.log('calling badStatus');
  return {
    statusCode: 500,
    body: JSON.stringify({ message: msg })
  };
};

const goodStatus = (pk) => {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'OPTIONS,GET'
    },
    body: JSON.stringify({ pk: pk })
  };
};

const handler = async (event) => {
  const pk = event.sub;
  const sk = ulid();
  const url = event.url;
  const desc = event.desc;

  const params = {
    TableName: table,
    Item: {
      PK: {
        S: pk
      },
      SK: {
        S: sk
      },
      url: {
        S: url
      },
      desc: {
        S: desc
      }
    }
  };

  const command = new PutItemCommand(params);
  try {
    await client.send(command);
    return goodStatus(pk);
  } catch (error) {
    console.error(error);
    return badStatus(error);
  }
};

//THE entry point for lambda
exports.handler = handler;
