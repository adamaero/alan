
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

var typist = makeHumanTypist();

typist.onType = function(content) {
  process.stdout.write(content);
}
typist.onCommit = function() {
  console.log();
  console.log('done');
}

typist.type('hello my name is alan, nice to meet you');
