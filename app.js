const osc = require("osc");
const keypress = require("keypress");

var udpPort = new osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: 8001,
  //remoteAddress: "192.168.50.201",
  remoteAddress: "127.0.0.1",
  remotePort: 8000,
  metadata: true,
});

udpPort.on("message", function (oscMsg, timeTag, info) {
  console.log("An OSC message just arrived!", oscMsg);
  console.log("Remote info is: ", info);
});

udpPort.on("ready", function () {
  console.log("ready");

  keypress(process.stdin);
  process.stdin.on("keypress", (ch, key) => {
    if ((key && key.ctrl && key.name === "c") || (key && key.name === "q")) {
      process.exit();
    }
    switch (key.name) {
      case "left":
        var v = Math.random();
        console.log(v);
        console.log("left");
        udpPort.send({
          address: "/carrier/frequency",
          args: [
            {
              type: "f",
              value: v,
            },
          ],
        });
        break;
      case "right":
        console.log("right");
        udpPort.send({
          address: "/carrier/frequency",
          args: [
            {
              type: "f",
              value: 440,
            },
            {
              type: "f",
              value: 400,
            },
          ],
        });
        break;
    }
  });

  //process.stdin.setRawMode(true); //nodemonで起動するときにエラーになるのでコメントアウト
  process.stdin.resume();
});

udpPort.on("error", function (err) {
  console.log(err);
});

udpPort.open();


// HTTP Portion
var http = require('http');
// URL module
var url = require('url');
var path = require('path');

// Using the filesystem module
var fs = require('fs');

var server = http.createServer(handleRequest);
server.listen(8080);

console.log('Server started on port 8080');

function handleRequest(req, res) {
  // What did we request?
  var pathname = req.url;
  
  // If blank let's ask for index.html
  if (pathname == '/') {
    pathname = '/index.html';
  }
  
  // Ok what's our file extension
  var ext = path.extname(pathname);

  // Map extension to file type
  var typeExt = {
    '.html': 'text/html',
    '.js':   'text/javascript',
    '.css':  'text/css'
  };

  // What is it?  Default to plain text
  var contentType = typeExt[ext] || 'text/plain';

  // User file system module
  fs.readFile(__dirname + pathname,
    // Callback function for reading
    function (err, data) {
      // if there is an error
      if (err) {
        res.writeHead(500);
        return res.end('Error loading ' + pathname);
      }
      // Otherwise, send the data, the contents of the file
      res.writeHead(200,{ 'Content-Type': contentType });
      res.end(data);
    }
  );
}


// WebSocket Portion
// WebSockets work with the HTTP server
//var io = require('socket.io')(server);
const io = require('socket.io')(server, {
  cors: {
      origin: "http://localhost:8100",
      methods: ["GET", "POST"],
      transports: ['websocket', 'polling'],
      credentials: true
  },
  allowEIO3: true
});

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection',
  // We are given a websocket object in our function
  function (socket) {
  
    console.log("We have a new client: " + socket.id);
  
    // When this user emits, client side: socket.emit('otherevent',some data);
    socket.on('mouse',
      function(data) {
        // Data comes in as whatever was sent, including objects
        console.log("Received: 'mouse' " + data.x + " " + data.y);
      
        // Send it to all other clients
        socket.broadcast.emit('mouse', data);
        
        udpPort.send({
          address: "/chan1",
          args: [
            {
              type: "i",
              value: data.x,
            },
            {
              type: "i",
              value: data.y,
            }
          ]
        });
        // This is a way to send to everyone including sender
        // io.sockets.emit('message', "this goes to everyone");

      }
    );
    
    socket.on('disconnect', function() {
      console.log("Client has disconnected");
    });
  }
);