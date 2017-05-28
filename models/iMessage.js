const { isString, isNumber, isBoolean, isPlainObject } = require('lodash');

module.exports = { isValid };

// Poor man's validator for now
function isValid(message) {
  return isString(message.user.displayName) &&
    isString(message.user.uid) &&
    isString(message.text) &&
    (isBoolean(message.isAgent) || message.isAgent === undefined);
}
