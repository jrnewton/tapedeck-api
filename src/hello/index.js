'use strict';

console.log('Loading function');

exports.handler = async () => {
  return 'Hello tapedeck. Random number=' + Math.random();
};
