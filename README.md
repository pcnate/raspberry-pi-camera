# raspberry-pi-camera
nodejs camera application to connect to server via socket.io

Server software https://github.com/pcnate/raspberry-pi-camera-server

# basic setup on raspberry pi

    curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
    sudo apt-get install -y nodejs build-essential
    
    git clone https://github.com/pcnate/raspberry-pi-camera.git

    npm update
    npm install
    
    node configure.js


# Installing nodejs

```
-#! /bin/bash
-
-# source: https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions
-
-curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
-sudo apt-get install -y nodejs build-essential
-
-
-node -v
-npm -v
-
-npm cache clean -f
-npm install -g n
-sudo n stable
-
-echo 'now exit and reconnect and run node -v && npm -v'
```