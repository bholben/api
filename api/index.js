module.exports = Object.assign(
  {},
  require('./messages'),
  { auth: require('../firebase').auth() }
);
