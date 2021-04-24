'use strict';

/* use '.default' otherwise you'll get a tslint warning
   see https://github.com/axios/axios/issues/1975 */
const axios = require('axios').default;
const HLS = require('parse-hls').default;
const ulid = require('ulid').ulid;
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

const region = 'us-east-2';
const table = 'tapedeck-20210421';
const topic = 'arn:aws:sns:us-east-2:336249122316:tapedeck-archive-request';

const ddbClient = new DynamoDBClient({
  region: region,
  logger: console
});

const snsClient = new SNSClient({ region: region });

const badStatus = (errorString) => {
  return {
    statusCode: 500,
    body: `{ "error": "${errorString}"}`
  };
};

const goodStatus = (itemKeys) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      count: itemKeys.length,
      keys: itemKeys
    })
  };
};

function buildResourceListFromPlaylist(fileContents, resourceTemplate = {}) {
  //parse the playlist data
  const playlist = HLS.parse(fileContents);

  //convert each segment into { url, title }
  const segments = playlist.segments.map((segment) => {
    //find the first title in prop attributes for this entry
    const title = segment.properties.reduce(
      (accum, prop) => {
        if (
          /* stop at first title */
          accum.title === null &&
          prop.type === 'TAG' &&
          prop.tagName === 'EXTINF'
        ) {
          accum.title = prop.attributes.title;
        }

        return accum;
      },
      { title: null }
    );

    const resource = {
      ...resourceTemplate,
      ...title,
      url: segment.uri
    };

    return resource;
  });

  //only return mp3 files from the playlist
  const filteredSegments = segments.filter((segment) =>
    segment.url.match(/\.mp3$/g)
  );

  return filteredSegments;
}

const putItem = async (pk, sk, resource) => {
  const putItemParams = {
    TableName: table,
    Item: {
      PK: {
        S: pk
      },
      SK: {
        S: sk
      },
      ParentURL: {
        S: resource.parentUrl || ''
      },
      URL: {
        S: resource.url
      },
      Desc: {
        S: resource.desc || ''
      },
      Title: {
        S: resource.title || ''
      },
      Status: {
        S: 'download-pending'
      }
    }
  };

  const publishParams = {
    TopicArn: topic,
    Message: JSON.stringify({
      PK: pk,
      SK: sk,
      url: resource.url
    })
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

  try {
    console.log('publish params', publishParams);
    const publishResponse = await snsClient.send(
      new PublishCommand(publishParams)
    );
    console.log('publish response', publishResponse);
  } catch (error) {
    console.error('publish error', error);
    throw error;
  }

  return { pk, sk };
};

//reject promise when status != 200
const validateStatus = (status) => {
  return status === 200;
};

const maxResourcesToCapture = 3;

const handler = async (event) => {
  const url = event.url;
  const desc = event.desc;

  /*
    { url, desc, title, parentUrl }
   */
  const resources = [];

  try {
    //Check the content-type for the resource.
    //See http://help.dottoro.com/lapuadlp.php for content-type values.
    //TODO: match aliases as well?

    const headResponse = await axios.head(url, { validateStatus });
    console.log('headers:', JSON.stringify(headResponse.headers));
    const contentType = headResponse.headers['content-type'];

    //mp3 file
    if (contentType === 'audio/mpeg') {
      resources.push({
        url,
        desc,
        parentUrl: null,
        title: null
      });
    }
    //m3u file (mp3 playlist)
    else if (contentType === 'audio/x-mpegurl') {
      //Fetch playlist contents
      const playlistResponse = await axios.get(url, { validateStatus });

      resources.push(
        ...buildResourceListFromPlaylist(playlistResponse.data, {
          parentUrl: url,
          desc
        })
      );
    } else {
      const msg = `Unsupported content-type for ${url}, content-type=${contentType}`;
      console.error(msg);
      return badStatus(msg);
    }

    console.log('resources:', JSON.stringify(resources));

    //Persist the list of resources to DynamoDB.
    //And publish a message to SNS to trigger S3 upload.

    //Return an array of keys to the caller.
    const itemKeys = [];
    let index = 0;
    for (const resource of resources.slice(0, maxResourcesToCapture)) {
      //PartitionKey is the auth subject.
      const pk = event.sub;

      //SortKey is ULID + index if there are multiple resources from a playlist.
      const sk = ulid() + '#' + index++;

      itemKeys.push(putItem(pk, sk, resource));
    }

    return goodStatus(itemKeys);
  } catch (error) {
    let msg = null;

    //axios error
    if (error.config) {
      msg = error.toJSON();
    } else {
      msg = JSON.stringify(error);
    }

    console.error('caught an error', msg);
    return badStatus(msg);
  }
};

//THE entry point for lambda
module.exports.handler = handler;

//For unit tests
module.exports.buildResourceListFromPlaylist = buildResourceListFromPlaylist;
