#!/bin/bash
aws --no-cli-pager lambda update-function-code --function-name tapedeck-${FN} --zip-file fileb://dist/${FN}/function.zip