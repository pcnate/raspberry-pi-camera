#!/usr/bin/env node

const dotenv        = require('dotenv');
const path          = require('path');
const paths         = require('./paths');
const fs            = require("fs-extra");
const fso           = require("fs");
const spawn         = require("child_process").spawn;
const FormData      = require('form-data');
const sleep         = require('await-sleep');

dotenv.config({
  path: paths.configFilePath
});

if ( typeof process.env.deviceID === 'undefined' ) {
  console.error( 'please configure the application before starting')
  process.exit( 1 );
} else {
  console.log( 'starting camera', process.env.deviceID );
}

var pic = null;
var fileWatch = null;
var delay = process.env.cameraDelay || 5;

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
    pic = spawn('raspistill', args);

    pic.stdout.on('data', (data) => {
      console.log( 'stdout: ', data );
    });

    pic.on('close', code => {
      console.log( 'raspistill ended with code:', code );
    });
  }
}

/**
 * asynchronously wait for the file to exist
 * 
 * @param {string} file path to file
 */
async function waitForFile( file ) {
  while( true ) {
    const exists = await fs.exists( file );
    if( exists ) return true;
    console.log( 'file does not yet exist, waiting longer' );
    await sleep( 333 );
  }
}

// watch for changes on the file and upload them to the server
// using native fs for now, switching to something better later
( async() => {

  // wait for file to be created
  await waitForFile( process.env.imageFilePath );

  // watch the file
  fileWatch = fso.watch( path.dirname( process.env.imageFilePath ), async( event, changed_fname ) => {

    if( event !== 'change' ) {
      return;
    }

    unixTimestamp = Math.round( ( new Date() ).getTime() / 1000 );

    try {
      var form = new FormData();
      form.append( 'filedata', fs.createReadStream( process.env.imageFilePath ) );
      
      const uploadPath = process.env.uploadURL + [ '/upload', process.env.deviceID, unixTimestamp ].join('/');

      await form.submit( uploadPath, err => {
        if ( err ) console.error( 'error submitting form', err );
      });
    } catch( error ) {
      console.error( 'error trying to read the image and upload it', error );
    }

  });
})();

/**
 * gracefully shut the application down
 */
async function shutdown() {
  console.info( 'shutting down...' );
  // stop raspistill if it running
  if( pic !== null ) {
    console.info( 'stopping raspistill...' );
    pic.kill('SIGINT');
  }
  if( fileWatch !== null ) {
    console.info( 'removing file watch...' );
    fileWatch.close();
  }
  console.info( 'done...' );
  process.exit(0);
}

// listen for SIGINT and clean up
process.on('SIGINT', async () => {
  console.info( '\r\n\r\n', 'SIGINT signal recieved' );
  shutdown();
});

// windows
process.on('message', (msg) => {
  if (msg == 'shutdown') {
    shutdown();
  }
})
