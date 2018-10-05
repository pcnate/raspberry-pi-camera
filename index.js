const fs            = require("fs");
const EventEmmitter = require("events");
const spawn         = require("child_process").spawn;
const schedule      = require("node-schedule");
const https         = require('https');
const FormData      = require('form-data');

const configFilePath = "config.json";
var config = {
  deviceID: ''
};

class ServerEmitter extends EventEmmitter {}
const serverEmitter = new ServerEmitter();

var delay = 10;

var image = '';
var uploadImage = '';
var baseUploadUrl = '';

var dt = new Date();
var secInterval = setInterval( () => {
  dt = new Date();
  if( dt.getSeconds() % delay === 0 ) {
    clearInterval( secInterval );
    serverEmitter.emit('startCamera');
  } else {
    console.log( delay - (dt.getSeconds() % delay) );
  }
}, 1000 );

serverEmitter.on('startCamera', () => {
  var imageTime = new Date();

  var args = [
    // '-v',
    '-vf',
    '-hf',
    '-w', '1920',
    '-h', '1080',
    '-o', '/dev/shm/current.jpg',
    '-t', '999999999',
    '-tl', delay*1000,
    '-a', 4+8,
    // '-a', 'test',
  ];
  var pic = spawn('raspistill', args);

  pic.stdout.on('data', (data) => {
    console.log( 'stdout: ', data );
  });

  pic.on('close', (code) => {
    console.log( 'raspistill ended with code:', code );
  })

  // watch for changes on the file and upload them to the server
  fs.watchFile('/dev/shm/current.jpg', ( current, previous ) => {

    console.log('taking new image');
    unixTimestamp = Math.round( ( new Date() ).getTime() / 1000 );

    console.log('uploading new image');

    var form = new FormData();

    form.append( 'filedata', fs.createReadStream( '/dev/shm/current.jpg' ) );

    let uploadPath = config.baseUploadUrl + '/' + unixTimestamp;

    form.submit( uploadPath, ( error, response ) => {
      console.log( 'done uploading' );
    } )

  })
})


/**
 *  exit the application if no configuration file is found
 */
if( !fs.existsSync('config.json') ) {
  console.log('No config.json file');
  console.log('please run run configure.js');
  console.log('exiting');
  require('process').exit();
} else {

  let configJSON = fs.readFileSync( configFilePath );
  config = JSON.parse( configJSON );

  config.baseUploadUrl = config.protocol + '://' + config.server + ( config.port === '' ? '' : ':' + config.port ) + '/upload/' + config.deviceID;

}
