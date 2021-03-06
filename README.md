[![CircleCI](https://circleci.com/gh/jrnewton/tapedeck-api.svg?style=shield)](https://circleci.com/gh/jrnewton/tapedeck-api)

# Tapedeck API

Lambda functions deployed via AWS for [tapedeck](https://github.com/jrnewton/tapedeck).

# Repo Structure

This is a single repo containing multiple lambda functions.

The root [package.json](package.json) contains editor settings, dev-dependencies and run scripts used to build/lint/upload all code.

Each function resides in it's own directory under ./src/ and has it's own package definition which should contain dev dependencies for testing the code and dependencies for running the code.
