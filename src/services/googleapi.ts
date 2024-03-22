const { google } = require('googleapis');

let MESSAGING_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";  // Corrected the scope URL
let SCOPES = [MESSAGING_SCOPE];

export function getAccessToken() {
  return new Promise(function(resolve, reject) {
    let key = require('../googleinfo.json');  // Corrected the path to the JSON file
    let jwtClient = new google.auth.JWT(  // Use 'auth' property to access 'JWT'
      key.client_email,
      undefined,
      key.private_key,  // Corrected the property name to 'private_key'
      SCOPES,
      undefined
    );
    jwtClient.authorize(function(err:any, tokens: any) {
      if(err) {
        reject(err);
        return;
      }
      resolve(tokens?.access_token)
    });
  })
}