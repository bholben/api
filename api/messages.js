// To make this file work with node, we are using require instead of import.
// The require throws the "yarn build" into a different mode where it does not
// like ES6 at all.  So in this file, we are going old school and not using
// anything like arrow functions, destructuring, string interpolation, etc.

const firebase = require('../firebase');
const _ = require('lodash');

module.exports = {
  syncChatSessions: syncChatSessions,
  syncMessages: syncMessages,
  sendMessage: sendMessage,
  deleteMessage: deleteMessage
};

function syncChatSessions(user, callback) {
  callback = callback || function () {};
  user && firebase.database()
    .ref('chat/sessions')
    .orderByChild('lastTimestamp').limitToLast(100)
    .on('value', function (snap) {
      // Use DataSnapShot.prototype.forEach to guarantee orderByChild works
      const sessions = [];
      snap.forEach(function (child) {
        const session = child.val();
        session.key = child.key;
        // Use lodash map at this level since push key order is good to go
        session.messages = _.map(session.messages, function (message, key) {
          message.key = key;
          return message;
        });
        sessions.push(session);
      });

      callback(sessions.reverse());
    }, console.log);
}

function syncMessages(user, callback) {
  callback = callback || function () {};
  user && firebase.database()
    .ref('chat/sessions/' + user.uid + '/messages')
    .orderByKey().limitToLast(100)
    .on('value', function (snap) {
      // Use lodash map to:
      //     (1) convert snap.val() object into a messages array
      //     (2) pull the key down into the message object
      const messages = _.map(snap.val(), function (message, key) {
        message.key = key;
        return message;
      });
      callback(messages);
    }, console.log);
}

function sendMessage(message, user, sessionKey) {
  if (message.agent) {
    message.agent.displayName = message.agent.displayName || 'Anonymous Agent';
  }
  const uid = sessionKey || user.uid;  // If agent, don't use their user.uid
  const timestamp = firebase.database.ServerValue.TIMESTAMP;
  const stampedMessage = Object.assign({}, message, { timestamp: timestamp });
  return firebase.database()
    .ref('chat/sessions/' + user.uid + '/messages')
    .push(stampedMessage)
    .then(function () {
      return !sessionKey ? setUser(user) : Promise.resolve();
    })
    .then(function () {
      setLastTimestamp(uid, timestamp);
    })
    .catch(console.log);
}

function deleteMessage(message, user, sessionKey) {
  const uid = sessionKey || user.uid;  // If agent, don't use their user.uid
  return firebase.database()
    .ref('chat/sessions/' + user.uid + '/messages/' + message.key)
    .remove()
    .then(function () {
      revertTimestamp(uid);
    })
    .catch(console.log);
}


// Private helper functions

function setUser(user) {
  return firebase.database()
    .ref('chat/sessions/' + user.uid + '/user')
    .update({
      displayName: user.displayName || 'Anonymous',
      email: user.email,
      uid: user.uid,
    });
}

function setLastTimestamp(uid, timestamp) {
  return firebase.database()
    .ref('chat/sessions/' + uid)
    .child('lastTimestamp')
    .set(timestamp);
}

function revertTimestamp(uid) {
  return firebase.database()
    .ref('chat/sessions/' + uid + '/messages')
    .orderByKey().limitToLast(1)
    .once('value', function (snap) {
      snap.forEach(function (message) {
        // Loop of one message :)
        return firebase.database()
          .ref('chat/sessions/' + uid)
          .child('lastTimestamp')
          .set(message.val().timestamp);
      });
    }, console.log);

}
