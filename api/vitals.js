// To make this file work with node, we are using require instead of import.
// The require throws the "yarn build" into a different mode where it does not
// like ES6 at all.  So in this file, we are going old school and not using
// anything like arrow functions, destructuring, string interpolation, etc.

const firebase = require('../firebase');

module.exports = {
  setVitals: setVitals,
  changeVitalsItem: changeVitalsItem
};

function setVitals(ticketId) {
  const initialVitals = {
    assignee:   { id: '',        name: 'Unassigned', email: '' },
    status:     { id: 'inQueue', name: 'In Queue' },
    severity:   { id: 'unknown', name: 'Unknown' },
    escalation: { id: 'agent',   name: 'Agent' },
    loyalty:    { id: 'base',    name: 'Base' },
  };
  return firebase.database()
    .ref('chat/tickets/' + ticketId + '/vitals')
    .set(initialVitals)
    .catch(function (err) {
      console.error(err);
      return Promise.reject(err);
    });
}

function changeVitalsItem(key, selected, ticketId) {
  return firebase.database()
    .ref('chat/tickets/' + ticketId + '/vitals/' + key)
    .set(selected)
    .catch(function (err) {
      console.error(err);
      return Promise.reject(err);
    });
}
