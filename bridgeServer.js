
const wsPort = 57222;
const wsProto = 'alan-bridge';


module.exports = {

  create: function() {

    var httpServer;
    var wsServer;

    function start() {
      initHttpServer();
      initWebSocketServer();
    }

    function initHttpServer() {
      httpServer = require('http').createServer(function(request, response) {
        console.log((new Date()) + ' Received request for ' + request.url);
        response.writeHead(404);
        response.end();
      });
      httpServer.listen(wsPort, function() {
        console.log((new Date()) + ' Server is listening on port ' + wsPort);
      });
    }

    function initWebSocketServer() {
      wsServer = new (require('websocket').server)({
        httpServer: httpServer,
        autoAcceptConnections: false,
      });
      wsServer.on('request', function(request) {
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' with protocols : ' + request.requestedProtocols);
        if (request.origin !== 'http://www.omegle.com') {
          request.reject();
          console.log((new Date()) + ' Connection rejected because of its origin.');
          return;
        }
        if (request.requestedProtocols.indexOf(wsProto) === -1) {
          request.reject();
          console.log((new Date()) + ' Connection rejected because of its protocols.');
          return;
        }
        var connection = request.accept(wsProto, request.origin);
        console.log((new Date()) + ' Connection accepted.');
        initWebSocketConnection(connection);
      });
    }

    function initWebSocketConnection(connection) {
      connection.on('message', function(message) {
        console.log((new Date()) + ' Message : ' + message);
        if (message.type === 'utf8') {
          console.log('Message : ' + message.utf8Data);
          var cmd = JSON.parse(message.utf8Data);
          if (cmd.kind === 'event') {
            if (cmd.type === 'conversationStarted') {
              bridgeServer.chatBot.conversationStarted();
            }
            if (cmd.type === 'conversationEnded') {
              bridgeServer.chatBot.conversationEnded();
            }
            if (cmd.type === 'message') {
              bridgeServer.chatBot.message(cmd.data);
            }
          }
        } else {
          console.log((new Date()) + ' Message is binary, ignoring.');
        }
      });
      connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        bridgeServer.chatBot.stop();
      });
      bridgeServer.chatBot.onStartConversation = function() {
        connection.sendUTF(JSON.stringify({
          kind: 'cmd',
          type: 'startConversation',
        }));
      }
      bridgeServer.chatBot.onEndConversation = function() {
        connection.sendUTF(JSON.stringify({
          kind: 'cmd',
          type: 'endConversation',
        }));
      }
      bridgeServer.chatBot.onWrite = function(message) {
        connection.sendUTF(JSON.stringify({
          kind: 'cmd',
          type: 'write',
          data: message,
        }));
      }
      bridgeServer.chatBot.restart();
    }

    var bridgeServer = {

      start: start,
      chatBot: undefined,
    }

    return bridgeServer;
  }

};
