# raspberry-pi-camera
nodejs camera application to upload images to server

Server software https://github.com/pcnate/raspberry-pi-camera-server

# Standalone Install

1) setup a server
2) `npm install -g @pcnate/raspberry-pi-camera`
3) enter url to upload to
4) leave GUID blank
5) leave image path alone, (stores in RAM to save SD card)

# Automatic startup with pm2

1) `npm install -g pm2`
2) `pm2 startup`
3) `pm2 install @pcnate/raspberry-pi-camera`
