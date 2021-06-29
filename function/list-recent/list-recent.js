'use strict';

exports.handler = async (event) => {
  console.log('event', event);

  if (event.pathParameters && event.pathParameters.period) {
    const sub = event.requestContext.authorizer.claims.sub;
    const period = event.pathParameters.period;

    //https://www.trek10.com/blog/leveraging-ulids-to-create-order-in-unordered-datastores
    //4th character: 12 days, 10 hours
    //5th character: 9 hours, 19 minutes
    //6th character: 17 minutes, 28 seconds
    if (period === 'days') {
      return {
        statusCode: 200,
        body: JSON.stringify({
          sub,
          period: 'last 12 days'
        })
      };
    } else if (period === 'hours') {
      return {
        statusCode: 200,
        body: JSON.stringify({
          sub,
          period: 'last 9 hours'
        })
      };
    } else if (period === 'minutes') {
      return {
        statusCode: 200,
        body: JSON.stringify({
          sub,
          period: 'last 17 minutes'
        })
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify(`unsupported period ${period}`)
      };
    }
  }
  //this case shouldn't happen because APIGW will block upstream.
  else {
    return {
      statusCode: 404,
      body: JSON.stringify('path param or period missing')
    };
  }
};
