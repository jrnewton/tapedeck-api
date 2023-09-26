[![CircleCI](https://circleci.com/gh/jrnewton/tapedeck-api.svg?style=shield)](https://circleci.com/gh/jrnewton/tapedeck-api)

# Tapedeck API

Lambda functions deployed via AWS for [tapedeck](https://github.com/jrnewton/tapedeck).

# Repo Structure

This is a single repo containing multiple lambda functions.

The root [package.json](package.json) contains

- editor settings and related dev-dependencies

Each function

- resides in it's own directory under ./function/
- has it's own package file with runtime dependencies
  and dev-dependencies used to test/lint.

# Architecture

The app can archive an M3U end to end with the following service flow:

* function/request -> receive GET request from https://tapedeck.us/capture, do simple validatation and write data to DynamoDB.
* function/process-ddb-stream -> convert DynamoDB insert events to SQS messages.
* function/archive2 -> Process SQS messages, streaming each object to an S3 bucket for the user (aka "subject").
* function/process-s3 -> Update DynamoDB based on S3 events (Eg set status from "in-progress" to "complete").