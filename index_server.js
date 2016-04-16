
var ChatBot = require('./chatBot');
var BridgeServer = require('./bridgeServer');


var chatBot = ChatBot.create();

var bridgeServer = BridgeServer.create();
bridgeServer.chatBot = chatBot;
bridgeServer.start();
