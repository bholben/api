const { isString, isNumber, isBoolean, isPlainObject } = require('lodash');

module.exports = { isValid };

// Poor man's validator for now
function isValid(message) {
  return isString(message.displayName) &&
    isString(message.text) &&
    (isNumber(message.timestamp) || isPlainObject(message.timestamp)) &&
    (isBoolean(message.isAgent) || message.isAgent === undefined);
}
