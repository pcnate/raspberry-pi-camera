const fs            = require("fs");
const EventEmmitter = require("events");
const spawn         = require("child_process").spawn;

const configFilePath = "config.json";

class ServerEmitter extends EventEmmitter {}
const serverEmitter = new ServerEmitter();

const schedule = require("node-schedule");
var j = schedule.scheduleJob('* * * * *', function() {
  const pic = spawn('raspistill', ['-vf', '-hf', '-w', '1920', '-h', '1080', '-o', '/dev/shm/current.jpg', '--annotate', '12']);

  pic.on('close', ( code ) => {
    console.log('picture updated');
    serverEmitter.emit("imageRefresh");
  });

})

serverEmitter.on('startService', function( config ) {

  console.log( config );

  var app = require("express")();
  var http = require("http").Server(app);
  var io = require("socket.io")(http);

  app.get('/', function( req, res ) {
    res.sendFile('webapp/index.html', { root: __dirname });
  })

  app.get('/current.jpg', function( req, res ) {
    res.sendFile('/dev/shm/current.jpg');
  })

  http.listen( 3000 , function() {
    console.log("listening on port 3000");
  })

  var other_server = require("socket.io-client")( config.protocol + "://" + config.server + ":" + config.port );

  other_server.on("connect", function() {
    console.log('connected to other server');
  })

  io.sockets.on("connection", function( socket ) {
    serverEmitter.on("imageRefresh", function() {
      socket.emit("imageRefresh");
    })
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
