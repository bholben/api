const firebase = require('firebase');
const { map } = require('lodash');
const { iMessage } = require('../models');

module.exports = { syncMessages, syncChatSessions, sendMessage, deleteMessage };

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
        // Use lodash map at this level since order is not in play (its cleaner)
        session.messages = map(session.messages, (message, key) => {
          message.key = key;
          return message;
        });
        sessions.push(session);
      });

      callback(sessions.reverse());
    }, console.log);
}

function sendMessage(message, user) {
  return iMessage.isValid(message) && firebase.database()
    .ref(`users/${user.uid}/messages`)
    .push(message)
    .then(() => {
      firebase.database()
        .ref(`users/${user.uid}`)
        .child('lastTimestamp')
        .set(message.timestamp);
    })
    .catch(console.log);
}

function deleteMessage(message, user) {
  return firebase.database()
    .ref(`users/${user.uid}/messages/${message.key}`)
    .remove()
    .catch(console.log);
}
