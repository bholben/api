// To make this file work with node, we are using require instead of import.
// The require throws the "yarn build" into a different mode where it does not
// like ES6 at all.  So in this file, we are going old school and not using
// anything like arrow functions, destructuring, string interpolation, etc.

const firebase = require('../firebase');

module.exports = {
  setVitals: setVitals
};

function setVitals(vitals, ticketId) {
  return firebase.database()
    .ref('chat/tickets/' + ticketId + '/vitals')
    .set(vitals)
    .catch((err) => {
      console.error(err);
      return Promise.reject(err);
    });
}
