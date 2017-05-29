// To make this file work with node, we are using require instead of import.
// The require throws the "yarn build" into a different mode where it does not
// like ES6 at all.  So in this file, we are going old school and not using
// anything like arrow functions, destructuring, string interpolation, etc.

const firebase = require('../firebase');

const auth = {
  signInWithEmail: function (email, callback) {
    // Don't ever change this password or existing users will be locked out
    const password = 'password';
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(callback)
      .catch(function (err) {
        if (err.code === 'auth/user-not-found') {
          firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(callback)
            .catch(console.log);
        } else {
          console.log(err);
        }
      });
  },
};

module.exports = auth;
