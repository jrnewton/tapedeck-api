[![CircleCI](https://circleci.com/gh/jrnewton/tapedeck-api.svg?style=shield)](https://circleci.com/gh/jrnewton/tapedeck-api)

# Tapedeck API

Lambda functions deployed via AWS for [tapedeck](https://github.com/jrnewton/tapedeck).

# Repo Structure

This is a single repo containing multiple lambda functions.

The root [package.json](package.json) contains

- editor settings
- dev-dependencies and npm scripts used to lint/build/test all functions.

Each function

- resides in it's own directory under ./function/
- has it's own package file with runtime dependencies
