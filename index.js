

function createOmegleChatClient() {

  function getMsgBox() {
    var textarea = document.querySelector('textarea');
    return textarea;
  }

  function getSumbitBtn() {
    var submitBtn = document.querySelector('.sendbtn');
    return submitBtn;
  }

  function getNewBtn() {
    var btn = document.querySelector('.newchatbtnwrapper img');
    return btn;
  }

  function setMsg(msg) {
    getMsgBox().value = msg;
  }

  function submitMsg() {
    getSumbitBtn().click();
  }

  function sendMsg(msg) {
    console.log('OmegleChatClient : sending message : ' + msg);
    for(var i=0 ; i<msg.length ; i++) {
      (function (i) {
        setTimeout(function() {
          setMsg(msg.substr(0,i+1));
          if (i === msg.length-1) {
            submitMsg();
          }
        }, 100*i);
      }) (i)
    }
  }

  function getNumMsg() {
    var items = document.querySelectorAll('.strangermsg');
    var nbItems = items.length;
    return nbItems;
  }

  var gNbMsg = 0;

  function checkNewMsg() {
    var nb = getNumMsg();
    if (nb > gNbMsg) {
      var msg = getLastMsg();
      console.log('OmegleChatClient - new message : ' + msg);
      OmegleChatClient.onNewMsg(msg);
    }
    gNbMsg = nb;
  }

  function checkEnd() {
    var item = getNewBtn();
    if (item) {
      console.log('OmegleChatClient - end detected');
      OmegleChatClient.stop();
      OmegleChatClient.onEnd();
    }
  }

  function getLastMsg() {
    var items = document.querySelectorAll('.strangermsg span')
    var item = items[items.length-1];
    var text = item.innerHTML;
    return text;
  }

  var interval;

  function start() {
    console.log('OmegleChatClient - start');
    interval = setInterval(function() {
      console.log('OmegleChatClient - update');
      checkEnd();
      checkNewMsg();
    }, 1000);
  }

  function stop() {
    console.log('OmegleChatClient - stop');
    clearInterval(interval);
  }

  function end() {
    console.log('OmegleChatClient - ending');
  }

  function startNew() {
    getNewBtn().click();
  }

  var OmegleChatClient = {
    start: start,
    stop: stop,
    end: end,
    sendMsg: sendMsg,
    startNew: startNew,
    onNewMsg: function(){},
    onEnd: function(){},
  };

  return OmegleChatClient;
}


function CreateChatBot() {

  function start() {
    console.log('ChatBot - start');
    ChatBot.chatClient.onNewMsg = onNewMsg;
    ChatBot.chatClient.onEnd = onEnd;
    ChatBot.chatClient.start();
    initConversation();
    continu();
  }

  function stop() {
    console.log('ChatBot - stop');
    ChatBot.chatClient.stop();
  }

  function onNewMsg(msg) {
    console.log('ChatBot - new msg : ' + msg);
    msgs.push({
      sender: 'stranger',
      msg: msg,
    });
    continu();
  }

  function onEnd() {
    console.log('ChatBot - ended');
    stop();
    ChatBot.chatClient.startNew();
    start();
  }

  function send(msg) {
    console.log('ChatBot - sending : ' + msg);
    msgs.push({
      sender: 'you',
      msg: msg,
    });
    ChatBot.chatClient.sendMsg(msg);
  }

  function continu() {
    console.log('ChatBot - continu');
    var msg = findNextMsg();
    send(msg);
  }

  var msgs = [];
  var i = 0;

  function initConversation() {
    msgs = [];
    i = 0;
  }

  function findNextMsg() {
    i++;
    if (i == 1) {
      return 'bonjour';
    }
    if (i == 2) {
      return 'comment ça va ?';
    }
    if (i == 3) {
      return 'moi ça va bien, tu as quel age ?';
    }
    if (i == 4) {
      return 'je suis un robot';
    }
    if (i == 5) {
      return 'beep';
    }
    if (i == 6) {
      return 'beep beep';
    }
    return Math.random()+"";
  }

  var ChatBot = {
    chatClient: undefined,
    start: start,
    stop: stop,
  };

  return ChatBot;
}



var OmegleChatClient = createOmegleChatClient();

var ChatBot = CreateChatBot();

ChatBot.chatClient = OmegleChatClient;
ChatBot.start();
