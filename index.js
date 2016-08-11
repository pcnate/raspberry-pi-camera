const fs            = require("fs");
const EventEmmitter = require("events");
const spawn         = require("child_process").spawn;
const schedule      = require("node-schedule");

const configFilePath = "config.json";

class ServerEmitter extends EventEmmitter {}
const serverEmitter = new ServerEmitter();

const apikey = "2s69BQaluNX4mRX9UisKl2xb7GX2nUqXoQU0Ysl5tSfs27GuZatIUc8KQz8JA1f8tjhmvhizeVpuRHoO91GR6o2lMaRVYGnErH454ZITOPDNUIdmDKCd9U83pxuwp6kUUDqzwvLc9Vhwx0PFN5nrtvT0KUeRF97qbfXGxfSK16SUiEyHOKdBpQKESsLPGj6r3K0K2CUelFWNfSYvHCyC9b5QEQTtIlcMRunhKk7LA9rg9Q1m85AT1YRb90VEzGxd";

var imageTime = new Date();
var pic = spawn('raspistill', ['-vf', '-hf', '-w', '1920', '-h', '1080', '-o', '/dev/shm/current.jpg']);
var j = {}

var upload = false;
j = schedule.scheduleJob('* * * * *', function() {
  upload = true;
})

serverEmitter.on('takeImage', function() {
  console.log('taking new image');
  imageTime = new Date();
  pic = spawn('raspistill', ['-vf', '-hf', '-w', '1920', '-h', '1080', '-o', '/dev/shm/current.jpg']);

  pic.on('close', ( code ) => {
    serverEmitter.emit("imageRefresh");

    if( upload ) {
      upload = false;
      const uploadImage = spawn('curl', ['-i','-F','time='+imageTime.toString(),'-F','key='+apikey,'-F','filedata=@/dev/shm/current.jpg','https://cam.cloud-things.com/upload/','-o','/dev/shm/cam-curl.log']);
      uploadImage.on('close', function() {
        console.log('uploading image done');
        serverEmitter.emit('takeImage');
      })
    } else {
      serverEmitter.emit('takeImage');
    }

  });

})

pic.on('close', function() {
  serverEmitter.emit('takeImage');
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
