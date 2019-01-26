# raspberry-pi-camera
[![Build status](https://dev.azure.com/pcnate/raspberry-pi-camera/_apis/build/status/raspberry-pi-camera-CI)](https://dev.azure.com/pcnate/raspberry-pi-camera/_build/latest?definitionId=1)

nodejs raspberry pi camera application to upload images to server. It is designed to be setup once and left alone. Additional configuration will be added to the server side.

> You will need a server to receive the image stream generated by the camera. I recommend [raspberry-pi-camera-server](https://github.com/pcnate/raspberry-pi-camera-server)

# Standalone Install

1) `npm install -g @pcnate/raspberry-pi-camera`
2) probably need ot exit terminal and reopen/reconnect
3) `raspberry-pi-camera-config`
4) `raspberry-pi-camera`

# Automatic startup with pm2

1) `npm install -g pm2 @pcnate/raspberry-pi-camera`
2) probably need to exit terminal and reopen/reconnect
3) `pm2 startup`
4) `raspberry-pi-camera-config`
5) `pm2 start raspberry-pi-camera --name cam`
6) `pm2 save`

# Configuration

1) `raspberry-pi-camera-config`
2) enter url to upload to
3) leave GUID blank
4) leave image path alone, (stores in RAM to save SD card)
