
module.exports = {

  create: function() {

    console.log('ChatBot - creating new chat bot');

    /*
     * Commands
     */

    function start() {
      console.log('ChatBot - starting');
      startConversation();
      console.log('ChatBot - started');
    }

    function stop() {
      console.log('ChatBot - stopping');
      console.log('ChatBot - stopped');
    }

    function restart() {
      stop();
      start();
    }

    /*
     * Events
     */

    function conversationStarted() {
      console.log('ChatBot - conversationStarted');
      write('Bonjour');
    }

    function conversationEnded() {
      console.log('ChatBot - conversationEnded');
      startConversation();
    }

    function message(message) {
      console.log('ChatBot - message : ' + message);
      write(message);
      endConversation();
    }

    /*
     * Actions
     */

    function startConversation() {
      console.log('ChatBot - starting conversation');
      chatBot.onStartConversation();
    }

    function endConversation() {
      console.log('ChatBot - ending conversation');
      chatBot.onEndConversation();
    }

    function write(message) {
      console.log('ChatBot - writing : ' + message);
      chatBot.onWrite(message);
    }

    var chatBot = {

      start: start,
      stop: stop,
      restart: restart,

      conversationStarted: conversationStarted,
      conversationEnded: conversationEnded,

      message: message,

      onStartConversation: function(){},
      onEndConversation: function(){},

      onWrite: function(message){},

    }

    return chatBot;
  }

};
