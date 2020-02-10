FIRAT'S SAMPLE CHAT APP (W/ NODE.JS & SOCKET.IO & ANGULAR JS)
-------------------------------------------------------------
This is a simple application that I wrote joyfully for making my own chat room & also practising socket programming approaches with Node.js & Socket.io pair.

App is pretty simple and reminds me of ICQ / MSN Messenger times back in 90s-2000s when I was a teenager 😊


INSTRUCTIONS TO RUN THE APP
---------------------------

- Install Node.js first (download from Node.js web site and install)
- Clone the repo to your PC or Mac
- Open command line and go to the project directory
- Install dependency module 'express' > (npm install express)
- Install dependency module 'socket.io' > (npm install socket.io) OR (npm install socket.io@2.3.0) for specific version
  (In my experiences, it was better if socket.io client js script version and its server-side node package version were the same..)
- Run the app > (node socket_io_server) OR (node socket_io_server.js)


HOW TO INVITE YOUR FRIENDS TO YOUR CHAT ROOM
--------------------------------------------
Internal Network Case:
After running the node.js App on your PC, you can give your friend (who is in the same network with you) the chat room link like this;
http://{YOUR_COMPUTERS_INTERNAL_IP}:3000

External Network Case:
If you want your friend who is out of your network (somewhere in the world who has an internet connection) to join your chat room, you need to add "WAN to LAN mapping rule" to your router first.

Mapping should be like; WAN:{YOUR_ROUTERS_EXTERNAL_IP}:3000 -> LAN:{YOUR_COMPUTERS_INTERNAL_IP}:3000
(3000 is not necessary though, it can be anything you decide) (be careful not to use reserved port numbers)

After setting your router properly, you can give your friend the chat room link like this;
http://{YOUR_ROUTERS_EXTERNAL_IP}:3000

Your router will get the request from the internet and will route it to your computer's 3000 port which is our Node.js app is listening to clients to connect on.


THINGS TO BE CAREFUL ABOUT
--------------------------
- I recommend removing (or inactivating) the port forwarding rule on your router after playing around (since that port will be always open to attacks unless you have a good firewall).
- I recommend not to send sensitive info to your friend through the chat room since connection is not secure and messages are not encrypted either.


ENJOY! :)