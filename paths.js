const path = require('path');

// get the users folder on whichever platform
const userFolder = process.env.APPDATA || path.join( process.env.HOME, ( process.platform == 'darwin' ? 'Library/Preferences' : '.config') );

const appFolder = 'raspberry-pi-camera';

const configFolder = path.join( userFolder, appFolder );

const configFilePath = path.join( configFolder, '.env');

module.exports = {
  userFolder,
  appFolder,
  configFolder,
  configFilePath,
}