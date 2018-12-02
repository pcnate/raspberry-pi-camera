const dotenv        = require('dotenv');
const paths         = require('./paths');
const fs            = require("fs-extra");
const fso           = require("fs");
const spawn         = require("child_process").spawn;
const FormData      = require('form-data');

dotenv.config({
  path: paths.configFilePath
});

if ( typeof process.env.deviceID === 'undefined' ) {
  console.error( 'please configure the application before starting')
  process.exit( 1 );
} else {
  console.log( 'starting camera', process.env.deviceID );
}

// create the file first
fs.exists( process.env.imageFilePath, async ( exists ) => {
  if( !exists ) {
    console.log( 'image didt exist yet, creating...' );
    await fs.writeFile( process.env.imageFilePath, '' );
  }
});

var delay = 5;

var dt = new Date();
var secInterval = setInterval( () => {
  dt = new Date();
  if( dt.getSeconds() % delay === 0 ) {
    clearInterval( secInterval );
    startCamera();
  }
}, 1000 );

/**
 * start the camera application
 */
async function startCamera() {

  if( process.env.NODE_ENV === 'development' ) {
    // send message for emulate.js to start image updates
    process.send( 'start timer' );
  } else {
    var args = [
      // '-v',
      '-vf',
      '-hf',
      '-w', '1920',
      '-h', '1080',
      '-o', process.env.imageFilePath,
      '-t', '999999999',
      '-tl', delay*1000,
      '-a', 4+8,
      // '-a', 'test',
    ];
    var pic = spawn('raspistill', args);

    pic.stdout.on('data', (data) => {
      console.log( 'stdout: ', data );
    });

    pic.on('close', code => {
      console.log( 'raspistill ended with code:', code );
    });
  }
}

// watch for changes on the file and upload them to the server
// using native fs for now, switching to something better later
fso.watchFile( process.env.imageFilePath, async() => {

  unixTimestamp = Math.round( ( new Date() ).getTime() / 1000 );

  var form = new FormData();
  form.append( 'filedata', fs.createReadStream( process.env.imageFilePath ) );
  
  const uploadPath = process.env.uploadURL + [ '/upload', process.env.deviceID, unixTimestamp ].join('/');

  await form.submit( uploadPath, err => {
    if ( err ) console.error( 'error submitting form', err );
  });

});
