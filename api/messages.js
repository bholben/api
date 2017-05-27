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
    .orderByKey().limitToLast(100)
    .on('value', snap => {
      // Use lodash map to:
      //     (1) convert snap.val() object into a sessions array
      //     (2) pull the key down into the session object
      //     (3) do the same for messages inside each session
      const sessions = map(snap.val(), (session, key) => {
        session.key = key;
        session.messages = map(session.messages, (message, key) => {
          message.key = key;
        });
        return session;
      });
      callback(sessions);
    }, console.log);
}

function sendMessage(message, user) {
  return iMessage.isValid(message) && firebase.database()
    .ref(`users/${user.uid}/messages`)
    .push(message)
    .catch(console.log);
}

function deleteMessage(message, user) {
  return firebase.database()
    .ref(`users/${user.uid}/messages/${message.key}`)
    .remove()
    .catch(console.log);
}
