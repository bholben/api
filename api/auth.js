const auth = require('../firebase').auth();

auth.signInWithEmail = (email, callback) => {
  // Don't ever change this password or existing users will be locked out
  const password = 'password';
  auth.signInWithEmailAndPassword(email, password)
    .then(callback)
    .catch(err => {
      if (err.code === 'auth/user-not-found') {
        auth.createUserWithEmailAndPassword(email, password)
          .then(callback)
          .catch(console.log);
      } else {
        console.log(err);
      }
    });
};

module.exports = auth ;
