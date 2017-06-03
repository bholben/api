module.exports = Object.assign(
  {},
  require('./tickets'),
  require('./messages'),
  require('./vitals'),
  { auth: require('./auth') }
);
