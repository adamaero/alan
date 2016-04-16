
var port = 57222;
var proto = 'alan-bridge';

var httpServer;
var wsServer;

function initHttp() {

  var http = require('http');

  httpServer = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
  });
  httpServer.listen(port, function() {
    console.log((new Date()) + ' Server is listening on port ' + port);
  });
}

function initWebSocket() {

  var WebSocketServer = require('websocket').server;

  wsServer = new WebSocketServer({
    httpServer: httpServer,
    autoAcceptConnections: false,
  });

  wsServer.on('request', function(request) {
    console.log((new Date()) + ' Connection from origin ' + request.origin);

    var connection = request.accept(proto, request.origin);
    console.log((new Date()) + ' Connection accepted.');

    connection.on('message', function(message) {
      console.log((new Date()) + ' Message : ' + message);

      if (message.type === 'utf8') {
        console.log('Message : ' + message.utf8Data);

        var cmd = JSON.parse(message.utf8Data);

        if (cmd.kind === 'event') {
          if (cmd.type === 'message') {

            connection.sendUTF(JSON.stringify({
              kind: 'cmd',
              type: 'write',
              data: cmd.data,
            }));
          }
          if (cmd.type === 'conversationEnded') {

            connection.sendUTF(JSON.stringify({
              kind: 'cmd',
              type: 'startConversation',
            }));
          }
        }

      } else {
        console.log((new Date()) + ' Message is binary, ignoring.');
      }

    });

    connection.on('close', function(reasonCode, description) {
      console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });

    connection.sendUTF(JSON.stringify({
      kind: 'cmd',
      type: 'startConversation',
    }));
    connection.sendUTF(JSON.stringify({
      kind: 'cmd',
      type: 'write',
      data: 'Bonjour',
    }));

  });

}


initHttp();
initWebSocket();
