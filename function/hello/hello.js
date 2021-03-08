'use strict';

console.log('Loading function');

exports.handler = async (_event, _context) => {
  console.log('Invoking function');
  return 'Hello there. Your random number is ' + Math.random();
};
