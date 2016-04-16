
function createBridgeClient() {

  var url = 'ws://localhost:57222';
  var proto = 'alan-bridge';

  var ws;

  function start() {

    console.log('BridgeClient - starting');

    initWebSocket();
  }

  function initWebSocket() {

    console.log('BridgeClient - WebSocket - Connecting to ' + url + ' with protocol ' + proto);
    ws = new WebSocket(url, proto);

    ws.onerror = function(err) {
      console.log('BridgeClient - WebSocket - Error :');
      console.error(err);
    }

    ws.onopen = function() {
      console.log('BridgeClient - WebSocket - Open');
      initChatAgent();
    }

    ws.onmessage = function(msg) {
      console.log('BridgeClient - WebSocket - Message : ' + msg.data);
      onRemoteCommand(JSON.parse(msg.data));
    }

    ws.onclose = function() {
      console.log('BridgeClient - WebSocket - Closed');
    }
  }

  function initChatAgent() {

    console.log('BridgeClient - configuring chat agent');

    bridgeClient.chatAgent.onConversationStarted = function() {
      onChatAgentCommand({
        kind: 'event',
        type: 'conversationStarted',
      });
    };

    bridgeClient.chatAgent.onConversationEnded = function() {
      onChatAgentCommand({
        kind: 'event',
        type: 'conversationEnded',
      });
    };

    bridgeClient.chatAgent.onMessage = function(message) {
      onChatAgentCommand({
        kind: 'event',
        type: 'message',
        data: message,
      });
    };
  }

  function onRemoteCommand(cmd) {
    if (cmd.kind === 'cmd') {
      if (cmd.type === 'startConversation') {
        bridgeClient.chatAgent.startConversation();
      }
      if (cmd.type === 'endConversation') {
        bridgeClient.chatAgent.endConversation();
      }
      if (cmd.type === 'write') {
        bridgeClient.chatAgent.write(cmd.data);
      }
    }
  }

  function onChatAgentCommand(cmd) {
    cmd = JSON.stringify(cmd);
    console.log('BridgeClient - sending chat agent command : ' + cmd);
    ws.send(cmd);
  }

  var bridgeClient = {

    start: start,
    chatAgent: undefined,

  };
  return bridgeClient;
}





function createOmegleChatAgent() {

  var domPollingIntervalId;
  var domPollingIntervalMs = 1000;

  /*
   * Commands
   */

  function startAgent() {
    console.log('OmegleChatAgent - starting agent');
    numberOfMessages = 0;
    domPollingIntervalId = setInterval(function() {
      checkNewMessages();
      checkConversationEnded();
    }, domPollingIntervalMs);
    console.log('OmegleChatAgent - agent started');
  }

  function stopAgent() {
    console.log('OmegleChatAgent - stopping agent');
    clearInterval(domPollingIntervalId);
    console.log('OmegleChatAgent - agent stopped');
  }

  function startConversation() {
    console.log('OmegleChatAgent - starting conversation');
    getStartButton().click();
    startAgent();
  }

  function endConversation() {
    console.log('OmegleChatAgent - ending conversation');
    console.log('OmegleChatAgent - NOTICE : unimplemented');
  }

  function write(message) {
    console.log('OmegleChatAgent - writing : ' + message);
    omegleChatAgent.typist.type(message);
  }

  function setTypist(typist) {
    console.log('OmegleChatAgent - setting typist');
    omegleChatAgent.typist = typist;
    typist.onType = function(content) {
      writeInChatBox(content);
    }
    typist.onCommit = function() {
      sendMessageInChatBox();
    }
  }

  /*
   * Content access
   */

  function getChatBox() {
    return document.querySelector('textarea');
  }

  function getSumbitButton() {
    return document.querySelector('.sendbtn');
  }

  function getStartButton() {
    var btn = document.querySelector('.newchatbtnwrapper img');
    if (!btn) {
      var btn = document.querySelector('#textbtn');
    }
    return btn;
  }

  function writeInChatBox(content) {
    getChatBox().value += content;
  }

  function sendMessageInChatBox() {
    console.log('OmegleChatAgent - sending message');
    getSumbitButton().click();
  }

  function getNumberOfMessages() {
    return document.querySelectorAll('.strangermsg').length;
  }

  function getLastMessage() {
    var items = document.querySelectorAll('.strangermsg span');
    return items[items.length-1].innerHTML;
  }

  /*
   * Internal logic
   */

  var numberOfMessages = 0;

  function checkNewMessages() {
    console.log('OmegleChatAgent - checking messages');
    var nb = getNumberOfMessages();
    if (nb > numberOfMessages) {
      var message = getLastMessage();
      onNewMessage(message);
    }
    numberOfMessages = nb;
  }

  function checkConversationEnded() {
    console.log('OmegleChatAgent - checking end of conversation');
    if (getStartButton()) {
      onConversationEnded();
    }
  }

  function onNewMessage(message) {
    console.log('OmegleChatAgent - new message : ' + message);
    omegleChatAgent.onMessage(message);
  }

  function onConversationEnded() {
    console.log('OmegleChatAgent - conversation ended');
    omegleChatAgent.stopAgent();
    omegleChatAgent.onConversationEnded();
  }

  var omegleChatAgent = {

    // start polling
    startAgent: startAgent,
    // stop polling
    stopAgent: stopAgent,
    // start conversation
    startConversation: startConversation,
    // end conversation
    endConversation: endConversation,
    // write message
    write: write,

    // set typing agent
    setTypist: setTypist,

    // received a message from peer
    onMessage: function(){},
    // conversation has started
    onConversationStarted: function(){},
    // conversation has ended
    onConversationEnded: function(){},

  };

  return omegleChatAgent;
}





function makeHumanTypist() {

  const typeInterval = 100;

  function typeMessage(msg) {
    for(var i=0 ; i<msg.length ; i++) {
      (function (i) {
        setTimeout(function() {
          type (msg[i]);
          if (i === msg.length-1) {
            commit();
          }
        }, typeInterval * i);
      }) (i);
    }
  }

  function type(content) {
    typist.onType(content);
  }

  function commit() {
    typist.onCommit();
  }

  var typist = {
    type: typeMessage,
    onType : function(){},
    onCommit: function(){},
  }

  return typist;
}


var agent = createOmegleChatAgent();
agent.setTypist(makeHumanTypist());
agent.startAgent();
// agent.startConversation();
// agent.write('Bonjour');
// agent.onMessage = function(message) {
//   agent.write(message);
// }





var bridgeClient = createBridgeClient();
bridgeClient.chatAgent = agent;
bridgeClient.start();