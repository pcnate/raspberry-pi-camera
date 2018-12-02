const dotenv    = require('dotenv');
const paths     = require('./paths');
const fs        = require("fs-extra");
const util      = require("util");
const ini       = require("ini");
const prompt    = require("prompt");
const promptGet = util.promisify( prompt.get );
const uuidv5    = require("uuid/v5");

dotenv.config({
  path: paths.configFilePath
});

// default values
var schema = require('./schema');

( async() => {

  for ( const key in schema.properties ) {
    if ( typeof process.env[key] !== 'undefined' ) {
      schema.properties[key].default = process.env[key];
    }
  }
  
  // make sure the config directiory exists
  await fs.ensureDir( paths.configFolder );

  // Start the prompt
  console.log("\r\nGenerating new configuration:\r\n");
  prompt.start();

  // prompt for the 
  const result = await promptGet( schema );

  // generate a new GUID if none is specified
  result.deviceID = result.deviceID == schema.GEN_ID ? result.deviceID = uuidv5( result.uploadURL, uuidv5.URL ) : result.deviceID;

  // save the file
  await fs.writeFile( paths.configFilePath, ini.stringify( result ) );
  console.log("\r\nConfiguration saved\r\n");

} )();
