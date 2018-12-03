#!/usr/bin/env node

const dotenv = require('dotenv');
const paths = require('./paths');
const path = require('path');
const fs = require('fs-extra');
const fork = require('child_process').fork;
const sensor = require('ds18b20-raspi');

dotenv.config({
  path: paths.configFilePath
});

let imageIndex = 1;
let timer = null;

/**
 * copy a test image over to trigger the watchfile
 */
function copyImage() {
  const source = path.join( __dirname, 'devAssets', imageIndex + '.jpg' );
  fs.copy( source, process.env.imageFilePath, {}, err => {
    if( err ) console.error( 'error copying image', err );
  });
  imageIndex = imageIndex === 10 ? 1 : imageIndex + 1;
  getTemp();
}

/**
 * fork the process and 
 */
const workerProcess = fork( path.join( __dirname, 'server.js' ) );

// listen for message to start timer
workerProcess.on( 'message', async( data ) => {
  if( data === 'start timer' ) {
    timer = setInterval( copyImage, 5*1000 );
  }
});

// exit the app if the worker exits so nodemon can restart
workerProcess.on( 'close', code => {
  clearInterval( timer );
  process.exit(1);
});

async function getTemp() {
  const temps = sensor.readAllF();
  console.log( temps, new Date().toISOString() );
}