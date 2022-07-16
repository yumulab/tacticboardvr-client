const osc = require("osc");
const keypress = require("keypress");
const settings = require('./settings.js');
const oscLocalAddress = settings.oscLocalAddress;
const oscLocalPort = settings.oscLocalPort;
const oscRemoteAddress = settings.oscRemoteAddress;
const oscRemotePort = settings.oscRemotePort;

var udpPort = new osc.UDPPort({
  localAddress: oscLocalAddress,
  localPort: oscLocalPort,
  remoteAddress: oscRemoteAddress,
  remotePort: oscRemotePort,
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

  //process.stdin.setRawMode(true); nodemonで起動するときにエラーになるのでコメントアウト
  process.stdin.resume();
});

udpPort.on("error", function (err) {
  console.log(err);
});

udpPort.open();


var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');

var server = http.createServer(handleRequest);
server.listen(8080);

console.log('Server started on port 8080');

function handleRequest(req, res) {
  var pathname = req.url;
  
  if (pathname == '/') {
    pathname = '/index.html';
  }
  
  var ext = path.extname(pathname);

  var typeExt = {
    '.html': 'text/html',
    '.js':   'text/javascript',
    '.css':  'text/css'
  };

  var contentType = typeExt[ext] || 'text/plain';

  fs.readFile(__dirname + pathname,
    function (err, data) {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading ' + pathname);
      }
      res.writeHead(200,{ 'Content-Type': contentType });
      res.end(data);
    }
  );
}


const io = require('socket.io')(server, {
  cors: {
      origin: "http://127.0.0.1:8081",
      methods: ["GET", "POST"],
      transports: ['websocket', 'polling'],
      credentials: true
  },
  allowEIO3: true
});

io.sockets.on('connection',
  function (socket) {
  
    console.log("We have a new client: " + socket.id);
  
    socket.on('move',
      function(data) {
        console.log("Received: 'move' " + data.x + " " + data.y);
        //socket.broadcast.emit('mouse', data);
        
        udpPort.send({
          address: "/pos/"+data.team.toString(),
          args: [
            {
              type: "i",
              value: data.x,
            },
            {
              type: "i",
              value: data.y,
            },
            {
              type: "i",
              value: data.id,
            }
          ]
        });
      }
    );
    
    socket.on('disconnect', function() {
      console.log("Client has disconnected");
    });
  }
);