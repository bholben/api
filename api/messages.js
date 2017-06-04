// To make this file work with node, we are using require instead of import.
// The require throws the "yarn build" into a different mode where it does not
// like ES6 at all.  So in this file, we are going old school and not using
// anything like arrow functions, destructuring, string interpolation, etc.

const firebase = require('../firebase');
const _ = require('lodash');

module.exports = {
  syncMessages: syncMessages,
  pushMessage: pushMessage,
  deleteMessage: deleteMessage
};

function syncMessages(user, callback) {
  callback = callback || function () {};
  user && firebase.database()
    .ref('chat/tickets/' + user.uid + '/messages')
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
    }, console.error);
}

function pushMessage(message, user, ticketId) {
  // ticketId is not yet available with user's first message
  const uid = ticketId || user.uid;
  const timestamp = firebase.database.ServerValue.TIMESTAMP;
  const stampedMessage = Object.assign({}, message, { timestamp: timestamp });

  return firebase.database()
    .ref('chat/tickets/' + uid + '/messages')
    .push(stampedMessage)
    .then(function () {
      return !ticketId ? updateUser(user) : Promise.resolve();
    })
    .then(function () {
      return setLastTimestamp(uid, timestamp);
    })
    .catch(function (err) {
      console.error(err);
      return Promise.reject(err);
    });
}

function deleteMessage(message, user, ticketId) {
  return firebase.database()
    .ref('chat/tickets/' + ticketId + '/messages/' + message.key)
    .remove()
    .then(function () {
      revertTimestamp(ticketId);
    })
    .catch(function (err) {
      console.error(err);
      return Promise.reject(err);
    });
}


// Private helper functions

function updateUser(user) {
  return firebase.database()
    .ref('chat/tickets/' + user.uid + '/user')
    .update({
      displayName: user.displayName || 'Anonymous',
      email: user.email,
      uid: user.uid,
    });
}

function setLastTimestamp(uid, timestamp) {
  return firebase.database()
    .ref('chat/tickets/' + uid)
    .child('lastTimestamp')
    .set(timestamp);
}

function revertTimestamp(uid) {
  return firebase.database()
    .ref('chat/tickets/' + uid + '/messages')
    .orderByKey().limitToLast(1)
    .once('value', function (snap) {
      snap.forEach(function (message) {
        // Loop of one message :)
        return firebase.database()
          .ref('chat/tickets/' + uid)
          .child('lastTimestamp')
          .set(message.val().timestamp);
      });
    }, console.error);

}
