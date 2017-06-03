// To make this file work with node, we are using require instead of import.
// The require throws the "yarn build" into a different mode where it does not
// like ES6 at all.  So in this file, we are going old school and not using
// anything like arrow functions, destructuring, string interpolation, etc.

const firebase = require('../firebase');
const _ = require('lodash');

module.exports = {
  syncTickets: syncTickets
};

function syncTickets(user, callback) {
  callback = callback || function () {};
  user && firebase.database()
    .ref('chat/tickets')
    .orderByChild('lastTimestamp').limitToLast(100)
    .on('value', function (snap) {
      // Use DataSnapShot.prototype.forEach to guarantee orderByChild works
      const tickets = [];
      snap.forEach(function (child) {
        const session = child.val();
        session.key = child.key;
        // Use lodash map at this level since push key order is good to go
        session.messages = _.map(session.messages, function (message, key) {
          message.key = key;
          return message;
        });
        tickets.push(session);
      });

      callback(tickets.reverse());
    }, console.error);
}
