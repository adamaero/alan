
/*
 * Typist
 */

 function makeHumanTypist() {

   console.log('HumanTypist - creating new typist');

   const typeIntervalMs = 100;

   var active = false;
   var messageQueue = [];
   var currentMessage = undefined;

   function resumeWork() {
     if (!active) {
       startWork();
     }
   }

   function startWork() {
     active = true;
     work();
   }

   function stopWork() {
     active = false;
   }

   function work() {
     if (currentMessage === undefined) {
       if (messageQueue.length > 0) {
         currentMessage = messageQueue.shift();
       }
     }
     if (currentMessage !== undefined) {
       workOnCurrentMessage();
     } else {
       stopWork();
     }
   }

   function workOnCurrentMessage() {
     if (currentMessage.length === 0) {
       commit();
       currentMessage = undefined;
       work();
       return;
     }
     var char = currentMessage[0];
     currentMessage = currentMessage.substr(1);
     workOnChar(char);
   }

   function workOnChar(char) {
     typeContent(char);
     setTimeout(work, Math.random() * typeIntervalMs * 2);
   }

   function typeMessage(message) {
     messageQueue.push(message);
     resumeWork();
   }

   function typeContent(content) {
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





/*
 * Chat Agent
 */

function createOmegleChatAgent() {

  console.log('OmegleChatAgent - creating new agent');

  var domPollingIntervalId;
  var domPollingIntervalMs = 1000;

  /*
   * Commands
   */

  function startAgent() {
    console.log('OmegleChatAgent - starting agent');
    lastNumberOfMessages = 0;
    domPollingIntervalId = setInterval(refresh, domPollingIntervalMs);
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
  }

  function endConversation() {
    console.log('OmegleChatAgent - ending conversation');
    getEndButton().click();
    getEndButton().click();
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

  function getEndButton() {
    return document.querySelector('.disconnectbtn');
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

  function refresh() {
    console.log('OmegleChatAgent - refreshing');
    var conversationWasActive = conversationIsActive;
    checkConversationStatus();
    if (conversationIsActive && !conversationWasActive) {
      onConversationStarted();
    } else if (!conversationIsActive && conversationWasActive) {
      onConversationEnded();
    }
    if (conversationIsActive) {
      checkNewMessages();
    }
  }

  var conversationIsActive = false;

  function checkConversationStatus() {
    console.log('OmegleChatAgent - checking conversation status');
    if (getStartButton()) {
      conversationIsActive = false;
    } else {
      conversationIsActive = true;
    }
  }

  function onConversationStarted() {
    console.log('OmegleChatAgent - conversation started');
    omegleChatAgent.onConversationStarted();
  }

  function onConversationEnded() {
    console.log('OmegleChatAgent - conversation ended');
    omegleChatAgent.onConversationEnded();
  }

  var lastNumberOfMessages = 0;

  function checkNewMessages() {
    console.log('OmegleChatAgent - checking messages');
    var nb = getNumberOfMessages();
    if (nb > lastNumberOfMessages) {
      var message = getLastMessage();
      onNewMessage(message);
    }
    lastNumberOfMessages = nb;
  }

  function onNewMessage(message) {
    console.log('OmegleChatAgent - new message : ' + message);
    omegleChatAgent.onMessage(message);
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





/*
 * Bridge
 */

function createBridgeClient() {

  var url = 'ws://localhost:57222';
  var proto = 'alan-bridge';

  var ws;

  /*
   * Commands
   */

  function start() {
    console.log('BridgeClient - starting');
    initWebSocket();
  }

  function stop() {
    console.log('BridgeClient - stoping');
    if (ws.readyState === WebSocket.OPEN) {
      console.log('BridgeClient - WebSocket - Closing');
      ws.close();
    } else {
      onStopped();
    }
  }

  /*
   * Internals
   */

  function initWebSocket() {
    console.log('BridgeClient - WebSocket - Connecting to ' + url + ' with protocol ' + proto);
    ws = new WebSocket(url, proto);
    ws.onerror = function(err) {
      console.log('BridgeClient - WebSocket - Error :');
      console.error(err);
      onError(err);
    }
    ws.onopen = function() {
      console.log('BridgeClient - WebSocket - Open');
      onOpen();
    }
    ws.onclose = function() {
      console.log('BridgeClient - WebSocket - Closed');
      onClose();
    }
    ws.onmessage = function(msg) {
      console.log('BridgeClient - WebSocket - Message : ' + msg.data);
      onMessage(msg.data);
    }
  }

  function onError(err) {
    bridgeClient.onError(err);
    stop();
  }

  function onOpen() {
    initChatAgent();
    bridgeClient.onStarted();
    console.log('BridgeClient - started');
  }

  function onClose() {
    stop();
  }

  function onStopped() {
    bridgeClient.onStopped();
    console.log('BridgeClient - stopped');
  }

  function onMessage(message) {
    onCommand(JSON.parse(message));
  }

  function initChatAgent() {
    console.log('BridgeClient - configuring chat agent');
    bridgeClient.chatAgent.onConversationStarted = function() {
      sendCommand({
        kind: 'event',
        type: 'conversationStarted',
      });
    };
    bridgeClient.chatAgent.onConversationEnded = function() {
      sendCommand({
        kind: 'event',
        type: 'conversationEnded',
      });
    };
    bridgeClient.chatAgent.onMessage = function(message) {
      sendCommand({
        kind: 'event',
        type: 'message',
        data: message,
      });
    };
  }

  function onCommand(cmd) {
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

  function sendCommand(cmd) {
    cmd = JSON.stringify(cmd);
    console.log('BridgeClient - sending chat agent command : ' + cmd);
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(cmd);
    } else {
      console.log('BridgeClient - WebSocket - ERROR: socket is not open');
    }
  }

  var bridgeClient = {

    start: start,
    stop: stop,

    chatAgent: undefined,

    onStarted: function(){},
    onStopped: function(){},
    onError: function(){},

  };
  return bridgeClient;
}





/*
 * Bootstrap
 */

var agent = createOmegleChatAgent();
agent.setTypist(makeHumanTypist());

var bridgeClient = createBridgeClient();
bridgeClient.chatAgent = agent;
bridgeClient.onStarted = function(err) {
  agent.startAgent();
};
bridgeClient.onStopped = function(err) {
  agent.stopAgent();
};
bridgeClient.start();
