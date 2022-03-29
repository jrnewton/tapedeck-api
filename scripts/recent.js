'use strict';

//This script executes the 'list' API, displaying recent uploads within last X days.
//It requires that you create a file in the same directory called 'creds.js'
//in this format:
// module.exports = {
//   username: 'user@example.com',
//   password: 'somepassword'
// };

const { Auth } = require('@aws-amplify/auth');
const axios = require('axios').default;
const { username, password } = require('./creds');

(async function () {
  Auth.configure({
    aws_cognito_region: 'us-east-2',
    aws_user_pools_id: 'us-east-2_qWWSu06kb',
    aws_user_pools_web_client_id: '4ngbb9lsqa61vq3dfc21c85k11',
    oauth: {}
  });

  const cognitoUser = await Auth.signIn(username, password);
  //console.log('user', cognitoUser);

  const session = cognitoUser.getSignInUserSession();
  const accessToken = session.getAccessToken().getJwtToken();
  const idToken = session.getIdToken().getJwtToken();

  console.log('access token', accessToken);
  console.log('id token', idToken);

  const headers = {
    //prettier-ignore
    'Authorization': idToken
  };
  console.log('headers', headers);

  const url = `https://9rxe670nh8.execute-api.us-east-2.amazonaws.com/dev/list/all?accessToken=${accessToken}`;
  console.log('GET', url);

  // const response =
  try {
    const response = await axios.get(url, {
      headers
    });
    //console.log(response.data.requestContext.authorizer.claims.sub);
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log('response', error.response.data);
      console.log('status', error.response.status);
      console.log('headers', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log('no response received', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('General error', error.message);
    }
    //console.log(error.config);
  }
})();
