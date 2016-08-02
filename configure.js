/**
 *
 */
const fs            = require("fs");
const prompt        = require("prompt");
const EventEmmitter = require("events");
const uuid          = require("node-uuid");

const configFilePath = "config.json";
const GEN_ID = "Generate new ID";

class PromptEmitter extends EventEmmitter {}
const promptEmitter = new PromptEmitter();

// default values
var schema = {
  properties: {
    protocol: {
      'default': 'https',
      'require': true
    },
    server: {
      'default': 'example.com',
      'required': true
    },
    port: {
      'default': 3000,
      'required': true
    },
    deviceID: {
      'default': GEN_ID,
      'required': true
    }
  }
};

//
// Start the prompt
//
promptEmitter.on('readConfigFile', function() {

  let config = fs.readFileSync( configFilePath );
  config = JSON.parse( config );

  for( const key in config ) {
    if( typeof schema.properties[key] === 'undefined' ) {
      schema.properties[key] = {};
    }
    schema.properties[key].default = config[key];

  }

  promptEmitter.emit('startPrompt');

});

//
// Start the prompt
//
promptEmitter.on('startPrompt', function() {

  prompt.start();

  //
  // Get two properties from the user: username and email
  //
  prompt.get( schema, function( err, result ) {

    if( result.deviceID == GEN_ID ) {
      result.deviceID = uuid.v4();
    }

    let config = JSON.stringify( result, null, "  " );

    fs.writeFileSync( configFilePath, config );
    console.log("\r\nConfig saved\r\n");

  });

});

/**
 *  exit the application if no configuration file is found
 */
if( fs.existsSync( configFilePath ) ) {
  console.log("\r\nLoading existing configuration:\r\n");
  promptEmitter.emit('readConfigFile');
} else {
  console.log("\r\nGenerating new configuration:\r\n");
  promptEmitter.emit('startPrompt');
}
