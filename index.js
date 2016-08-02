const fs            = require("fs");
const EventEmmitter = require("events");

class serverEmitter extends EventEmmitter {}

/**
 *  exit the application if no configuration file is found
 */
if( !fs.existsSync("config.json") ) {
  console.log("No config.json file");
  console.log("please run run configure.js");
  console.log("exiting");
  require("process").exit();
} else {

}

var io = require("socket.io").listen(8080);

var other_server = require("socket.io-client")("http://128.10.100.92:3000");

other_server.on("connect", function() {
  console.log('connected to other server');
})

io.sockets.on("connection", function( socket ) {
})
