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
