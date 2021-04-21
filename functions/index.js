const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.helloWorld = functions.https.onRequest((request, response) => {
  var serviceAccount = require('path/to/serviceAccountKey.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: '<BUCKET_NAME>.appspot.com'
  });

  var bucket = admin.storage().bucket();

  // 'bucket' is an object defined in the @google-cloud/storage library.
  // See https://googlecloudplatform.github.io/google-cloud-node/#/docs/storage/latest/storage/bucket
  // for more details.

  functions.logger.info('Hello logs!', { structuredData: true });
  response.send('Hello from Firebase!');
});
