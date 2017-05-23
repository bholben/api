const firebase = require('firebase');

var config = {
  apiKey: "AIzaSyA7wYCV8eK9hTzzgt2cLkoyiuJWQzyTdN8",
  authDomain: "chatdemo-cb58a.firebaseapp.com",
  databaseURL: "https://chatdemo-cb58a.firebaseio.com",
  projectId: "chatdemo-cb58a",
  storageBucket: "chatdemo-cb58a.appspot.com",
  messagingSenderId: "643087814740"
};
firebase.initializeApp(config);

module.exports = firebase;
