const firebase = require('../firebase');
const { map } = require('lodash');

module.exports = { syncChatSessions, syncMessages, sendMessage, deleteMessage };

function syncChatSessions(user, callback=()=>{}) {
  user && firebase.database()
    .ref('chat/sessions')
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
    .ref(`chat/sessions/${user.uid}/messages`)
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
  if (message.agent) {
    message.agent.displayName = message.agent.displayName || 'Anonymous Agent';
  }
  const uid = sessionKey || user.uid;  // If agent, don't use their user.uid
  const timestamp = firebase.database.ServerValue.TIMESTAMP;
  const stampedMessage = Object.assign({}, message, { timestamp });
  return firebase.database()
    .ref(`chat/sessions/${uid}/messages`)
    .push(stampedMessage)
    .then(() => !sessionKey ? setUser(user) : Promise.resolve())
    .then(() => setLastTimestamp(uid, timestamp))
    .catch(console.log);
}

function deleteMessage(message, user, sessionKey) {
  const uid = sessionKey || user.uid;  // If agent, don't use their user.uid
  return firebase.database()
    .ref(`chat/sessions/${uid}/messages/${message.key}`)
    .remove()
    .then(() => revertTimestamp(uid))
    .catch(console.log);
}


// Private helper functions

function setUser(user) {
  return firebase.database()
    .ref(`chat/sessions/${user.uid}/user`)
    .update({
      displayName: user.displayName || 'Anonymous',
      email: user.email,
      uid: user.uid,
    });
}

function setLastTimestamp(uid, timestamp) {
  return firebase.database()
    .ref(`chat/sessions/${uid}`)
    .child('lastTimestamp')
    .set(timestamp);
}

function revertTimestamp(uid) {
  return firebase.database()
    .ref(`chat/sessions/${uid}/messages`)
    .orderByKey().limitToLast(1)
    .once('value', snap => {
      snap.forEach(message => {
        // Loop of one message :)
        return firebase.database()
          .ref(`chat/sessions/${uid}`)
          .child('lastTimestamp')
          .set(message.val().timestamp);
      });
    }, console.log);

}
