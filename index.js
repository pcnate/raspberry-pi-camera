const fs            = require("fs");
const EventEmmitter = require("events");
const spawn         = require("child_process").spawn;
const schedule      = require("node-schedule");

const configFilePath = "config.json";
var config = {
  deviceID: ''
};

class ServerEmitter extends EventEmmitter {}
const serverEmitter = new ServerEmitter();

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
      const uploadImage = spawn('curl', ['-i','-F','time='+imageTime.toString(),'-F','deviceID='+ config.deviceID,'-F','filedata=@/dev/shm/current.jpg','https://cam.cloud-things.com/upload/','-o','/dev/shm/cam-curl.log']);
      uploadImage.on('close', function() {
        console.log('uploading image done');
        serverEmitter.emit('imageUploaded');
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

serverEmitter.on('startService', function() {

  console.log( config );

  var express = require("express");
  var app = express();
  var http = require("http").Server(app);
  var io = require("socket.io")(http);

  app.get('/', function( req, res ) {
    res.sendFile('webapp/index.html', { root: __dirname });
  })

  app.use('/images', express.static( __dirname + '/webapp/images' ) );

  app.get('/current.jpg', function( req, res ) {
    res.sendFile('/dev/shm/current.jpg');
  })

  http.listen( 3000 , function() {
    console.log("listening on port 3000");
  })

  var client = require("socket.io-client")( config.protocol + "://" + config.server + ":" + config.port );

  client.on("connect", function() {
    console.log('connected to other server');
    serverEmitter.on("imageUploaded", function() {
      client.emit("imageRefresh");
    })
    client.on("disconnect", function() {
      console.log('disconnected from server');
    })
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

  let configJSON = fs.readFileSync( configFilePath );
  config = JSON.parse( configJSON );

  serverEmitter.emit('startService' );

}
