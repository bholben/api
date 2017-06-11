// To make this file work with node, we are using require instead of import.
// The require throws the "yarn build" into a different mode where it does not
// like ES6 at all.  So in this file, we are going old school and not using
// anything like arrow functions, destructuring, string interpolation, etc.

const firebase = require('../firebase');
const _ = require('lodash');

module.exports = {
  syncRemedies: syncRemedies,
  pushRemedy: pushRemedy,
  pushRemedyItem: pushRemedyItem,
  updateRemedyInventory: updateRemedyInventory,
};

function syncRemedies(callback) {
  callback = callback || function () {};
  firebase.database()
    .ref('chat/remedies')
    .orderByKey().limitToLast(100)
    .on('value', function (snap) {
      // Use lodash map to:
      //     (1) convert snap.val() object into a remedies array
      //     (2) pull the key down into the remedy object
      const remedies = _.map(snap.val(), function (remedy, key) {
        remedy.key = key;
        remedy.availableInventory = _(remedy.inventory)
          .map(function (item, key) {
            item.key = key;
            return item;
          })
          .filter('isAvailable')
          .value();
        return remedy;
        remedy.consumedInventory = _(remedy.inventory)
          .map(function (item, key) {
            item.key = key;
            return item;
          })
          .filter('isConsumed')
          .value();
      });
      callback(remedies);
    }, console.error);
}

function pushRemedy(remedy) {
  return firebase.database()
    .ref('chat/remedies')
    .push(remedy)
    .catch(function (err) {
      console.error(err);
      return Promise.reject(err);
    });
}

function pushRemedyItem(remedyId) {
  return firebase.database()
    .ref('chat/remedies/' + remedyId + '/inventory')
    .push({isAvailable: true})
    .catch(function (err) {
      console.error(err);
      return Promise.reject(err);
    });
}

function updateRemedyInventory(remedyId, remedyItemId, inventoryStatus) {

  console.log({remedyId, remedyItemId, inventoryStatus});

  return firebase.database()
    .ref('chat/remedies/' + remedyId + '/inventory/' + remedyItemId)
    .update(inventoryStatus)
    .catch(function (err) {
      console.error(err);
      return Promise.reject(err);
    });
}
