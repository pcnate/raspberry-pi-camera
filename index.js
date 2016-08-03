const fs            = require("fs");
const EventEmmitter = require("events");

const configFilePath = "config.json";

class ServerEmitter extends EventEmmitter {}
const serverEmitter = new ServerEmitter();

serverEmitter.on('startService', function( config ) {

  console.log( config );

  var io = require("socket.io").listen(8080);

  var other_server = require("socket.io-client")( config.protocol + "://" + config.server + ":" + config.port );

  other_server.on("connect", function() {
    console.log('connected to other server');
  })

  io.sockets.on("connection", function( socket ) {
  })

})

/**
 *  exit the application if no configuration file is found
 */
if( !fs.existsSync("config.json") ) {
  console.log("No config.json file");
  console.log("please run run configure.js");
  console.log("exiting");
  require("process").exit();
} else {

  let config = fs.readFileSync( configFilePath );
  config = JSON.parse( config );

  serverEmitter.emit('startService', config );

}
