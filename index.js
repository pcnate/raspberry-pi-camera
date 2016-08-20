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


var upload = false;
var j = schedule.scheduleJob('* * * * *', function() {
  upload = true;
})

var image = '';

var imageTime = new Date();

var count = 0;
var tempImage = '';
var args = ['-vf', '-hf', '-w', '1920', '-h', '1080', '-o', '/dev/shm/current.jpg', '-t', '999999999', '-tl', '10000', '-v'];
// var args = ['-vf', '-hf', '-w', '1920', '-h', '1080', '-o', '/dev/shm/current.jpg', '-t', '999999999', '-tl', '10000', '-v', '--annotate', '12'];
var pic = spawn('raspistill', args);

pic.stdout.on('data', (data) => {
  console.log( 'stdout: ', data );
});

pic.on('close', (code) => {
  console.log( 'raspistill ended with code:', code );
})

fs.watchFile('/dev/shm/current.jpg', function( current, previous ) {
  console.log('taking new image');
  imageTime = new Date();
  fs.readFile('/dev/shm/current.jpg', function( err, data ) {
    image = data;

    if( upload ) {

      upload = false;
      console.log('uploading new image');

      tempImage = image;

      fs.writeFile('/dev/shm/upload.jpg', image, function() {
        var uploadImage = spawn('curl', ['-i','-F','time='+imageTime.toString(),'-F','deviceID='+ config.deviceID,'-F','filedata=@/dev/shm/upload.jpg','https://cam.cloud-things.com/upload/','-o','/dev/shm/cam-curl.log']);
        uploadImage.on('close', function() {
          console.log('uploading new image done');
          serverEmitter.emit('imageUploaded');
        })
      })

    }
    serverEmitter.emit('imageRefresh');
  })
})


serverEmitter.on('startService', function() {

  console.log( config );

  // setup the server
  var express = require("express");
  var app = express();
  var http = require("http").Server(app);
  var io = require("socket.io")(http);

  // root index
  app.get('/', function( req, res ) {
    res.sendFile('webapp/index.html', { root: __dirname });
  })

  // static image files
  app.use('/images', express.static( __dirname + '/webapp/images' ) );

  // image is loaded from memory
  app.get('/current.jpg', function( req, res ) {

    if( image && image.length > 0 ) {
      res.writeHead( 200, { 'Content-Type': 'image/jpeg' } );
      res.write( image );
      res.end();
    } else {
      res.writeHead( 400, { 'Content-Type': 'text/plain' } );
      res.write( 'No image available' );
      res.end();
    }

  })

  http.listen( 3000 , function() {
    console.log("listening on port 3000");
  })

  var client = require("socket.io-client")( config.protocol + "://" + config.server + ":" + config.port );

  // TODO need to detect current connection
  client.on("connect", function() {
    console.log('connected to other server');
    serverEmitter.on("imageUploaded", function() {
      client.emit("imageRefresh");
    })
    client.on("disconnect", function() {
      console.log('disconnected from server');
    })
  })

  //
  io.sockets.on("connection", function( socket ) {
    console.log('client connected');
    serverEmitter.on("imageRefresh", function() {
      console.log('telling client to load new image');
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
