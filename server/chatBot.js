
var ngram = require('simple-ngram-markov');
var fs = require('fs');


module.exports = {

  create: function() {

    console.log('ChatBot - creating new chat bot');

    /*
     * Commands
     */

    var started = false;

    function start() {
      console.log('ChatBot - starting');
      initNgramModel();
      startConversation();
      started = true;
      console.log('ChatBot - started');
    }

    function stop() {
      console.log('ChatBot - stopping');
      saveNgramModel();
      started = false;
      console.log('ChatBot - stopped');
    }

    function restart() {
      if (started) {
        stop();
      }
      start();
    }

    /*
     * Events
     */

    var messagesSinceConversationStarted = 0;

    function conversationStarted() {
      messagesSinceConversationStarted = 0;
      console.log('ChatBot - conversationStarted');
      write('Bonjour');
    }

    function conversationEnded() {
      console.log('ChatBot - conversationEnded');
      startConversation();
    }

    function message(message) {
      console.log('ChatBot - message : ' + message);

      addSentenceToModel(message);

      messagesSinceConversationStarted += 1;
      console.log(messagesSinceConversationStarted);

      if(messagesSinceConversationStarted % 3 === 2) {
        write('Je suis un robot qui apprend, parler sil vous plait');
      } else {
        var sentence = '';
        while (!sentence.trim()) {
          sentence = getSentence();
        }
        write(sentence);
      }
    }

    /*
     * N-grams
     */

    const dbFilePath = 'db.txt';

    var ngramModel;
    var sentences = [];

    function initNgramModel() {
      loadSentences();
      recreateNgramModel();
    }

    function saveNgramModel() {
      writeSentences();
    }

    function loadSentences() {
      var content = fs.readFileSync(dbFilePath, {encoding: 'utf8'});
      sentences = content.split('\n');
    }

    function writeSentences() {
      fs.writeFile(dbFilePath, sentences.join('\n'));
    }

    function recreateNgramModel() {
      var length = getMeanSentenceSize();
      console.log('ChatBot - ngram - recreating model with length: ' + length);
      ngramModel = ngram.createModel({
        length: length,
      });
      for(var i in sentences) {
        ngram.addSentenceToModel(ngramModel, sentences[i]);
      }
    }

    function getSentenceSize(sentence) {
      return sentence.split(' ').length;
    }

    function getMeanSentenceSize() {
      var size = 0;
      for (var i in sentences) {
        size += getSentenceSize(sentences[i]);
      }
      return Math.floor(size/sentences.length);
    }

    function getMaxSentenceSize() {
      var max = 0;
      for (var i in sentences) {
        var size = getSentenceSize(sentences[i]);
        if (size > max) {
          max = size;
        }
      }
      return max;
    }

    function addSentenceToModel(sentence) {
      sentences.push(sentence);
      recreateNgramModel();
    }

    function getSentence() {
      var mean = getMeanSentenceSize();
      var max = getMaxSentenceSize();
      var size = Math.random() * max + mean;
      return ngram.generateSentence(ngramModel, size);
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
