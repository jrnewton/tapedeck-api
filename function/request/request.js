//This is attached to the archive REST endpoint.
//It is responsible for initial validation of the URL
//and splitting up m3u playlist contents (if provided).
//It will result in one or more items be written to DynamoDB
//with status = 'download-pending'.

'use strict';

/* use '.default' otherwise you'll get a tslint warning
   see https://github.com/axios/axios/issues/1975 */
const axios = require('axios').default;
const HLS = require('parse-hls').default;
const ulid = require('ulid').ulid;
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');

const itemStatus = 'download-pending';
const region = 'us-east-2';
const table = 'tapedeck-20210421';

const ddbClient = new DynamoDBClient({
  region: region,
  logger: console
});

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

const putItem = async (PK, SK, resource) => {
  const putItemParams = {
    TableName: table,
    Item: {
      PK: {
        S: PK
      },
      SK: {
        S: SK
      },
      CreateDate: {
        S: new Date().toISOString()
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
      ItemStatus: {
        S: itemStatus
      },
      LastModified: {
        S: ''
      },
      LastDownloadDate: {
        S: ''
      },
      DownloadCount: {
        N: '0'
      },
      S3URL: {
        S: ''
      },
      S3Size: {
        N: '0'
      }
    }
  };

  try {
    console.log('PutItem params', putItemParams);
    const putItemResponse = await ddbClient.send(
      new PutItemCommand(putItemParams)
    );
    console.log('PutItem response', putItemResponse);
    return { PK, SK };
  } catch (error) {
    console.error('PutItem error', error);
    throw error;
  }
};

//reject promise when status != 200
const validateStatus = (status) => {
  return status === 200;
};

const maxResourcesToCapture = 3;

const handler = async (event) => {
  const url = event.url;
  const desc = event.desc;
  const sub = event.sub;

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

    //Return an array of keys to the caller.
    const itemKeys = [];
    let index = 0;

    for (const resource of resources.slice(0, maxResourcesToCapture)) {
      //PartitionKey is the auth subject.
      const PK = 'user#' + sub;

      //remember to pad numbers for DDB to ensure lexi sort.  This will give 0-999.
      const trackIndex = (++index + '').padStart(3, '0');

      //SortKey is ulid#track in case there are multiple resources from a playlist.
      const SK = `track#${ulid()}#${trackIndex}`;

      const key = await putItem(PK, SK, resource);
      console.log('putItem key', key);
      itemKeys.push(key);
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
