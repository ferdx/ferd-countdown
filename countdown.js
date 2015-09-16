module.exports = function(ferd) {
  var timeString;
  var timerInterval;
  /**
   * Listens for `countdown` or `countdown help` matches, and sends back some
   * help to the user.
   */
  ferd.listen(/^countdown\s*$|^countdown help\s*$/i, function(response) {
    var sender = response.getMessageSender();
    
    var helpString = 'Hey ' + sender.name + '! Here are the example formats for using the countdown timer:\n'
      + '> `countdown X:YY`, where `X` is a number in minutes, and `Y` is a number in seconds\n'
      + '> `countdown X minutes`, where `X` is a number\n'
      + '> `countdown Y seconds`, where `Y` is a number\n'
      + '> `countdown X minutes Y seconds`, where `X` and `Y` are numbers\n'
      + '> `countdown Xm`, where `X` is a number, and `m` represents minutes\n'
      + '> `countdown Ys`, where `Y` is a number, and `s` represents seconds\n'
      + '> `countdown Xm Ys`, where `X` and `Y` are numbers, and `m` and `s` represent minutes and seconds\n\n'
      + '> `countdown stop` stops the countdown and prints out how much time was remaining';

    response.send(helpString);
  });

  var re = /countdown\s(\d+)\s(seconds*)|countdown\s(\d+)\sminutes*\s(\d+)\sseconds*|countdown\s(\d+)\sminutes*\sand\s(\d+)\sseconds*|countdown\s(\d+)\s(minutes*)|countdown\s(\d+):(\d+)|countdown\s(\d+)m\s(\d+)s|countdown\s(\d+)([ms])/i;
  
  // re1 = /countdown\s(\d+)\s(seconds*)/i;
  // re2 = /countdown\s(\d+)\sminutes*\s(\d+)\sseconds*/i;
  // re3 = /countdown\s(\d+)\sminutes*\sand\s(\d+)\sseconds*/i;
  // re4 = /countdown\s(\d+)\s(minutes*)/i;
  // re5 = /countdown\s(\d+):(\d+)/i;
  // re6 = /countdown\s(\d+)m\s(\d+)s/i;
  // re7 = /countdown\s(\d+)([ms])/i;
  
  ferd.listen(re, function(response) {
    var sender = response.getMessageSender();
    var matches = response.match;

    var minutes;
    var seconds;

    // Determine what format the user entered and calculate the amount of seconds
    if(matches[1] && matches[2]) {
      minutes = 0;
      seconds = matches[1];
    }// 5 seconds
    else if(matches[3] && matches[4]) {
      minutes = matches[3];
      seconds = matches[4];
    }// 5 minutes 5 seconds
    else if(matches[5] && matches[6]) {
      minutes = matches[5];
      seconds = matches[6];
    }// 5 minutes and 5 seconds
    else if(matches[7] && matches[8]) {
      minutes = matches[7];
      seconds = 0;
    }// 5 minutes
    else if(matches[9] && matches[10]) {
      minutes = matches[9];
      seconds = matches[10];
    }// 5:05
    else if(matches[11] && matches[12]) {
      minutes = matches[11];
      seconds = matches[12];
    }// 5m 5s
    else if(matches[13] && matches[14]) {
      if(matches[14] === 'm') {
        minutes = matches[13];
      } else {seconds = matches[13];}
    }// 5m/s

    minutes = parseInt(minutes);
    seconds = parseInt(seconds);

    if(!minutes) {minutes = 0;}
    if(!seconds) {seconds = 0;}

    var totalSeconds = (minutes*60) + seconds;
    var timeRemaining = totalSeconds;

    var m;
    timeString = secondsToString(timeRemaining);

    /**
     * beginCountdown
     *
     * @description [description]
     * @return {[type]}
     */
    var beginCountdown = function() {
      timerInterval = setInterval(function() {
        if (timeRemaining === 0) {
          endCountdown();
        } else {
          timeRemaining = timeRemaining - 1;
          timeString = secondsToString(timeRemaining);
          response.updateMessage(m, 'Time remaining: ' + timeString);
        }
      }, 1000);
    };

    /**
     * endCountdown
     *
     * @description [description]
     * @return {[type]}
     */
    var endCountdown = function() {
      clearInterval(timerInterval);
      m.updateMessage('Time up!');
    };

    /**
     * Run the style
     */
    if (timeRemaining <= 0) {
      m = response.send('Sorry ' + sender.name + ', but you can only use numbers greater than 0 for the countdown! Type `countdown help` for valid countdown formats.');
    } else {
      m = response.send('Time remaining: ' + timeString);
      beginCountdown();
    }

  });

  ferd.listen(/countdown stop/i, function(response) {
    clearInterval(timerInterval);
    response.send('Timer stopped at ' + timeString);
  });

};

/**
 * secondsToString
 *
 * @description Takes in a number `time` in seconds and converts it to a user
 *   friendly string of format mm:ss.
 * @param {Number} time The time remaining, in seconds
 * @return {String} A stringified format of the time remaining, as mm:ss
 */
function secondsToString(time) {
  var str;
  var remainder = time % 60;
  var minutes = (time - remainder)/60;
  var mm = minutes.toString();
  var ss = remainder.toString();
  if (remainder < 10) { ss = '0' + ss; }
  return mm + ':' + ss;
}