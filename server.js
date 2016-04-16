
var ChatBot = require('./server/chatBot');
var BridgeServer = require('./server/bridgeServer');


var chatBot = ChatBot.create();

var bridgeServer = BridgeServer.create();
bridgeServer.chatBot = chatBot;
bridgeServer.start();
