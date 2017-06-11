module.exports = Object.assign(
  {},
  require('./tickets'),
  require('./messages'),
  require('./vitals'),
  require('./remedies'),
  { auth: require('./auth') }
);
