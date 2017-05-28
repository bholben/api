const firebase = require('firebase');
const { map } = require('lodash');
const { iMessage } = require('../models');

module.exports = { syncChatSessions, syncMessages, sendMessage, deleteMessage };

function syncChatSessions(user, callback=()=>{}) {
  user && firebase.database()
    .ref('users')
    .orderByChild('lastTimestamp').limitToLast(100)
    .on('value', snap => {
      // Use DataSnapShot.prototype.forEach to guarantee orderByChild works
      const sessions = [];
      snap.forEach(child => {
        const session = child.val();
        session.key = child.key;
        // Use lodash map at this level since push key order is good to go
        session.messages = map(session.messages, (message, key) => {
          message.key = key;
          return message;
        });
        sessions.push(session);
      });

      callback(sessions.reverse());
    }, console.log);
}

function syncMessages(user, callback=()=>{}) {
  user && firebase.database()
    .ref(`users/${user.uid}/messages`)
    .orderByKey().limitToLast(100)
    .on('value', snap => {
      // Use lodash map to:
      //     (1) convert snap.val() object into a messages array
      //     (2) pull the key down into the message object
      const messages = map(snap.val(), (message, key) => {
        message.key = key;
        return message;
      });
      callback(messages);
    }, console.log);
}

function sendMessage(message, user, sessionKey) {
  console.log({sessionKey});
  if (iMessage.isValid(message)) {
    const timestamp = firebase.database.ServerValue.TIMESTAMP;
    const stampedMessage = Object.assign({}, message, { timestamp });
    return firebase.database()
      // .ref(`users/${user.uid}/messages`)
      .ref(`users/${sessionKey || user.uid}/messages`)
      .push(stampedMessage)
      .then(() => {
        firebase.database()
          // .ref(`users/${user.uid}`)
          .ref(`users/${sessionKey || user.uid}`)
          .child('lastTimestamp')
          .set(timestamp);
      })
      .catch(console.log);
  } else {
    return Promise.reject('Invalid message object');
  }
}

function deleteMessage(message, user) {
  // TODO: Update the lastTimestamp
  return firebase.database()
    .ref(`users/${user.uid}/messages/${message.key}`)
    .remove()
    .catch(console.log);
}
