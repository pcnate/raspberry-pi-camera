#!/usr/bin/env node

const dotenv    = require('dotenv'),
      paths     = require('./paths'),
      fs        = require("fs-extra"),
      util      = require("util"),
      ini       = require("ini"),
      prompt    = require("prompt"),
      promptGet = util.promisify( prompt.get ),
      uuidv5    = require("uuid/v5"),
      schema    = require('./schema');

dotenv.config({
  path: paths.configFilePath
});

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
  result.deviceID = result.deviceID == schema.GEN_ID ? uuidv5( result.uploadURL, uuidv5.URL ) : result.deviceID;

  // save the file
  await fs.writeFile( paths.configFilePath, ini.stringify( result ) );
  console.log("\r\nConfiguration saved\r\n");

} )();
