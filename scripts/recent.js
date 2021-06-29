'use strict';

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

  const url = `https://9rxe670nh8.execute-api.us-east-2.amazonaws.com/dev/list/recent/days?accessToken=${accessToken}`;

  console.log('GET', url);

  const response = await axios.get(url, {
    headers: {
      //prettier-ignore
      'Authorization': idToken
    }
  });

  console.log(JSON.stringify(response.data, null, 2));

  //response.data.requestContext.authorizer.claims.sub
})();
