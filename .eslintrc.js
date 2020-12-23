'use strict';

module.exports = {
  env: {
    commonjs: true,
    es2020: true,
    node: true,
    mocha: true
  },
  extends: ['eslint:recommended', 'prettier'],
  rules: {
    'strict': 'error',
    'semi': 'error',
    'prettier/prettier': 'error'
  },
  plugins: ['prettier']
};
