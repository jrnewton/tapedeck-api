'use strict';

console.log('Loading function');

exports.handler = async () => {
  return 'Hello there. Your random number is ' + Math.random();
};
